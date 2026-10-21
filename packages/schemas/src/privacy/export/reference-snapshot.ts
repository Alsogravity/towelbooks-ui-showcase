import { z } from 'zod';

/**
 * Allowlisted poll reference snapshot fields for self-service privacy export.
 * Unknown keys are stripped; invalid shapes resolve to null at serialization time.
 */
export const privacyExportPollReferenceSnapshotSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
});
export type PrivacyExportPollReferenceSnapshot = z.infer<
  typeof privacyExportPollReferenceSnapshotSchema
>;

export function serializePrivacyExportPollReferenceSnapshot(
  value: unknown,
): PrivacyExportPollReferenceSnapshot | null {
  const parsed = privacyExportPollReferenceSnapshotSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}
