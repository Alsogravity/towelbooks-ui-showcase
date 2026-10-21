import { z } from 'zod';

export const userStatusSchema = z.enum([
  'pending_verification',
  'active',
  'suspended',
  'deleted',
]);
export type UserStatus = z.infer<typeof userStatusSchema>;
