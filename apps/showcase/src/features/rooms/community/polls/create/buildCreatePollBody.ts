import {
  browserLocalDateTimePartsToUtcIso,
  formatBrowserLocalDateTimeInputFromDate,
  getEndLocalDateTimeParts,
  getLocalDateTimePartsState,
  getStartLocalDateTimeParts,
  splitLocalDateTimeInput,
  validateLocalDateTimeRange,
  type LocalDateTimeRangeErrorCode,
  type LocalDateTimeRangeErrorCodes,
  type LocalDateTimeRangeParts,
} from '../../../../../lib/datetime';

import type { TranslateOptions } from '../../../../../i18n/format';
import type { ReadingOptionDraft } from './ReadingOptionsField';
import type { DateSlotDraft, DateSlotFieldErrors } from './DateSlotsField';
import type { CreatePollRequest, PollKind } from '@towelbooks/schemas';

export type CreatePollTranslateFn = (
  key: string,
  options?: TranslateOptions,
) => string;

export type CreatePollDraft = {
  allowMultiple: boolean;
  closesAutomatically: boolean;
  dateSlots: DateSlotDraft[];
  description: string;
  kind: PollKind;
  readingOptions: ReadingOptionDraft[];
  showResultsBeforeClose: boolean;
  textOptions: string[];
  title: string;
  votesArePublic: boolean;
  windowDraft: LocalDateTimeRangeParts;
};

export type ValidatedDateSlot = {
  errors: DateSlotFieldErrors;
  isFilled: boolean;
  normalized?: { dateSlotEndsAt: string | null; dateSlotStartsAt: string };
};

export function buildDefaultWindowDraft(): LocalDateTimeRangeParts {
  const date = new Date();
  const starts = splitLocalDateTimeInput(
    formatBrowserLocalDateTimeInputFromDate(date),
  );
  date.setDate(date.getDate() + 7);
  const ends = splitLocalDateTimeInput(
    formatBrowserLocalDateTimeInputFromDate(date),
  );

  return {
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  };
}

function getDateTimeErrorMessage(
  code: LocalDateTimeRangeErrorCode,
  t: CreatePollTranslateFn,
): string {
  switch (code) {
    case 'incomplete':
      return t('rooms.datetime.validation.incomplete');
    case 'invalid':
      return t('rooms.datetime.validation.invalid');
    case 'order':
      return t('rooms.datetime.validation.order');
  }
}

export function translateDateTimeErrors(
  errors: LocalDateTimeRangeErrorCodes,
  t: CreatePollTranslateFn,
): DateSlotFieldErrors {
  const translated: DateSlotFieldErrors = {};

  if (errors.startsAt) {
    translated.startsAt = getDateTimeErrorMessage(errors.startsAt, t);
  }

  if (errors.endsAt) {
    translated.endsAt = getDateTimeErrorMessage(errors.endsAt, t);
  }

  return translated;
}

export function validateDateSlotDraft(
  slot: DateSlotDraft,
  t: CreatePollTranslateFn,
): ValidatedDateSlot {
  const startsState = getLocalDateTimePartsState({
    date: slot.startsDate,
    time: slot.startsTime,
  });
  const endsState = getLocalDateTimePartsState({
    date: slot.endsDate,
    time: slot.endsTime,
  });

  if (startsState === 'empty' && endsState === 'empty') {
    return { errors: {}, isFilled: false };
  }

  const errors: DateSlotFieldErrors = {};

  if (startsState === 'empty' && endsState !== 'empty') {
    errors.startsAt = t('rooms.datetime.validation.incomplete');
  } else if (startsState === 'incomplete') {
    errors.startsAt = t('rooms.datetime.validation.incomplete');
  } else if (startsState === 'invalid') {
    errors.startsAt = t('rooms.datetime.validation.invalid');
  }

  if (endsState === 'incomplete') {
    errors.endsAt = t('rooms.datetime.validation.incomplete');
  } else if (endsState === 'invalid') {
    errors.endsAt = t('rooms.datetime.validation.invalid');
  }

  if (startsState === 'complete' && endsState === 'complete') {
    const rangeErrors = validateLocalDateTimeRange(
      {
        startsDate: slot.startsDate,
        startsTime: slot.startsTime,
        endsDate: slot.endsDate,
        endsTime: slot.endsTime,
      },
      { orderField: 'endsAt' },
    );

    if (rangeErrors.endsAt === 'order') {
      errors.endsAt = t('rooms.detail.polls.createDialog.date.orderError');
    }
  }

  if (Object.keys(errors).length > 0 || startsState !== 'complete') {
    return { errors, isFilled: true };
  }

  return {
    errors,
    isFilled: true,
    normalized: {
      dateSlotStartsAt: browserLocalDateTimePartsToUtcIso({
        date: slot.startsDate,
        time: slot.startsTime,
      })!,
      dateSlotEndsAt:
        endsState === 'complete'
          ? browserLocalDateTimePartsToUtcIso({
              date: slot.endsDate,
              time: slot.endsTime,
            })!
          : null,
    },
  };
}

export function getFilledTextOptions(textOptions: string[]): string[] {
  return textOptions.map((option) => option.trim()).filter(Boolean);
}

export function getValidatedDateSlots(
  dateSlots: DateSlotDraft[],
  t: CreatePollTranslateFn,
): ValidatedDateSlot[] {
  return dateSlots.map((slot) => validateDateSlotDraft(slot, t));
}

export function getFilledDateSlots(
  validatedDateSlots: ValidatedDateSlot[],
): { dateSlotEndsAt: string | null; dateSlotStartsAt: string }[] {
  return validatedDateSlots.flatMap((slot) =>
    slot.normalized ? [slot.normalized] : [],
  );
}

export function canCreatePoll(
  draft: CreatePollDraft,
  t: CreatePollTranslateFn,
): boolean {
  const filledTextOptions = getFilledTextOptions(draft.textOptions);
  const windowErrors = draft.closesAutomatically
    ? translateDateTimeErrors(validateLocalDateTimeRange(draft.windowDraft), t)
    : {};
  const hasCompleteStart =
    getLocalDateTimePartsState(
      getStartLocalDateTimeParts(draft.windowDraft),
    ) === 'complete';
  const hasCompleteEnd =
    getLocalDateTimePartsState(getEndLocalDateTimeParts(draft.windowDraft)) ===
    'complete';
  const hasCompleteWindow =
    hasCompleteStart && (!draft.closesAutomatically || hasCompleteEnd);
  const validatedDateSlots = getValidatedDateSlots(draft.dateSlots, t);
  const filledDateSlots = getFilledDateSlots(validatedDateSlots);
  const hasWindowErrors = Boolean(windowErrors.startsAt || windowErrors.endsAt);
  const hasDateSlotErrors = validatedDateSlots.some(
    (slot) => slot.errors.startsAt || slot.errors.endsAt,
  );

  return (
    draft.title.trim().length > 0 &&
    hasCompleteWindow &&
    !hasWindowErrors &&
    (draft.kind === 'general'
      ? filledTextOptions.length >= 2
      : draft.kind === 'reading'
        ? draft.readingOptions.length >= 2
        : filledDateSlots.length >= 2 && !hasDateSlotErrors)
  );
}

export function buildCreatePollBody(
  draft: CreatePollDraft,
  t: CreatePollTranslateFn,
): CreatePollRequest {
  const filledTextOptions = getFilledTextOptions(draft.textOptions);
  const validatedDateSlots = getValidatedDateSlots(draft.dateSlots, t);
  const filledDateSlots = getFilledDateSlots(validatedDateSlots);

  const base = {
    title: draft.title.trim(),
    description: draft.description.trim() ? draft.description.trim() : null,
    kind: draft.kind,
    votesArePublic: draft.votesArePublic,
    showResultsBeforeClose: draft.showResultsBeforeClose,
    startsAt: browserLocalDateTimePartsToUtcIso({
      date: draft.windowDraft.startsDate,
      time: draft.windowDraft.startsTime,
    })!,
    endsAt: draft.closesAutomatically
      ? browserLocalDateTimePartsToUtcIso({
          date: draft.windowDraft.endsDate,
          time: draft.windowDraft.endsTime,
        })!
      : null,
  };

  if (draft.kind === 'reading') {
    return {
      ...base,
      questions: [
        {
          title: t('rooms.detail.polls.createDialog.reading.questionDefault'),
          choiceMode: 'single',
          position: 0,
          options: draft.readingOptions.map((option, index) => ({
            label: option.title,
            catalogWorkId: option.catalogWorkId,
            position: index,
          })),
        },
      ],
    };
  }

  if (draft.kind === 'scheduling') {
    return {
      ...base,
      questions: [
        {
          title: t('rooms.detail.polls.createDialog.date.questionDefault'),
          choiceMode: 'multiple',
          minChoices: 1,
          maxChoices: filledDateSlots.length,
          position: 0,
          options: filledDateSlots.map((slot, index) => ({
            dateSlotStartsAt: slot.dateSlotStartsAt,
            dateSlotEndsAt: slot.dateSlotEndsAt,
            position: index,
          })),
        },
      ],
    };
  }

  return {
    ...base,
    questions: [
      {
        title: draft.title.trim(),
        choiceMode: draft.allowMultiple ? 'multiple' : 'single',
        ...(draft.allowMultiple
          ? { minChoices: 1, maxChoices: filledTextOptions.length }
          : {}),
        position: 0,
        options: filledTextOptions.map((label, index) => ({
          label,
          position: index,
        })),
      },
    ],
  };
}
