import { ErrorCode } from '@towelbooks/schemas';
import { ApiRequestError } from '@towelbooks/sdk';

const REDACTED_VALUE = '[REDACTED]';
const OMITTED_VALUE = '[OMITTED]';

const SENSITIVE_KEY_PATTERN =
  /(access[-_]?token|refresh[-_]?token|verification[-_]?token|reset[-_]?token|api[-_]?key|authorization|cookie|password|secret|token|email)/i;
const OMITTED_KEY_PATTERN =
  /^(body|payload|form(data)?|requestBody|responseBody)$/i;

const BEARER_TOKEN_PATTERN = /\bBearer\s+[^\s,;)\]}]+/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const JSON_SECRET_PAIR_PATTERN =
  /((?:"|')?(?:access[-_ ]?token|refresh[-_ ]?token|verification[-_ ]?token|reset[-_ ]?token|api[-_ ]?key|authorization|cookie|password|secret|token|email)(?:"|')?\s*:\s*)(?:"[^"]*"|'[^']*'|[^\s,;)\]}]+)/gi;
const ASSIGNMENT_SECRET_PATTERN =
  /(\b(?:access[-_ ]?token|refresh[-_ ]?token|verification[-_ ]?token|reset[-_ ]?token|api[-_ ]?key|authorization|cookie|password|secret|token|email)\b\s*=\s*)([^&\s;),\]}]+)/gi;

const significantApiCodes = new Set<string>([
  ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
  ErrorCode.INTERNAL_ERROR,
  ErrorCode.RATE_LIMIT_EXCEEDED,
  ErrorCode.REQUEST_ENTITY_TOO_LARGE,
]);

export const CLIENT_LOG_SERVICE_NAME = 'towelbooks-web';
export const CLIENT_LOG_TARGET = 'console';

export type ClientLogLevel = 'warn' | 'error';

export type ClientLogWriter = Pick<Console, 'error' | 'warn'>;

export type ClientApiFailureLogInput = {
  error: ApiRequestError;
  method?: string;
  path: string;
  source?: string;
};

export type ClientUnexpectedErrorLogInput = {
  context?: Record<string, unknown>;
  error: unknown;
  source: string;
};

export type ClientLogger = {
  logApiFailure: (input: ClientApiFailureLogInput) => void;
  logUnexpectedError: (input: ClientUnexpectedErrorLogInput) => void;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function compactEntry(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  );
}

export function redactClientLogText(value: string): string {
  return value
    .replace(BEARER_TOKEN_PATTERN, 'Bearer [REDACTED]')
    .replace(JSON_SECRET_PAIR_PATTERN, '$1[REDACTED]')
    .replace(ASSIGNMENT_SECRET_PATTERN, '$1[REDACTED]')
    .replace(EMAIL_PATTERN, '[REDACTED]');
}

export function sanitizeClientLogPath(path: string): string {
  try {
    const parsedUrl = path.startsWith('http')
      ? new URL(path)
      : new URL(path, 'http://localhost');

    return parsedUrl.pathname || '/';
  } catch {
    const [sanitizedPath] = path.split(/[?#]/, 1);

    return sanitizedPath && sanitizedPath.length > 0 ? sanitizedPath : '/';
  }
}

function sanitizeClientLogValue(value: unknown, keyName?: string): unknown {
  if (value === null) {
    return null;
  }

  if (keyName && OMITTED_KEY_PATTERN.test(keyName)) {
    return OMITTED_VALUE;
  }

  if (typeof value === 'string') {
    if (keyName && SENSITIVE_KEY_PATTERN.test(keyName)) {
      return REDACTED_VALUE;
    }

    return redactClientLogText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeClientLogValue(item))
      .filter((item) => item !== undefined);
  }

  if (!isPlainObject(value)) {
    return redactClientLogText(String(value));
  }

  const sanitizedEntries = Object.entries(value)
    .map(
      ([entryKey, entryValue]) =>
        [entryKey, sanitizeClientLogValue(entryValue, entryKey)] as const,
    )
    .filter(([, entryValue]) => entryValue !== undefined);

  if (sanitizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(sanitizedEntries);
}

export function sanitizeClientLogContext(
  context?: Record<string, unknown>,
): Record<string, unknown> | null {
  if (!context) {
    return null;
  }

  const sanitized = sanitizeClientLogValue(context);

  if (!isPlainObject(sanitized) || Object.keys(sanitized).length === 0) {
    return null;
  }

  return sanitized;
}

function getLogLevel(error: ApiRequestError): ClientLogLevel {
  if (error.kind !== 'problem' || error.status >= 500) {
    return 'error';
  }

  return 'warn';
}

function shouldLogApiFailure(error: ApiRequestError): boolean {
  if (error.kind !== 'problem') {
    return true;
  }

  if (error.status >= 500) {
    return true;
  }

  return significantApiCodes.has(error.problem.code);
}

function getExceptionType(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.name || 'Error';
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return 'Error';
  }

  return undefined;
}

function getExceptionMessage(error: unknown): string | undefined {
  if (error instanceof Error && error.message.trim().length > 0) {
    return redactClientLogText(error.message);
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return redactClientLogText(error);
  }

  return undefined;
}

function getExceptionStack(error: unknown): string | undefined {
  if (error instanceof Error && error.stack) {
    return redactClientLogText(error.stack);
  }

  return undefined;
}

export function createClientLogger(options?: {
  env?: string;
  service?: string;
  target?: string;
  writer?: ClientLogWriter;
}): ClientLogger {
  // Prefer VITE_DEPLOY_ENV so the log carries the deploy environment
  // (`staging`, `production`, etc.) instead of Vite's MODE, which defaults to
  // "production" for any `vite build` and is therefore meaningless for
  // environment attribution.
  const env =
    options?.env ??
    import.meta.env.VITE_DEPLOY_ENV ??
    import.meta.env.MODE ??
    'development';
  const service = options?.service ?? CLIENT_LOG_SERVICE_NAME;
  const target = options?.target ?? CLIENT_LOG_TARGET;
  const writer = options?.writer ?? console;

  return {
    logApiFailure(input): void {
      if (!shouldLogApiFailure(input.error)) {
        return;
      }

      const level = getLogLevel(input.error);
      const entry = compactEntry({
        code: input.error.problem.code,
        env,
        event: 'api.failure',
        kind: input.error.kind,
        level,
        method: (input.method ?? 'GET').toUpperCase(),
        path: sanitizeClientLogPath(input.path),
        requestId:
          input.error.requestId !== 'unknown'
            ? input.error.requestId
            : undefined,
        service,
        source: input.source ?? 'fetcher',
        status: input.error.status,
        target,
        timestamp: new Date().toISOString(),
      });

      const serializedEntry = JSON.stringify(entry);

      if (level === 'error') {
        writer.error(serializedEntry);
        return;
      }

      writer.warn(serializedEntry);
    },

    logUnexpectedError(input): void {
      const requestId =
        input.error instanceof ApiRequestError &&
        input.error.requestId !== 'unknown'
          ? input.error.requestId
          : undefined;

      const entry = compactEntry({
        context: sanitizeClientLogContext(input.context) ?? undefined,
        env,
        event: 'frontend.exception',
        exceptionMessage: getExceptionMessage(input.error),
        exceptionType: getExceptionType(input.error),
        level: 'error',
        requestId,
        service,
        source: input.source,
        stack: getExceptionStack(input.error),
        target,
        timestamp: new Date().toISOString(),
      });

      writer.error(JSON.stringify(entry));
    },
  };
}

export const clientLogger = createClientLogger();

export function logApiFailure(input: ClientApiFailureLogInput): void {
  clientLogger.logApiFailure(input);
}

export function logUnexpectedError(input: ClientUnexpectedErrorLogInput): void {
  clientLogger.logUnexpectedError(input);
}
