import { z } from 'zod';

import type { AppLocale } from '@towelbooks/schemas';

import {
  ApiRequestError,
  type ApiProblemResponse,
} from './errors/api-request-error.js';
import { parseApiError } from './errors/parse-api-error.js';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type TransportRequestFailure = {
  error: ApiRequestError;
  isRetry: boolean;
  method?: string;
  path: string;
};

type RequestFailureHandler = (
  failure: TransportRequestFailure,
) => void | boolean | Promise<void | boolean>;

export type TransportConfig = {
  baseUrl: string;
  getAuthToken?: () => string | null | undefined;
  getLocale?: () => AppLocale | null | undefined;
  onRequestFailure?: RequestFailureHandler;
  fetchImpl?: typeof fetch;
};

type QueryValue = string | number | boolean | string[] | undefined | null;

type RawRequestOptions = {
  method?: HttpMethod;
  path: string;
  pathParams?: Record<string, string>;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
};

export type RequestOptions<T> = RawRequestOptions & {
  schema: z.ZodType<T>;
};

export type ExternalUploadInput = {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  body: Blob | ArrayBuffer;
};

export type ExternalPostFormInput = {
  url: string;
  fields: Record<string, string>;
  fileFieldName: string;
  body: Blob | ArrayBuffer;
};

export type Transport = {
  request<T>(options: RequestOptions<T>): Promise<T>;
  requestBinary(options: RawRequestOptions): Promise<Blob>;
  requestVoid(options: RawRequestOptions): Promise<void>;
  resolveRedirectUrl(options: RawRequestOptions): Promise<string>;
  putExternal(input: ExternalUploadInput): Promise<void>;
  postExternalForm(input: ExternalPostFormInput): Promise<void>;
};

function buildUrl(
  baseUrl: string,
  path: string,
  pathParams?: Record<string, string>,
  query?: Record<string, QueryValue>,
): string {
  const interpolated = pathParams
    ? path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, key: string) => {
        const value = pathParams[key];
        if (value === undefined) {
          throw new Error(`Missing path parameter "${key}" for "${path}"`);
        }
        return encodeURIComponent(value);
      })
    : path;

  const isAbsolute = /^https?:\/\//i.test(interpolated);
  const base = isAbsolute
    ? interpolated
    : `${baseUrl}${interpolated.startsWith('/') ? '' : '/'}${interpolated}`;

  if (!query) {
    return base;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, String(entry));
      }
      continue;
    }

    params.set(key, String(value));
  }

  const queryString = params.toString();

  if (queryString.length === 0) {
    return base;
  }

  return `${base}${base.includes('?') ? '&' : '?'}${queryString}`;
}

function buildHeaders(
  customHeaders: Record<string, string> | undefined,
  body: unknown,
  authToken: string | null | undefined,
  locale: AppLocale | null | undefined,
): Headers {
  const headers = new Headers(customHeaders);

  if (authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (locale && !headers.has('Accept-Language')) {
    headers.set('Accept-Language', locale);
  }

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;
  const isUrlSearchParams = body instanceof URLSearchParams;
  const isStream =
    typeof ReadableStream !== 'undefined' && body instanceof ReadableStream;

  if (
    body !== undefined &&
    body !== null &&
    !isFormData &&
    !isUrlSearchParams &&
    !isStream &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

function shouldAttachAuthTokenToExternalUrl(
  baseUrl: string,
  externalUrl: string,
): boolean {
  try {
    return new URL(externalUrl, baseUrl).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body as BodyInit;
  }

  return JSON.stringify(body);
}

async function performFetch(
  config: TransportConfig,
  options: RawRequestOptions,
): Promise<Response> {
  const url = buildUrl(
    config.baseUrl,
    options.path,
    options.pathParams,
    options.query,
  );
  const headers = buildHeaders(
    options.headers,
    options.body,
    config.getAuthToken?.(),
    config.getLocale?.(),
  );
  const fetchImpl = config.fetchImpl ?? fetch;

  return fetchImpl(url, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
    body: serializeBody(options.body),
  });
}

async function reportFailure(
  config: TransportConfig,
  options: RawRequestOptions,
  error: ApiRequestError,
  isRetry: boolean,
): Promise<boolean> {
  if (!config.onRequestFailure) {
    return false;
  }

  try {
    return (
      (await config.onRequestFailure({
        error,
        isRetry,
        method: options.method,
        path: buildUrl(
          config.baseUrl,
          options.path,
          options.pathParams,
          options.query,
        ),
      })) === true
    );
  } catch {
    // Failure reporting must never replace the request error or leave the
    // caller waiting on a broken refresh/telemetry hook.
    return false;
  }
}

async function executeRequest(
  config: TransportConfig,
  options: RawRequestOptions,
): Promise<Response> {
  let isRetry = false;

  while (true) {
    let response: Response;

    try {
      response = await performFetch(config, options);
    } catch (error) {
      const apiError = ApiRequestError.fromParsed(await parseApiError(error));
      const shouldRetry =
        !isRetry && (await reportFailure(config, options, apiError, isRetry));

      if (shouldRetry) {
        isRetry = true;
        continue;
      }

      if (isRetry) {
        await reportFailure(config, options, apiError, true);
      }
      throw apiError;
    }

    if (!response.ok) {
      const apiError = ApiRequestError.fromParsed(
        await parseApiError(response),
      );
      const shouldRetry =
        !isRetry && (await reportFailure(config, options, apiError, isRetry));

      if (shouldRetry) {
        isRetry = true;
        continue;
      }

      if (isRetry) {
        await reportFailure(config, options, apiError, true);
      }
      throw apiError;
    }

    return response;
  }
}

async function readJsonBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('Content-Type');

  if (!contentType?.toLowerCase().includes('json')) {
    return undefined;
  }

  return response.json();
}

function buildMalformedProblem(
  status: number,
  message: string,
): ApiProblemResponse {
  return {
    type: 'https://api.towelbooks.com/problems/internal-error',
    title: 'Malformed response',
    status,
    code: 'INTERNAL_ERROR',
    detail: message,
    requestId: 'unknown',
  };
}

export function createTransport(config: TransportConfig): Transport {
  return {
    async request<T>(options: RequestOptions<T>): Promise<T> {
      const response = await executeRequest(config, options);
      const data = await readJsonBody(response);

      const parsed = options.schema.safeParse(data);

      if (!parsed.success) {
        const apiError = new ApiRequestError(
          response.status,
          buildMalformedProblem(
            response.status,
            'The server returned an unexpected response shape.',
          ),
          {
            cause: parsed.error,
            kind: 'malformed',
            requestId:
              response.headers.get('X-Request-Id')?.trim() || 'unknown',
          },
        );
        await reportFailure(config, options, apiError, false);
        throw apiError;
      }

      return parsed.data;
    },
    async requestBinary(options: RawRequestOptions): Promise<Blob> {
      const response = await executeRequest(config, options);
      return response.blob();
    },
    async requestVoid(options: RawRequestOptions): Promise<void> {
      await executeRequest(config, options);
    },
    async resolveRedirectUrl(options: RawRequestOptions): Promise<string> {
      const url = buildUrl(
        config.baseUrl,
        options.path,
        options.pathParams,
        options.query,
      );
      const headers = buildHeaders(
        options.headers,
        options.body,
        config.getAuthToken?.(),
        config.getLocale?.(),
      );
      const fetchImpl = config.fetchImpl ?? fetch;

      let response: Response;

      try {
        response = await fetchImpl(url, {
          method: options.method ?? 'POST',
          credentials: 'include',
          headers,
          body: serializeBody(options.body),
          redirect: 'manual',
        });
      } catch (error) {
        const apiError = ApiRequestError.fromParsed(await parseApiError(error));
        await reportFailure(config, options, apiError, false);
        throw apiError;
      }

      if (response.status < 300 || response.status >= 400) {
        const apiError = ApiRequestError.fromParsed(
          await parseApiError(response),
        );
        await reportFailure(config, options, apiError, false);
        throw apiError;
      }

      const location = response.headers.get('Location');

      if (!location) {
        const apiError = new ApiRequestError(
          response.status,
          buildMalformedProblem(
            response.status,
            'Redirect response is missing a Location header.',
          ),
          {
            requestId:
              response.headers.get('X-Request-Id')?.trim() || 'unknown',
          },
        );
        await reportFailure(config, options, apiError, false);
        throw apiError;
      }

      return location;
    },
    async putExternal(input: ExternalUploadInput): Promise<void> {
      const fetchImpl = config.fetchImpl ?? fetch;
      const headers = buildHeaders(
        input.headers,
        input.body,
        shouldAttachAuthTokenToExternalUrl(config.baseUrl, input.url)
          ? config.getAuthToken?.()
          : null,
        undefined,
      );

      let response: Response;

      try {
        response = await fetchImpl(input.url, {
          body: input.body,
          credentials: 'omit',
          headers,
          method: input.method,
        });
      } catch (error) {
        throw ApiRequestError.fromParsed(await parseApiError(error));
      }

      if (!response.ok) {
        throw new Error(
          `External upload failed with status ${response.status}`,
        );
      }
    },
    async postExternalForm(input: ExternalPostFormInput): Promise<void> {
      const fetchImpl = config.fetchImpl ?? fetch;
      const form = new FormData();

      for (const [name, value] of Object.entries(input.fields)) {
        form.append(name, value);
      }
      // S3-compatible signed POST policies require the file field to be appended last.
      const fileBlob =
        input.body instanceof Blob ? input.body : new Blob([input.body]);
      form.append(input.fileFieldName, fileBlob);

      let response: Response;

      try {
        response = await fetchImpl(input.url, {
          body: form,
          credentials: 'omit',
          method: 'POST',
        });
      } catch (error) {
        throw ApiRequestError.fromParsed(await parseApiError(error));
      }

      if (!response.ok) {
        throw new Error(
          `External upload failed with status ${response.status}`,
        );
      }
    },
  };
}
