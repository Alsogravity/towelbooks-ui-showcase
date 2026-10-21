import { z } from 'zod';

export function countTextLines(value: string): number {
  if (value.length === 0) {
    return 0;
  }

  return value.split('\n').length;
}

export function textWithinMaxLines(value: string, maxLines: number): boolean {
  return countTextLines(value) <= maxLines;
}

export function createMaxLinesZodRefine(maxLines: number) {
  return (value: string) => textWithinMaxLines(value, maxLines);
}

export function multilineTextSchema({
  maxLength,
  maxLines,
}: {
  maxLength: number;
  maxLines: number;
}) {
  return z
    .string()
    .max(maxLength)
    .refine(createMaxLinesZodRefine(maxLines), {
      message: `Text must not exceed ${maxLines} lines.`,
    });
}
