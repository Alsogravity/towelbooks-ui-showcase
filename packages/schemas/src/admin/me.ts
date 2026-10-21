import { z } from 'zod';

import { userStatusSchema } from '../enums.js';

export const adminShellSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  // Optional: API omits the field when a shell section has no badge.
  // Matches AdminShellSectionDto (`badgeCount?: number | null`).
  badgeCount: z.number().int().nullable().optional(),
});

export type AdminShellSection = z.infer<typeof adminShellSectionSchema>;

export const adminOperatorSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  displayName: z.string().nullable(),
  username: z.string(),
  status: userStatusSchema,
  isSystemAdmin: z.boolean(),
  lastLoginAt: z.string().nullable(),
});

export type AdminOperator = z.infer<typeof adminOperatorSchema>;

export const adminMeResponseSchema = z.object({
  environment: z.string(),
  operator: adminOperatorSchema,
  shellSections: z.array(adminShellSectionSchema),
});

export type AdminMeResponse = z.infer<typeof adminMeResponseSchema>;
