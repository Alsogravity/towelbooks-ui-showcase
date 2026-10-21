import {
  ApiRequestError,
  genericFetchErrorMessages,
  getApiProblemDisplayMessage,
} from './api-request-error.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiRequestError) {
    if (error.kind === 'network' || error.kind === 'timeout') {
      return fallback;
    }

    const message = getApiProblemDisplayMessage(error.problem).trim();

    return message.length > 0 ? message : fallback;
  }

  if (error instanceof Error) {
    const message = error.message.trim();

    if (message.length > 0 && !genericFetchErrorMessages.has(message)) {
      return message;
    }
  }

  return fallback;
}

export function getApiErrorCode(error: unknown): string | null {
  if (error instanceof ApiRequestError) {
    return error.problem.code;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}

export function getApiProblemDetails<T extends Record<string, unknown>>(
  error: unknown,
): T | null {
  if (!(error instanceof ApiRequestError) || !isRecord(error.problem.details)) {
    return null;
  }

  return error.problem.details as T;
}

export function getApiValidationIssues(error: unknown): string[] {
  if (!(error instanceof ApiRequestError)) {
    return [];
  }

  if (Array.isArray(error.problem.errors)) {
    return error.problem.errors
      .map((issue) => issue.message)
      .filter((issue): issue is string => issue.trim().length > 0);
  }

  return [];
}
