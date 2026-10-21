import { ErrorCode, type FieldError } from '@towelbooks/schemas';
import { ApiRequestError, getApiErrorCode } from '@towelbooks/sdk';

import type { TranslationValues } from '../../i18n';
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

export type Translate = (
  key: string,
  options?: {
    fallback?: string;
    values?: TranslationValues;
  },
) => string;

export type MessageKeyMap = Partial<Record<string, string>>;

export type ApiProblemPageKind = 'forbidden' | 'not-found' | 'unexpected';

export type HandledApiProblem = {
  code: string | null;
  message: string;
  pageKind: ApiProblemPageKind;
  requestId: string | null;
  validationErrors: FieldError[];
};

const commonMessageKeys: Record<string, string> = {
  AUTH_EMAIL_ALREADY_REGISTERED: 'errors.common.emailAlreadyRegistered',
  AUTH_INVALID_CREDENTIALS: 'errors.common.invalidCredentials',
  AUTH_INVALID_RESET_TOKEN: 'errors.common.invalidResetToken',
  AUTH_INVALID_SESSION: 'errors.common.unauthenticated',
  AUTH_INVALID_VERIFICATION_TOKEN: 'errors.common.invalidVerificationToken',
  AUTH_USERNAME_ALREADY_TAKEN: 'errors.common.usernameAlreadyTaken',
  AUTH_WEAK_PASSWORD: 'errors.common.weakPassword',
  ROOM_CREATION_LIMIT_REACHED: 'errors.common.roomCreationLimitReached',
  CATALOG_CONTRIBUTION_HUMAN_VERIFICATION_REQUIRED:
    'catalog.contribution.verification.required',
  CATALOG_CONTRIBUTION_HUMAN_VERIFICATION_FAILED:
    'catalog.contribution.verification.failed',
  ROOM_MEMBER_LIMIT_REACHED: 'errors.common.roomMemberLimitReached',
  ROOM_INVITE_LIMIT_REACHED: 'errors.common.roomInviteLimitReached',
  ROOM_INVITE_CREATOR_LIMIT_REACHED:
    'errors.common.roomInviteCreatorLimitReached',
  EXTERNAL_SERVICE_UNAVAILABLE: 'errors.common.externalServiceUnavailable',
  FORBIDDEN: 'errors.common.forbidden',
  ROOM_FORBIDDEN: 'errors.common.forbidden',
  INTERNAL_ERROR: 'errors.common.unexpected',
  INVITE_EXPIRED: 'errors.common.inviteExpired',
  INVITE_FORBIDDEN: 'errors.common.forbidden',
  INVITE_INVALID: 'errors.common.inviteInvalid',
  NETWORK_ERROR: 'errors.common.network',
  RATE_LIMIT_EXCEEDED: 'errors.common.rateLimit',
  READING_NOT_FOUND: 'errors.common.notFound',
  REQUEST_ENTITY_TOO_LARGE: 'errors.common.requestEntityTooLarge',
  RESOURCE_NOT_FOUND: 'errors.common.notFound',
  TIMEOUT_ERROR: 'errors.common.timeout',
  UNAUTHENTICATED: 'errors.common.unauthenticated',
};

const serverUnavailableStatuses = new Set<number>([502, 503, 504]);

const forbiddenCodes = new Set<string>([
  ErrorCode.FORBIDDEN,
  ErrorCode.ROOM_FORBIDDEN,
  ErrorCode.INVITE_FORBIDDEN,
]);

const notFoundCodes = new Set<string>([
  ErrorCode.ROOM_NOT_FOUND,
  ErrorCode.INVITE_NOT_FOUND,
  ErrorCode.MEMBER_NOT_FOUND,
  ErrorCode.READING_NOT_FOUND,
  ErrorCode.RESOURCE_NOT_FOUND,
]);

function isFieldError(value: unknown): value is FieldError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'field' in value &&
    'message' in value &&
    typeof value.code === 'string' &&
    typeof value.field === 'string' &&
    typeof value.message === 'string'
  );
}

export function getApiProblemRequestId(error: unknown): string | null {
  if (!(error instanceof ApiRequestError)) {
    return null;
  }

  return error.requestId;
}

export function getApiProblemValidationErrors(error: unknown): FieldError[] {
  if (
    !(error instanceof ApiRequestError) ||
    error.problem.code !== ErrorCode.VALIDATION_FAILED ||
    !Array.isArray(error.problem.errors)
  ) {
    return [];
  }

  return error.problem.errors.filter(isFieldError);
}

export function getApiProblemPageKind(error: unknown): ApiProblemPageKind {
  const code = getApiErrorCode(error);

  if (code && forbiddenCodes.has(code as ErrorCode)) {
    return 'forbidden';
  }

  if (code && notFoundCodes.has(code as ErrorCode)) {
    return 'not-found';
  }

  return 'unexpected';
}

function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function getCommonApiProblemMessageKey(
  error: unknown,
  messageKeys?: MessageKeyMap,
): string | undefined {
  const code = getApiErrorCode(error);

  if (error instanceof ApiRequestError) {
    if (error.kind === 'timeout') {
      return 'errors.common.timeout';
    }

    if (error.kind === 'network') {
      return isBrowserOffline()
        ? 'errors.common.offline'
        : 'errors.common.network';
    }

    if (serverUnavailableStatuses.has(error.status)) {
      return 'errors.common.serverUnavailable';
    }
  }

  if (code) {
    return (
      messageKeys?.[code] ??
      commonMessageKeys[code] ??
      (error instanceof ApiRequestError
        ? 'errors.common.unexpected'
        : undefined)
    );
  }

  return error instanceof ApiRequestError
    ? 'errors.common.unexpected'
    : undefined;
}

export function handleApiProblem(
  error: unknown,
  options: {
    fallbackKey: string;
    fallback?: string;
    messageKeys?: MessageKeyMap;
    t: Translate;
  },
): HandledApiProblem {
  const code = getApiErrorCode(error);
  const requestId = getApiProblemRequestId(error);
  const validationErrors = getApiProblemValidationErrors(error);
  const messageKey = getCommonApiProblemMessageKey(error, options.messageKeys);

  let message = options.t(options.fallbackKey, {
    fallback: options.fallback,
  });

  if (code === ErrorCode.VALIDATION_FAILED && validationErrors.length > 0) {
    message = validationErrors[0]!.message;
  } else if (messageKey) {
    message = options.t(messageKey);
  }

  return {
    code,
    message,
    pageKind: getApiProblemPageKind(error),
    requestId,
    validationErrors,
  };
}

export function applyApiValidationErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldMap: Partial<Record<string, FieldPath<TFieldValues>>> = {},
): number {
  const validationErrors = getApiProblemValidationErrors(error);
  let appliedCount = 0;

  for (const validationError of validationErrors) {
    const targetField =
      fieldMap[validationError.field] ??
      (validationError.field as FieldPath<TFieldValues>);

    if (typeof targetField !== 'string' || targetField.trim().length === 0) {
      continue;
    }

    setError(targetField, {
      message: validationError.message,
      type: 'server',
    });
    appliedCount += 1;
  }

  return appliedCount;
}
