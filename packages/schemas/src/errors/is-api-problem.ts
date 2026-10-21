import { ErrorCode } from './error-codes.js';

import type { ApiProblem } from './api-problem.js';
import type { FieldError } from './field-error.js';

const errorCodes = new Set<string>(Object.values(ErrorCode));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isFieldError(value: unknown): value is FieldError {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.field === 'string' &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}

export function isApiProblem(value: unknown): value is ApiProblem {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.type !== 'string' ||
    typeof value.title !== 'string' ||
    !Number.isInteger(value.status) ||
    typeof value.code !== 'string' ||
    !errorCodes.has(value.code) ||
    !isOptionalString(value.detail) ||
    !isOptionalString(value.instance) ||
    typeof value.requestId !== 'string'
  ) {
    return false;
  }

  if (value.errors === undefined) {
    return true;
  }

  return Array.isArray(value.errors) && value.errors.every(isFieldError);
}
