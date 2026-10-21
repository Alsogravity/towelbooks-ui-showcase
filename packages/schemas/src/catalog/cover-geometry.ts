import { z } from 'zod';

/**
 * Intrinsic artwork dimensions used only to reserve natural cover layout.
 * These are source-pixel dimensions, not rendered CSS dimensions.
 */
export const coverGeometrySchema = z
  .object({
    height: z.number().int().positive(),
    width: z.number().int().positive(),
  })
  .strict();

export type CoverGeometry = z.infer<typeof coverGeometrySchema>;

export function normalizeCoverGeometry(value: unknown): CoverGeometry | null {
  const parsed = coverGeometrySchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}
