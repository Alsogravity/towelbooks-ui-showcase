import { z } from 'zod';

export const HUMAN_VERIFICATION_ACTION_PATTERN = /^[A-Za-z0-9_-]{1,32}$/u;
export const HUMAN_VERIFICATION_ACTION_MAX_LENGTH = 32;

export const humanVerificationActionSchema = z
  .string()
  .regex(HUMAN_VERIFICATION_ACTION_PATTERN);

export type HumanVerificationAction = z.infer<
  typeof humanVerificationActionSchema
>;

export function isValidHumanVerificationAction(
  value: unknown,
): value is HumanVerificationAction {
  return (
    typeof value === 'string' && HUMAN_VERIFICATION_ACTION_PATTERN.test(value)
  );
}
