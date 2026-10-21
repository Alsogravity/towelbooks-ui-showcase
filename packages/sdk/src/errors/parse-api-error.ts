import {
  getFallbackProblemForStatus,
  getNetworkProblem,
  getRequestId,
  getTimeoutProblem,
  isApiProblem,
  isProblemJsonContentType,
  sanitizeApiProblemDetails,
  type ParsedApiError,
  type ApiProblemResponse,
} from './api-request-error.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorName(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof error.name === 'string'
  ) {
    return error.name;
  }

  return '';
}

function getErrorMessageText(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return '';
}

function withOptionalDetails(
  rawData: unknown,
  problem: ApiProblemResponse,
): ApiProblemResponse {
  const details =
    isRecord(rawData) && 'details' in rawData ? rawData.details : undefined;

  if (details === null) {
    return {
      ...problem,
      details: null,
    };
  }

  if (isRecord(details)) {
    return {
      ...problem,
      details: sanitizeApiProblemDetails(details),
    };
  }

  return problem;
}

function shouldAttemptJsonParse(
  contentType: string | null,
  rawText: string,
): boolean {
  if (contentType?.toLowerCase().includes('json')) {
    return true;
  }

  const trimmedText = rawText.trim();

  return trimmedText.startsWith('{') || trimmedText.startsWith('[');
}

function tryParseJson(contentType: string | null, rawText: string): unknown {
  if (!shouldAttemptJsonParse(contentType, rawText)) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function isTimeoutError(error: unknown): boolean {
  const errorName = getErrorName(error);
  const normalizedMessage = getErrorMessageText(error).toLowerCase();

  return (
    errorName === 'TimeoutError' ||
    errorName === 'AbortError' ||
    normalizedMessage.includes('timed out') ||
    normalizedMessage.includes('timeout')
  );
}

export async function parseApiError(
  input: Response | unknown,
): Promise<ParsedApiError> {
  if (input instanceof Response) {
    const headerRequestId = input.headers.get('X-Request-Id');
    const contentType = input.headers.get('Content-Type');
    const rawText = await input.text();
    const rawData = tryParseJson(contentType, rawText);

    if (isApiProblem(rawData)) {
      const requestId = getRequestId(headerRequestId, rawData.requestId);

      return {
        kind: 'problem',
        problem: withOptionalDetails(rawData, rawData),
        requestId,
        status: input.status,
      };
    }

    const requestId = getRequestId(headerRequestId);

    return {
      kind:
        isProblemJsonContentType(contentType) || rawData !== null
          ? 'malformed'
          : 'malformed',
      problem: getFallbackProblemForStatus(input.status, requestId),
      requestId,
      status: input.status,
    };
  }

  if (isTimeoutError(input)) {
    return {
      kind: 'timeout',
      problem: getTimeoutProblem('unknown'),
      requestId: 'unknown',
      status: 408,
      cause: input,
    };
  }

  return {
    kind: 'network',
    problem: getNetworkProblem('unknown'),
    requestId: 'unknown',
    status: 0,
    cause: input,
  };
}
