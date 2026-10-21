import { zodResolver } from '@hookform/resolvers/zod';
import { READING_DESCRIPTION_MAX_LENGTH } from '@towelbooks/schemas';
import { Switch } from '@towelbooks/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';

import {
  CatalogEditionPicker,
  type CatalogEditionPickerOption,
} from '../../../../features/catalog/CatalogEditionPicker';
import {
  Alert,
  Button,
  FormField,
  FormSection,
  Textarea,
} from '../../../../components/primitives';
import { DateTimeRangeFields } from '../../../../components/datetime/DateTimeRangeFields';
import { CatalogWorkCandidateRow } from '../../../../entities/reading/ui';
import { type LocalDateTimeRangeParts } from '../../../../lib/datetime';
import {
  type RoomReadingContextInput,
  type RoomReadingContextOutput,
  createRoomReadingContextSchema,
} from '../createReadingFormSchema';

import type {
  SelectedCatalogWork,
  Translate,
} from '../createReadingFormShared';

interface ReadingContextStepProps {
  catalogEditions: readonly CatalogEditionPickerOption[];
  errorMessage: string | null;
  hasEditionLoadError: boolean;
  isLoadingEditions: boolean;
  isSubmitting: boolean;
  onEditionChange: (catalogEditionId: string | null) => void;
  onSubmit: (data: RoomReadingContextOutput) => void;
  selectedItem: SelectedCatalogWork;
  selectedEditionId: string | null;
  t: Translate;
}

export function ReadingContextStep({
  catalogEditions,
  errorMessage,
  hasEditionLoadError,
  isLoadingEditions,
  isSubmitting,
  onEditionChange,
  onSubmit,
  selectedItem,
  selectedEditionId,
  t,
}: ReadingContextStepProps) {
  const readingContextSchema = createRoomReadingContextSchema(t);
  const {
    control,
    clearErrors,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<RoomReadingContextInput, undefined, RoomReadingContextOutput>({
    defaultValues: {
      description: '',
      endsDate: '',
      endsTime: '',
      startsDate: '',
      startsTime: '',
    },
    resolver: zodResolver(readingContextSchema),
  });
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);

  const [startsDate, startsTime, endsDate, endsTime] = useWatch({
    control,
    name: ['startsDate', 'startsTime', 'endsDate', 'endsTime'],
  });

  const scheduleValue = {
    startsDate: startsDate ?? '',
    startsTime: startsTime ?? '',
    endsDate: endsDate ?? '',
    endsTime: endsTime ?? '',
  } satisfies LocalDateTimeRangeParts;
  const author = selectedItem.author ?? t('myLibrary.common.noContributor');

  const handleScheduleToggle = (enabled: boolean) => {
    setIsScheduleEnabled(enabled);

    if (!enabled) {
      for (const field of [
        'startsDate',
        'startsTime',
        'endsDate',
        'endsTime',
      ] as const) {
        setValue(field, '');
      }
      clearErrors(['startsDate', 'startsTime', 'endsDate', 'endsTime']);
    }
  };

  return (
    <div className="space-y-4">
      <CatalogWorkCandidateRow
        author={author}
        coverAuthor={author}
        coverDelivery={{
          loading: 'lazy',
          preferredVariant: 'detail',
        }}
        coverGeometry={selectedItem.coverGeometry}
        coverThumbnailUrl={selectedItem.coverThumbnailUrl}
        coverUrl={selectedItem.coverUrl}
        themeSeed={selectedItem.catalogWorkId}
        title={selectedItem.title}
      />

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <FormSection
          contentClassName="space-y-4"
          icon="pencil-line"
          title={t('rooms.readingForm.labels.context')}
          withDivider
        >
          <FormField
            error={errors.description?.message}
            htmlFor="reading-description"
            hideLabel
            label={t('rooms.readingForm.labels.context')}
          >
            <Textarea
              {...register('description')}
              floatingLabel
              floatingLabelText={t('rooms.readingForm.labels.context')}
              id="reading-description"
              maxLength={READING_DESCRIPTION_MAX_LENGTH}
              rows={4}
              showCharacterCounter
              placeholder={t('rooms.readingForm.placeholders.context')}
            />
          </FormField>
        </FormSection>

        <FormSection
          contentClassName="space-y-2"
          icon="calendar-clock"
          title={t('rooms.readingForm.sections.schedule')}
          withDivider
        >
          <div className="flex flex-row items-center justify-between gap-3 py-2 text-sm text-ink-2 sm:gap-6">
            <span className="min-w-0 flex-1">
              {t('rooms.readingForm.schedule.toggle')}
            </span>
            <Switch
              aria-label={t('rooms.readingForm.schedule.toggle')}
              checked={isScheduleEnabled}
              onCheckedChange={handleScheduleToggle}
            />
          </div>
          {isScheduleEnabled ? (
            <DateTimeRangeFields
              dateLabel={t('rooms.datetime.labels.date')}
              endsLabel={t('rooms.readingForm.labels.scheduleEnd')}
              errors={{
                endsAt: errors.endsDate?.message,
                startsAt: errors.startsDate?.message,
              }}
              floatingLabel
              hideGroupLabels
              idPrefix="reading-create"
              onChange={(patch) => {
                for (const [field, nextValue] of Object.entries(patch)) {
                  setValue(
                    field as keyof RoomReadingContextInput,
                    nextValue ?? '',
                    { shouldDirty: true, shouldValidate: true },
                  );
                }
              }}
              startsLabel={t('rooms.readingForm.labels.scheduleStart')}
              timeLabel={t('rooms.datetime.labels.time')}
              value={scheduleValue}
            />
          ) : null}
        </FormSection>

        <FormSection
          contentClassName="space-y-3"
          description={t('rooms.readingFlow.edition.description')}
          icon="book-open"
          title={t('rooms.readingFlow.edition.title')}
          withDivider
        >
          {isLoadingEditions ? (
            <p
              aria-live="polite"
              className="app-text-supporting-copy text-ink-3"
            >
              {t('rooms.readingFlow.edition.loading')}
            </p>
          ) : (
            <>
              {hasEditionLoadError ? (
                <p className="app-text-supporting-copy text-ink-3">
                  {t('rooms.readingFlow.edition.loadFallback')}
                </p>
              ) : null}
              <CatalogEditionPicker
                authorFallback={author}
                disabled={isSubmitting}
                editions={catalogEditions}
                onChange={onEditionChange}
                selectedEditionId={selectedEditionId}
              />
            </>
          )}
        </FormSection>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={isLoadingEditions}
            isLoading={isSubmitting}
            loadingLabel={t('rooms.readingForm.submitting')}
            type="submit"
          >
            {t('rooms.readingForm.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
