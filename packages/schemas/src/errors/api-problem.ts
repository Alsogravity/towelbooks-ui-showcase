import type { ErrorCode } from './error-codes.js';
import type { FieldError } from './field-error.js';

export type ApiProblem = {
  type: string;
  title: string;
  status: number;
  code: ErrorCode;
  detail?: string;
  instance?: string;
  requestId: string;
  errors?: FieldError[];
};
