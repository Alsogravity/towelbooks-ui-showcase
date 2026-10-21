import { ErrorCode, isApiProblem, type ApiProblem } from '@towelbooks/schemas';

export type FrontendErrorCode =
  ApiProblem['code'] | 'NETWORK_ERROR' | 'TIMEOUT_ERROR';

/**
 * The server only ever exposes flat `details`: primitives, or arrays of
 * primitives. The SDK pins the same shape so a future server change that
 * attaches a nested object — the vector for leaking internal context like
 * `stack`/`query`/`cause` — cannot reach UI code through this field.
 */
export type ApiProblemDetailPrimitive = string | number | boolean | null;

export type ApiProblemDetailValue =
  ApiProblemDetailPrimitive | readonly ApiProblemDetailPrimitive[];

export type ApiProblemResponse = Omit<ApiProblem, 'code' | 'details'> & {
  code: FrontendErrorCode;
  details?: Record<string, ApiProblemDetailValue> | null;
};

const INTERNAL_LOOKING_DETAIL_KEYS = new Set([
  'cause',
  'query',
  'stack',
  'sql',
  'trace',
]);

function isPrimitiveDetailValue(
  value: unknown,
): value is ApiProblemDetailPrimitive {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function isAllowedDetailValue(value: unknown): value is ApiProblemDetailValue {
  if (isPrimitiveDetailValue(value)) {
    return true;
  }

  return Array.isArray(value) && value.every(isPrimitiveDetailValue);
}

function isInternalLookingKey(key: string): boolean {
  return INTERNAL_LOOKING_DETAIL_KEYS.has(key.toLowerCase());
}

function warnInternalDetailKey(key: string): void {
  if (
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV === 'production'
  ) {
    return;
  }

  console.warn(
    `[towelbooks-sdk] dropping internal-looking key "${key}" from API error details.`,
  );
}

/**
 * Keeps only flat primitive entries from a server `details` object, dropping
 * nested objects/arrays and any internal-looking keys (and warning about the
 * latter outside production).
 */
export function sanitizeApiProblemDetails(
  details: unknown,
): Record<string, ApiProblemDetailValue> | null {
  if (details === null) {
    return null;
  }

  if (typeof details !== 'object' || Array.isArray(details)) {
    return null;
  }

  const sanitized: Record<string, ApiProblemDetailValue> = {};

  for (const [key, value] of Object.entries(details)) {
    if (isInternalLookingKey(key)) {
      warnInternalDetailKey(key);
      continue;
    }

    if (isAllowedDetailValue(value)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export type ParsedApiErrorKind =
  'problem' | 'malformed' | 'network' | 'timeout';

export type ParsedApiError = {
  kind: ParsedApiErrorKind;
  problem: ApiProblemResponse;
  requestId: string;
  status: number;
  cause?: unknown;
};

const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
const TIMEOUT_ERROR_CODE = 'TIMEOUT_ERROR';
const genericNetworkMessages = new Set([
  'Failed to fetch',
  'Load failed',
  'Network request failed',
]);

export function problemTypeFromCode(code: string): string {
  return `https://api.towelbooks.com/problems/${code.toLowerCase().replaceAll('_', '-')}`;
}

export function isProblemJsonContentType(contentType: string | null): boolean {
  return (
    contentType?.toLowerCase().includes('application/problem+json') ?? false
  );
}

function getProblemMessage(problem: ApiProblemResponse): string {
  const detail = problem.detail?.trim();

  if (detail && detail.length > 0) {
    return detail;
  }

  return problem.title;
}

export function getRequestId(
  headerRequestId: string | null,
  bodyRequestId?: string | null,
): string {
  const requestId = headerRequestId?.trim() || bodyRequestId?.trim();

  return requestId && requestId.length > 0 ? requestId : 'unknown';
}

export function getFallbackProblemForStatus(
  status: number,
  requestId: string,
): ApiProblemResponse {
  switch (status) {
    case 400:
      return {
        type: problemTypeFromCode(ErrorCode.VALIDATION_FAILED),
        title: 'Validation failed',
        status,
        code: ErrorCode.VALIDATION_FAILED,
        detail: 'One or more fields are invalid.',
        requestId,
      };
    case 401:
      return {
        type: problemTypeFromCode(ErrorCode.UNAUTHENTICATED),
        title: 'Unauthenticated',
        status,
        code: ErrorCode.UNAUTHENTICATED,
        detail: 'Authentication is required.',
        requestId,
      };
    case 403:
      return {
        type: problemTypeFromCode(ErrorCode.FORBIDDEN),
        title: 'Forbidden',
        status,
        code: ErrorCode.FORBIDDEN,
        detail: 'You do not have permission to access this resource.',
        requestId,
      };
    case 404:
      return {
        type: problemTypeFromCode(ErrorCode.RESOURCE_NOT_FOUND),
        title: 'Resource not found',
        status,
        code: ErrorCode.RESOURCE_NOT_FOUND,
        detail: 'The requested resource was not found.',
        requestId,
      };
    case 409:
      return {
        type: problemTypeFromCode(ErrorCode.CONFLICT),
        title: 'Conflict',
        status,
        code: ErrorCode.CONFLICT,
        detail: 'The request conflicts with the current state of the resource.',
        requestId,
      };
    case 415:
      return {
        type: problemTypeFromCode(ErrorCode.UNSUPPORTED_MEDIA_TYPE),
        title: 'Unsupported media type',
        status,
        code: ErrorCode.UNSUPPORTED_MEDIA_TYPE,
        detail: 'Only JSON request bodies are supported.',
        requestId,
      };
    case 413:
      return {
        type: problemTypeFromCode(ErrorCode.REQUEST_ENTITY_TOO_LARGE),
        title: 'Request entity too large',
        status,
        code: ErrorCode.REQUEST_ENTITY_TOO_LARGE,
        detail: 'Request body is too large.',
        requestId,
      };
    case 429:
      return {
        type: problemTypeFromCode(ErrorCode.RATE_LIMIT_EXCEEDED),
        title: 'Rate limit exceeded',
        status,
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        detail: 'Too many requests were made in a short period.',
        requestId,
      };
    case 503:
      return {
        type: problemTypeFromCode(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE),
        title: 'Service unavailable',
        status,
        code: ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        detail:
          'The service is temporarily unavailable. Please try again in a moment.',
        requestId,
      };
    case 502:
    case 504:
      return {
        type: problemTypeFromCode(ErrorCode.INTERNAL_ERROR),
        title: 'Service unavailable',
        status,
        code: ErrorCode.INTERNAL_ERROR,
        detail:
          'The service is temporarily unavailable. Please try again in a moment.',
        requestId,
      };
    default:
      return {
        type: problemTypeFromCode(ErrorCode.INTERNAL_ERROR),
        title: 'Internal server error',
        status,
        code: ErrorCode.INTERNAL_ERROR,
        detail: 'Something went wrong. Please try again.',
        requestId,
      };
  }
}

export function getNetworkProblem(requestId: string): ApiProblemResponse {
  return {
    type: problemTypeFromCode(NETWORK_ERROR_CODE),
    title: 'Network error',
    status: 0,
    code: NETWORK_ERROR_CODE,
    detail: 'We couldn’t reach the service. Please try again in a moment.',
    requestId,
  };
}

export function getTimeoutProblem(requestId: string): ApiProblemResponse {
  return {
    type: problemTypeFromCode(TIMEOUT_ERROR_CODE),
    title: 'Request timed out',
    status: 408,
    code: TIMEOUT_ERROR_CODE,
    detail: 'The request took too long to complete. Please try again.',
    requestId,
  };
}

export class ApiRequestError extends Error {
  readonly kind: ParsedApiErrorKind;
  readonly problem: ApiProblemResponse;
  readonly requestId: string;
  override readonly cause?: unknown;

  constructor(
    public readonly status: number,
    payload: ApiProblemResponse,
    options?: {
      cause?: unknown;
      kind?: ParsedApiErrorKind;
      requestId?: string;
    },
  ) {
    super(
      getProblemMessage(payload) || `API request failed with status ${status}`,
    );
    this.name = 'ApiRequestError';
    this.cause = options?.cause;
    this.kind = options?.kind ?? 'problem';
    this.problem = payload;
    this.requestId = options?.requestId ?? payload.requestId;
  }

  static fromParsed(parsed: ParsedApiError): ApiRequestError {
    return new ApiRequestError(parsed.status, parsed.problem, {
      cause: parsed.cause,
      kind: parsed.kind,
      requestId: parsed.requestId,
    });
  }
}

export {
  getProblemMessage as getApiProblemDisplayMessage,
  isApiProblem,
  genericNetworkMessages as genericFetchErrorMessages,
};
