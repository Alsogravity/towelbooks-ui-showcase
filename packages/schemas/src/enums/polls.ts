import { z } from 'zod';

export const pollLifecycleStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
]);
export type PollLifecycleStatus = z.infer<typeof pollLifecycleStatusSchema>;

export const pollQuestionChoiceModeSchema = z.enum(['single', 'multiple']);
export type PollQuestionChoiceMode = z.infer<
  typeof pollQuestionChoiceModeSchema
>;

export const pollDerivedStatusSchema = z.enum([
  'draft',
  'scheduled',
  'open',
  'closed',
]);
export type PollDerivedStatus = z.infer<typeof pollDerivedStatusSchema>;

export const pollKindSchema = z.enum(['general', 'reading', 'scheduling']);
export type PollKind = z.infer<typeof pollKindSchema>;
