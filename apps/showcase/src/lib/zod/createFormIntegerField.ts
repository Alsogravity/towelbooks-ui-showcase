import { z } from 'zod';

export type FormTranslate = (
  key: string,
  options?: { fallback?: string; values?: Record<string, number | string> },
) => string;

export type FormIntegerFieldMessages = {
  emptyKey: string;
  integerKey: string;
  minKey: string;
  maxKey: string;
};

export type FormIntegerFieldBounds = FormIntegerFieldMessages & {
  min: number;
  max: number;
};

/**
 * Integer field for react-hook-form `valueAsNumber` inputs.
 * Maps empty input (NaN) and decimals to localized messages instead of Zod defaults.
 */
export function createFormIntegerField(
  t: FormTranslate,
  bounds: FormIntegerFieldBounds,
) {
  return z.union([z.number(), z.nan()]).superRefine((value, context) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      context.addIssue({
        code: 'custom',
        message: t(bounds.emptyKey),
      });
      return;
    }

    if (!Number.isInteger(value)) {
      context.addIssue({
        code: 'custom',
        message: t(bounds.integerKey),
      });
      return;
    }

    if (value < bounds.min) {
      context.addIssue({
        code: 'custom',
        message: t(bounds.minKey),
      });
      return;
    }

    if (value > bounds.max) {
      context.addIssue({
        code: 'custom',
        message: t(bounds.maxKey),
      });
    }
  });
}
