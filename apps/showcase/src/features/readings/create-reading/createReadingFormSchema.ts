import { READING_DESCRIPTION_MAX_LENGTH } from '@towelbooks/schemas';
import { z } from 'zod';

import {
  validateLocalDateTimeRange,
  type LocalDateTimeRangeErrorCode,
  type LocalDateTimeRangeParts,
} from '../../../lib/datetime';

import type { Translate } from './createReadingFormShared';

const optionalStringField = z.string().optional().or(z.literal(''));

function getDateTimeErrorMessage(
  code: LocalDateTimeRangeErrorCode,
  t: Translate,
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

export function createRoomReadingContextSchema(t: Translate) {
  return z
    .object({
      description: z
        .string()
        .max(
          READING_DESCRIPTION_MAX_LENGTH,
          t('rooms.readingForm.validation.descriptionMax'),
        )
        .optional()
        .or(z.literal('')),
      endsDate: optionalStringField,
      endsTime: optionalStringField,
      startsDate: optionalStringField,
      startsTime: optionalStringField,
    })
    .superRefine((value, context) => {
      const scheduleFields: LocalDateTimeRangeParts = {
        startsDate: value.startsDate ?? '',
        startsTime: value.startsTime ?? '',
        endsDate: value.endsDate ?? '',
        endsTime: value.endsTime ?? '',
      };
      const scheduleErrors = validateLocalDateTimeRange(scheduleFields);

      for (const [field, code] of Object.entries(scheduleErrors) as Array<
        [keyof typeof scheduleErrors, LocalDateTimeRangeErrorCode]
      >) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: getDateTimeErrorMessage(code, t),
          path: [field === 'startsAt' ? 'startsDate' : 'endsDate'],
        });
      }
    });
}

export type RoomReadingContextSchema = ReturnType<
  typeof createRoomReadingContextSchema
>;
export type RoomReadingContextInput = z.input<RoomReadingContextSchema>;
export type RoomReadingContextOutput = z.output<RoomReadingContextSchema>;
