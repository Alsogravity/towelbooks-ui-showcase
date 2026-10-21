import { utcDateTimeStringSchema } from '../common/utc-datetime.js';
import { z } from 'zod';

import { avatarSchema } from '../avatars.js';
import {
  pollDerivedStatusSchema,
  type PollKind,
  pollKindSchema,
  pollLifecycleStatusSchema,
  pollQuestionChoiceModeSchema,
} from '../enums.js';
import {
  POLL_DESCRIPTION_MAX_LENGTH,
  POLL_OPTION_LABEL_MAX_LENGTH,
  POLL_OPTIONS_MAX_COUNT,
  POLL_QUESTIONS_MAX_COUNT,
  POLL_QUESTION_TITLE_MAX_LENGTH,
  POLL_TITLE_MAX_LENGTH,
} from '../limits.js';

export const pollAuthorSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type PollAuthor = z.infer<typeof pollAuthorSchema>;

export const pollReferenceSnapshotSchema = z
  .object({
    title: z.string().min(1),
    subtitle: z.string().nullable().optional(),
    coverUrl: z.string().nullable().optional(),
  })
  .passthrough();
export type PollReferenceSnapshot = z.infer<typeof pollReferenceSnapshotSchema>;

export const pollVoterSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  displayName: z.string().nullable(),
  avatar: avatarSchema,
});
export type PollVoter = z.infer<typeof pollVoterSchema>;

export const pollOptionSchema = z
  .object({
    id: z.string().uuid(),
    questionId: z.string().uuid(),
    label: z.string().nullable(),
    description: z.string().nullable(),
    catalogWorkId: z.string().uuid().nullable(),
    referenceSnapshot: pollReferenceSnapshotSchema.nullable(),
    dateSlotStartsAt: utcDateTimeStringSchema.nullable(),
    dateSlotEndsAt: utcDateTimeStringSchema.nullable(),
    position: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    viewerSelected: z.boolean(),
    createdAt: utcDateTimeStringSchema,
    updatedAt: utcDateTimeStringSchema,
  })
  .strict();
export type PollOption = z.infer<typeof pollOptionSchema>;

export const pollQuestionSchema = z.object({
  id: z.string().uuid(),
  pollId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  choiceMode: pollQuestionChoiceModeSchema,
  minChoices: z.number().int().positive(),
  maxChoices: z.number().int().positive().nullable(),
  position: z.number().int().nonnegative(),
  options: z.array(pollOptionSchema),
  responseCount: z.number().int().nonnegative(),
  viewerOptionIds: z.array(z.string().uuid()),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});
export type PollQuestion = z.infer<typeof pollQuestionSchema>;

export const pollResultOptionSchema = z.object({
  optionId: z.string().uuid(),
  label: z.string().nullable(),
  referenceSnapshot: pollReferenceSnapshotSchema.nullable(),
  dateSlotStartsAt: utcDateTimeStringSchema.nullable(),
  dateSlotEndsAt: utcDateTimeStringSchema.nullable(),
  count: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  voters: z.array(pollVoterSchema).optional(),
});
export type PollResultOption = z.infer<typeof pollResultOptionSchema>;

export const pollResultSchema = z.object({
  questionId: z.string().uuid(),
  title: z.string().min(1),
  totalResponses: z.number().int().nonnegative(),
  options: z.array(pollResultOptionSchema),
});
export type PollResult = z.infer<typeof pollResultSchema>;

export const pollListItemSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  authorUserId: z.string().uuid(),
  author: pollAuthorSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  lifecycleStatus: pollLifecycleStatusSchema,
  derivedStatus: pollDerivedStatusSchema,
  kind: pollKindSchema,
  votesArePublic: z.boolean(),
  showResultsBeforeClose: z.boolean(),
  startsAt: utcDateTimeStringSchema,
  endsAt: utcDateTimeStringSchema.nullable(),
  closedAt: utcDateTimeStringSchema.nullable(),
  announcedOptionId: z.string().uuid().nullable(),
  resultAnnouncedAt: utcDateTimeStringSchema.nullable(),
  archivedAt: utcDateTimeStringSchema.nullable(),
  questionCount: z.number().int().nonnegative(),
  responseCount: z.number().int().nonnegative(),
  viewerHasVoted: z.boolean(),
  viewerCanVote: z.boolean(),
  viewerCanWithdraw: z.boolean(),
  viewerCanEdit: z.boolean(),
  viewerCanClose: z.boolean(),
  viewerCanAnnounceResult: z.boolean(),
  viewerCanDelete: z.boolean(),
  createdAt: utcDateTimeStringSchema,
  updatedAt: utcDateTimeStringSchema,
});
export type PollListItem = z.infer<typeof pollListItemSchema>;

export const pollSchema = pollListItemSchema
  .extend({
    questions: z.array(pollQuestionSchema),
    results: z.array(pollResultSchema).optional(),
  })
  .superRefine((poll, context) => {
    validatePollQuestionOptions(poll.questions, poll.kind, context, true);
  });
export type Poll = z.infer<typeof pollSchema>;

function validatePollOptionShape(
  option: {
    catalogWorkId?: string | null;
    dateSlotEndsAt?: string | null;
    dateSlotStartsAt?: string | null;
    label?: string | null;
    referenceSnapshot?: PollReferenceSnapshot | null;
  },
  kind: PollKind,
  context: z.RefinementCtx,
  path: (string | number)[],
  requireReadingSnapshot: boolean,
): void {
  const hasDateSlot =
    option.dateSlotStartsAt != null || option.dateSlotEndsAt != null;
  const hasWork = option.catalogWorkId != null;
  const hasSnapshot = option.referenceSnapshot != null;

  if (kind === 'general') {
    if (!option.label?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'General poll options require a non-empty label.',
        path: [...path, 'label'],
      });
    }
    if (hasWork || hasDateSlot || hasSnapshot) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'General poll options cannot contain work or date-slot fields.',
        path,
      });
    }
    return;
  }

  if (kind === 'reading') {
    if (!hasWork) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reading poll options require a catalog work.',
        path: [...path, 'catalogWorkId'],
      });
    }
    if (requireReadingSnapshot && !hasSnapshot) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reading poll options require a reference snapshot.',
        path: [...path, 'referenceSnapshot'],
      });
    }
    if (hasDateSlot) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reading poll options cannot contain date-slot fields.',
        path,
      });
    }
    return;
  }

  if (!option.dateSlotStartsAt) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Scheduling poll options require a date slot.',
      path: [...path, 'dateSlotStartsAt'],
    });
  }
  if (hasWork || hasSnapshot) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Scheduling poll options cannot contain work fields.',
      path,
    });
  }
  if (
    option.dateSlotStartsAt &&
    option.dateSlotEndsAt &&
    new Date(option.dateSlotEndsAt).getTime() <=
      new Date(option.dateSlotStartsAt).getTime()
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'dateSlotEndsAt must be after dateSlotStartsAt.',
      path: [...path, 'dateSlotEndsAt'],
    });
  }
}

function validatePollQuestionOptions(
  questions: Array<{
    options: Array<{
      catalogWorkId?: string | null;
      dateSlotEndsAt?: string | null;
      dateSlotStartsAt?: string | null;
      label?: string | null;
      referenceSnapshot?: PollReferenceSnapshot | null;
    }>;
  }>,
  kind: PollKind,
  context: z.RefinementCtx,
  requireReadingSnapshot: boolean,
): void {
  questions.forEach((question, questionIndex) => {
    question.options.forEach((option, optionIndex) => {
      validatePollOptionShape(
        option,
        kind,
        context,
        ['questions', questionIndex, 'options', optionIndex],
        requireReadingSnapshot,
      );
    });
  });
}

export const paginatedPollsResponseSchema = z.object({
  items: z.array(pollListItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type PaginatedPollsResponse = z.infer<
  typeof paginatedPollsResponseSchema
>;

export const createPollOptionRequestSchema = z
  .object({
    label: z.string().max(POLL_OPTION_LABEL_MAX_LENGTH).nullable().optional(),
    description: z
      .string()
      .max(POLL_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    catalogWorkId: z.string().uuid().nullable().optional(),
    dateSlotStartsAt: utcDateTimeStringSchema.nullable().optional(),
    dateSlotEndsAt: utcDateTimeStringSchema.nullable().optional(),
    position: z.number().int().nonnegative(),
  })
  .strict();
export type CreatePollOptionRequest = z.infer<
  typeof createPollOptionRequestSchema
>;

export const createPollQuestionRequestSchema = z
  .object({
    title: z.string().min(1).max(POLL_QUESTION_TITLE_MAX_LENGTH),
    description: z
      .string()
      .max(POLL_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    choiceMode: pollQuestionChoiceModeSchema,
    minChoices: z.number().int().positive().optional(),
    maxChoices: z.number().int().positive().nullable().optional(),
    position: z.number().int().nonnegative(),
    options: z
      .array(createPollOptionRequestSchema)
      .min(2)
      .max(POLL_OPTIONS_MAX_COUNT),
  })
  .strict();
export type CreatePollQuestionRequest = z.infer<
  typeof createPollQuestionRequestSchema
>;

export const createPollRequestSchema = z
  .object({
    title: z.string().min(1).max(POLL_TITLE_MAX_LENGTH),
    description: z
      .string()
      .max(POLL_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    lifecycleStatus: pollLifecycleStatusSchema.optional(),
    kind: pollKindSchema.optional(),
    votesArePublic: z.boolean().optional(),
    showResultsBeforeClose: z.boolean().optional(),
    startsAt: utcDateTimeStringSchema,
    endsAt: utcDateTimeStringSchema.nullable(),
    questions: z
      .array(createPollQuestionRequestSchema)
      .min(1)
      .max(POLL_QUESTIONS_MAX_COUNT),
  })
  .strict()
  .superRefine((poll, context) => {
    if (
      poll.endsAt !== null &&
      Date.parse(poll.startsAt) >= Date.parse(poll.endsAt)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startsAt must be before endsAt.',
        path: ['endsAt'],
      });
    }

    validatePollQuestionOptions(
      poll.questions,
      poll.kind ?? 'general',
      context,
      false,
    );
  });
export type CreatePollRequest = z.infer<typeof createPollRequestSchema>;

export const updatePollRequestSchema = z
  .object({
    title: z.string().min(1).max(POLL_TITLE_MAX_LENGTH).optional(),
    description: z
      .string()
      .max(POLL_DESCRIPTION_MAX_LENGTH)
      .nullable()
      .optional(),
    endsAt: utcDateTimeStringSchema.nullable().optional(),
  })
  .strict();
export type UpdatePollRequest = z.infer<typeof updatePollRequestSchema>;

export const submitPollResponseRequestSchema = z
  .object({
    responses: z
      .array(
        z
          .object({
            questionId: z.string().uuid(),
            optionIds: z.array(z.string().uuid()).min(1),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export type SubmitPollResponseRequest = z.infer<
  typeof submitPollResponseRequestSchema
>;

export const announcePollResultRequestSchema = z
  .object({
    optionId: z.string().uuid(),
  })
  .strict();
export type AnnouncePollResultRequest = z.infer<
  typeof announcePollResultRequestSchema
>;
