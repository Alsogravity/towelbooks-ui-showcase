import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  READING_DESCRIPTION_MAX_LENGTH,
  type Reading,
  type UpdateReadingRequest,
} from '@towelbooks/schemas';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { DateTimeRangeFields } from '../../../components/datetime/DateTimeRangeFields';
import { useToast } from '../../../components/feedback';
import { MobilePanelShell } from '../../../components/overlay';
import {
  CatalogEditionPicker,
  type CatalogEditionPickerOption,
} from '../../../features/catalog';
import { catalogWorkDetailQueryKey } from '../../../features/catalog/queryKeys';
import {
  Alert,
  Button,
  FormField,
  FormSection,
  Textarea,
} from '../../../components/primitives';
import {
  createApiProblemToast,
  getApiProblemValidationErrors,
} from '../../../features/errors';
import { useI18n } from '../../../i18n';
import {
  browserLocalDateTimePartsToUtcIso,
  browserLocalDateTimeRangeFromUtcIso,
  validateLocalDateTimeRange,
  type LocalDateTimeRangeErrorCode,
  type LocalDateTimeRangeParts,
} from '../../../lib/datetime';
import { sdk } from '../../../lib/sdk';

const FORM_ID = 'room-reading-edit-form';
const TITLE_ID = 'room-reading-edit-panel-title';

type ReadingEditPanelProps = {
  roomId: string;
  onClose: () => void;
  reading: Reading;
};

type ReadingEditField = 'description' | 'startsAt' | 'endsAt';

function getDateTimeErrorMessage(
  code: LocalDateTimeRangeErrorCode,
  t: ReturnType<typeof useI18n>['t'],
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

export function ReadingEditPanel({
  roomId,
  onClose,
  reading,
}: ReadingEditPanelProps) {
  const queryClient = useQueryClient();
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const editionWarningShownRef = useRef(false);
  const currentEdition = reading.catalogEdition ?? null;
  const initialEditionId = currentEdition?.id ?? null;

  const [descriptionDraft, setDescriptionDraft] = useState(
    reading.description ?? '',
  );
  const [scheduleDraft, setScheduleDraft] = useState<LocalDateTimeRangeParts>(
    () => browserLocalDateTimeRangeFromUtcIso(reading.startsAt, reading.endsAt),
  );
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(
    initialEditionId,
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ReadingEditField, string>>
  >({});
  const [serverError, setServerError] = useState<string | null>(null);

  const catalogWorkQuery = useQuery({
    queryKey: catalogWorkDetailQueryKey(reading.catalogWorkId, locale),
    queryFn: () => sdk.catalog.get(reading.catalogWorkId),
    retry: false,
  });

  useEffect(() => {
    if (!catalogWorkQuery.error || editionWarningShownRef.current) {
      return;
    }

    editionWarningShownRef.current = true;
    pushToast({
      message: t('rooms.readingFlow.edition.loadWarning'),
      title: t('rooms.readingFlow.edition.loadWarningTitle'),
      variant: 'warning',
    });
  }, [catalogWorkQuery.error, pushToast, t]);

  const currentEditionOption: CatalogEditionPickerOption | null = currentEdition
    ? {
        coverThumbnailUrl: currentEdition.coverThumbnailUrl,
        coverUrl: currentEdition.coverUrl,
        id: currentEdition.id,
        isbn10: currentEdition.isbn10,
        isbn13: currentEdition.isbn13,
        language: currentEdition.language,
        pageCount: currentEdition.pageCount,
        publishedDate: currentEdition.publishedDate,
        publisher: currentEdition.publisher,
        subtitle: currentEdition.subtitle,
        title: currentEdition.title,
      }
    : null;
  const fetchedEditions = catalogWorkQuery.data?.catalogEditions ?? [];
  const catalogEditions =
    currentEditionOption &&
    !fetchedEditions.some((edition) => edition.id === currentEditionOption.id)
      ? [currentEditionOption, ...fetchedEditions]
      : fetchedEditions;

  const updateMutation = useMutation({
    mutationFn: (body: UpdateReadingRequest) =>
      sdk.readings.update(roomId, reading.id, body),
    onSuccess: async (updatedReading) => {
      queryClient.setQueryData(
        ['rooms', roomId, 'readings', reading.id, locale],
        updatedReading,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'readings', reading.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'readings'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'overview'],
        }),
      ]);

      onClose();
    },
    onError: (error: unknown) => {
      const nextFieldErrors: Partial<Record<ReadingEditField, string>> = {};

      for (const validationError of getApiProblemValidationErrors(error)) {
        if (
          validationError.field === 'description' ||
          validationError.field === 'startsAt' ||
          validationError.field === 'endsAt'
        ) {
          nextFieldErrors[validationError.field] =
            validationError.message ?? undefined;
        }
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        setServerError(null);
        return;
      }

      setServerError(t('rooms.reading.edit.error.submit'));
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'rooms.reading.edit.error.submit',
          t,
        }),
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDescription = descriptionDraft.trim();
    const nextFieldErrors: Partial<Record<ReadingEditField, string>> = {};
    const scheduleErrors = validateLocalDateTimeRange(scheduleDraft);

    for (const [field, code] of Object.entries(scheduleErrors) as Array<
      [keyof typeof scheduleErrors, LocalDateTimeRangeErrorCode]
    >) {
      nextFieldErrors[field] = getDateTimeErrorMessage(code, t);
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setServerError(null);
      return;
    }

    setFieldErrors({});
    setServerError(null);
    const body: UpdateReadingRequest = {
      description: trimmedDescription || null,
      endsAt:
        browserLocalDateTimePartsToUtcIso({
          date: scheduleDraft.endsDate,
          time: scheduleDraft.endsTime,
        }) ?? null,
      startsAt:
        browserLocalDateTimePartsToUtcIso({
          date: scheduleDraft.startsDate,
          time: scheduleDraft.startsTime,
        }) ?? null,
    };
    if (selectedEditionId !== initialEditionId) {
      body.catalogEditionId = selectedEditionId;
    }
    updateMutation.mutate(body);
  };

  const scheduleErrors = {
    endsAt: fieldErrors.endsAt,
    startsAt: fieldErrors.startsAt,
  };
  const contextLabel = t('rooms.readingForm.labels.context');

  return (
    <MobilePanelShell
      closeLabel={t('common.close')}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('rooms.reading.edit.cancel')}
          </Button>
          <Button
            disabled={catalogWorkQuery.isLoading}
            isLoading={updateMutation.isPending}
            loadingLabel={t('rooms.reading.edit.saving')}
            type="submit"
          >
            {t('rooms.reading.edit.save')}
          </Button>
        </>
      }
      formProps={{
        id: FORM_ID,
        onSubmit: handleSubmit,
      }}
      onClose={onClose}
      onOpenAutoFocus={() => {
        descriptionRef.current?.focus();
        descriptionRef.current?.select();
      }}
      panelClassName="max-w-2xl"
      title={t('rooms.reading.edit.title')}
      titleId={TITLE_ID}
    >
      {serverError ? <Alert variant="error">{serverError}</Alert> : null}

      <div className="space-y-6">
        <FormSection
          contentClassName="space-y-4"
          icon="pencil-line"
          title={contextLabel}
          withDivider
        >
          <FormField
            error={fieldErrors.description}
            hideLabel
            htmlFor="reading-edit-description"
            label={contextLabel}
          >
            <Textarea
              ref={descriptionRef}
              floatingLabel
              id="reading-edit-description"
              maxLength={READING_DESCRIPTION_MAX_LENGTH}
              onChange={(event) => {
                setDescriptionDraft(event.target.value);
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  description: undefined,
                }));
                setServerError(null);
              }}
              placeholder={contextLabel}
              showCharacterCounter
              rows={4}
              value={descriptionDraft}
              className="app-text-body resize-none"
            />
          </FormField>
        </FormSection>

        <FormSection
          contentClassName="space-y-2"
          icon="calendar-clock"
          title={t('rooms.readingForm.sections.schedule')}
          withDivider
        >
          <DateTimeRangeFields
            dateLabel={t('rooms.datetime.labels.date')}
            endsLabel={t('rooms.readingForm.labels.scheduleEnd')}
            errors={scheduleErrors}
            floatingLabel
            idPrefix="reading-edit"
            onChange={(patch) => {
              setScheduleDraft((currentDraft) => ({
                ...currentDraft,
                ...patch,
              }));
              setFieldErrors((currentErrors) => ({
                ...currentErrors,
                endsAt: undefined,
                startsAt: undefined,
              }));
              setServerError(null);
            }}
            startsLabel={t('rooms.readingForm.labels.scheduleStart')}
            timeLabel={t('rooms.datetime.labels.time')}
            value={scheduleDraft}
          />
        </FormSection>

        <FormSection
          contentClassName="space-y-3"
          description={t('rooms.readingFlow.edition.description')}
          icon="book-open"
          title={t('rooms.readingFlow.edition.title')}
          withDivider
        >
          {catalogWorkQuery.isLoading ? (
            <p
              aria-live="polite"
              className="app-text-supporting-copy text-ink-3"
            >
              {t('rooms.readingFlow.edition.loading')}
            </p>
          ) : (
            <>
              {catalogWorkQuery.error ? (
                <p className="app-text-supporting-copy text-ink-3">
                  {t('rooms.readingFlow.edition.loadFallback')}
                </p>
              ) : null}
              <CatalogEditionPicker
                authorFallback={
                  reading.work.contributors.join(', ') ||
                  t('myLibrary.common.noContributor')
                }
                disabled={updateMutation.isPending}
                editions={catalogEditions}
                onChange={setSelectedEditionId}
                selectedEditionId={selectedEditionId}
              />
            </>
          )}
        </FormSection>
      </div>
    </MobilePanelShell>
  );
}
