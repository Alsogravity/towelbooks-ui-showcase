import { z } from 'zod';

export const permittedActionSchema = z.enum([
  'reactivate',
  'abandon',
  'reauthenticate',
  'confirm_deletion',
  'cancel_deletion',
  'none',
]);

export type PermittedAction = z.infer<typeof permittedActionSchema>;

export const permittedActionsSchema = z.array(permittedActionSchema).min(0);

const restorableUntilField = z.string().datetime().nullable();
const recentAuthenticationSatisfiedField = z.boolean();
const permittedActionsField = permittedActionsSchema;

export const reactivationRequiredDetailsSchema = z.object({
  restorableUntil: restorableUntilField,
  recentAuthenticationSatisfied: recentAuthenticationSatisfiedField,
  permittedActions: permittedActionsField,
});

export type ReactivationRequiredDetails = z.infer<
  typeof reactivationRequiredDetailsSchema
>;

export const deletionFinalizingDetailsSchema = z.object({
  permittedActions: permittedActionsField,
});

export type DeletionFinalizingDetails = z.infer<
  typeof deletionFinalizingDetailsSchema
>;

export const reauthenticationRequiredDetailsSchema = z.object({
  recentAuthenticationSatisfied: recentAuthenticationSatisfiedField,
  permittedActions: permittedActionsField,
});

export type ReauthenticationRequiredDetails = z.infer<
  typeof reauthenticationRequiredDetailsSchema
>;

export const continuationExpiredDetailsSchema = z.object({
  permittedActions: permittedActionsField,
});

export type ContinuationExpiredDetails = z.infer<
  typeof continuationExpiredDetailsSchema
>;

export const continuationConsumedDetailsSchema = z.object({
  permittedActions: permittedActionsField,
});

export type ContinuationConsumedDetails = z.infer<
  typeof continuationConsumedDetailsSchema
>;
