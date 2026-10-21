import { utcDateTimeStringSchema } from '../../common/utc-datetime.js';
import { z } from 'zod';

import {
  pollKindSchema,
  pollLifecycleStatusSchema,
  pollQuestionChoiceModeSchema,
} from '../../enums.js';
import { privacyExportPollReferenceSnapshotSchema } from './reference-snapshot.js';

export const privacyExportPollOptionSchema = z
  .object({
    id: z.string().uuid(),
    label: z.string().nullable(),
    description: z.string().nullable(),
    catalogWorkId: z.string().uuid().nullable(),
    referenceSnapshot: privacyExportPollReferenceSnapshotSchema.nullable(),
    dateSlotStartsAt: utcDateTimeStringSchema.nullable(),
    dateSlotEndsAt: utcDateTimeStringSchema.nullable(),
    position: z.number().int(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPollOption = z.infer<
  typeof privacyExportPollOptionSchema
>;

export const privacyExportPollQuestionSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().nullable(),
    choiceMode: pollQuestionChoiceModeSchema,
    minChoices: z.number().int(),
    maxChoices: z.number().int().nullable(),
    position: z.number().int(),
    options: z.array(privacyExportPollOptionSchema),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPollQuestion = z.infer<
  typeof privacyExportPollQuestionSchema
>;

export const privacyExportPollSchema = z
  .object({
    id: z.string().uuid(),
    roomId: z.string().uuid(),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    title: z.string().min(1),
    description: z.string().nullable(),
    lifecycleStatus: pollLifecycleStatusSchema,
    kind: pollKindSchema,
    votesArePublic: z.boolean(),
    showResultsBeforeClose: z.boolean(),
    startsAt: utcDateTimeStringSchema,
    endsAt: utcDateTimeStringSchema.nullable(),
    closedAt: utcDateTimeStringSchema.nullable(),
    announcedOptionId: z.string().uuid().nullable(),
    resultAnnouncedAt: utcDateTimeStringSchema.nullable(),
    archivedAt: utcDateTimeStringSchema.nullable(),
    questions: z.array(privacyExportPollQuestionSchema),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPoll = z.infer<typeof privacyExportPollSchema>;

export const privacyExportPollResponseSelectionSchema = z
  .object({
    id: z.string().uuid(),
    optionId: z.string().uuid(),
    label: z.string().nullable(),
    description: z.string().nullable(),
    catalogWorkId: z.string().uuid().nullable(),
    referenceSnapshot: privacyExportPollReferenceSnapshotSchema.nullable(),
    dateSlotStartsAt: utcDateTimeStringSchema.nullable(),
    dateSlotEndsAt: utcDateTimeStringSchema.nullable(),
    position: z.number().int(),
    createdAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPollResponseSelection = z.infer<
  typeof privacyExportPollResponseSelectionSchema
>;

export const privacyExportPollResponseSchema = z
  .object({
    id: z.string().uuid(),
    pollId: z.string().uuid(),
    pollTitle: z.string().min(1),
    roomId: z.string().uuid(),
    roomSlug: z.string().min(1),
    roomName: z.string().min(1),
    questionId: z.string().uuid(),
    questionTitle: z.string().min(1),
    selections: z.array(privacyExportPollResponseSelectionSchema),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PrivacyExportPollResponse = z.infer<
  typeof privacyExportPollResponseSchema
>;
