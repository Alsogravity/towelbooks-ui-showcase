import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH,
  type AppLocale,
  type LibraryItemDetailEdition,
  type LibraryItem,
  type LibraryItemReadingSession,
  type LibraryItemReadingStatus,
} from '@towelbooks/schemas';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { EmptyState, useToast } from '../../../../components/feedback';
import { ResponsiveOverlayShell } from '../../../../components/overlay';
import {
  Button,
  Card,
  DialogActions,
  FormField,
  Icon,
  InlineConfirm,
  Input,
  Select,
  Tag,
} from '../../../../components/primitives';
import {
  ApiProblemPageState,
  createApiProblemToast,
  handleApiProblem,
} from '../../../../features/errors';
import {
  invalidateLibraryItemReadingSessionSurface,
  libraryItemReadingSessionQueryKey,
  libraryItemReadingSessionsQueryKey,
} from '../../../../features/libraries/queryInvalidation';
import { useI18n } from '../../../../i18n';
import { useIsBelowSmViewport } from '../../../../layouts/app/shellViewport';
import { formatPublicationCalendarDate } from '../../../../lib/datetime';
import { sdk } from '../../../../lib/sdk';
import { LibraryItemReadingNotesSection } from './LibraryItemReadingNotesSection';
import { LibrarySection } from '../../ui/LibrarySection';
import {
  getItemTitle,
  ownershipFormatLabelKeys,
  ownershipPlatformLabelKeys,
  readingStatusValues,
  statusConfig,
} from '../../ui/libraryPageShared';

const PAGE_MAX = 50_000;
const TITLE_MAX_LENGTH = LIBRARY_ITEM_READING_SESSION_TITLE_MAX_LENGTH;
const sessionMutationMessageKeys = {
  CONFLICT: 'myLibrary.items.sessions.error.conflict',
};

type SessionDraft = {
  catalogEditionId: string;
  currentPage: string;
  finishedAt: string;
  libraryItemOwnershipId: string;
  startedAt: string;
  status: LibraryItemReadingStatus;
  title: string;
  totalPages: string;
};

type SessionValidationErrors = Partial<
  Record<keyof SessionDraft | 'form', string>
>;

type ReadingSessionEditorState =
  | {
      getReturnFocusElement: () => HTMLElement | null;
      mode: 'create';
    }
  | {
      getReturnFocusElement: () => HTMLElement | null;
      mode: 'edit';
      session: LibraryItemReadingSession;
      sessionId: string;
    };

function createSessionDraft(
  session?: LibraryItemReadingSession | null,
): SessionDraft {
  return {
    catalogEditionId: session?.catalogEditionId ?? '',
    currentPage: session?.currentPage?.toString() ?? '',
    finishedAt: session?.finishedAt ?? '',
    libraryItemOwnershipId: session?.libraryItemOwnershipId ?? '',
    startedAt: session?.startedAt ?? '',
    status: session?.status ?? 'not_started',
    title: session?.title ?? '',
    totalPages: session?.totalPages?.toString() ?? '',
  };
}

function parseOptionalInteger(
  value: string,
  options: { max: number; min: number },
): number | null | 'invalid' {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < options.min ||
    parsed > options.max
  ) {
    return 'invalid';
  }

  return parsed;
}

function validateSessionDraft(
  draft: SessionDraft,
  t: ReturnType<typeof useI18n>['t'],
): SessionValidationErrors {
  const errors: SessionValidationErrors = {};
  const currentPage = parseOptionalInteger(draft.currentPage, {
    min: 0,
    max: PAGE_MAX,
  });
  const totalPages = parseOptionalInteger(draft.totalPages, {
    min: 1,
    max: PAGE_MAX,
  });

  if (currentPage === 'invalid') {
    errors.currentPage = t('myLibrary.items.sessions.validation.currentPage');
  }
  if (totalPages === 'invalid') {
    errors.totalPages = t('myLibrary.items.sessions.validation.totalPages');
  }
  if (draft.title.trim().length > TITLE_MAX_LENGTH) {
    errors.title = t('myLibrary.items.sessions.validation.titleMax');
  }
  if (
    typeof currentPage === 'number' &&
    typeof totalPages === 'number' &&
    currentPage > totalPages
  ) {
    errors.currentPage = t(
      'myLibrary.items.sessions.validation.currentPageExceedsTotal',
    );
  }
  if (
    draft.startedAt &&
    draft.finishedAt &&
    draft.startedAt > draft.finishedAt
  ) {
    errors.startedAt = t('myLibrary.items.sessions.validation.dateOrder');
  }

  return errors;
}

function serializeSessionDraft(
  draft: SessionDraft,
  options: { omitEmptyTotalPages?: boolean } = {},
) {
  const currentPage = parseOptionalInteger(draft.currentPage, {
    min: 0,
    max: PAGE_MAX,
  });
  const totalPages = parseOptionalInteger(draft.totalPages, {
    min: 1,
    max: PAGE_MAX,
  });

  if (currentPage === 'invalid' || totalPages === 'invalid') {
    throw new Error('Session draft must be validated before serialization.');
  }

  return {
    catalogEditionId: draft.catalogEditionId || null,
    currentPage: currentPage === null ? null : currentPage,
    finishedAt: draft.finishedAt || null,
    libraryItemOwnershipId: draft.libraryItemOwnershipId || null,
    startedAt: draft.startedAt || null,
    status: draft.status,
    title: draft.title.trim() || null,
    ...(options.omitEmptyTotalPages && totalPages === null
      ? {}
      : { totalPages: totalPages === null ? null : totalPages }),
  };
}

function getEditionLabel(
  catalogEditions: LibraryItemDetailEdition[],
  editionId: string,
  locale: AppLocale,
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (!editionId) {
    return null;
  }

  const edition = catalogEditions.find((item) => item.id === editionId);
  if (!edition) {
    return t('myLibrary.items.sessions.unknownEdition');
  }

  const details = [
    edition.publisher,
    formatPublicationCalendarDate(edition.publishedDate, locale),
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(' · ');
  return details ? `${edition.title} · ${details}` : edition.title;
}

function getOwnershipLabel(
  item: LibraryItem,
  ownershipId: string,
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (!ownershipId) {
    return null;
  }

  const ownership = item.ownerships.find((value) => value.id === ownershipId);
  if (!ownership) {
    return t('myLibrary.items.sessions.unknownOwnership');
  }

  const format = t(ownershipFormatLabelKeys[ownership.format]);
  const platform =
    ownership.platform && ownership.platform !== 'unknown'
      ? t(ownershipPlatformLabelKeys[ownership.platform])
      : null;
  return platform ? `${format} · ${platform}` : format;
}

function getSessionProgressValue(
  session: LibraryItemReadingSession,
): number | null {
  if (
    session.currentPage === null ||
    session.totalPages === null ||
    session.totalPages <= 0
  ) {
    return null;
  }

  return Math.min(Math.max(session.currentPage, 0), session.totalPages);
}

function getSessionProgressPercentage(
  session: LibraryItemReadingSession,
): number | null {
  const progressValue = getSessionProgressValue(session);
  if (progressValue === null || session.totalPages === null) {
    return null;
  }

  return Math.round((progressValue / session.totalPages) * 100);
}

function SessionEditor({
  catalogEditions,
  className = 'space-y-6 border-t border-rule/30 pt-6',
  formId,
  initialSession,
  item,
  onSubmit,
  showFieldHints,
}: {
  catalogEditions: LibraryItemDetailEdition[];
  className?: string;
  formId: string;
  initialSession?: LibraryItemReadingSession | null;
  item: LibraryItem;
  onSubmit: (draft: SessionDraft) => Promise<unknown>;
  showFieldHints: boolean;
}) {
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const [draft, setDraft] = useState(() => createSessionDraft(initialSession));
  const [errors, setErrors] = useState<SessionValidationErrors>({});
  const prefix = initialSession?.id ?? 'new';
  const useFloatingLabels = initialSession === null;
  const updateDraft = <K extends keyof SessionDraft>(
    key: K,
    value: SessionDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };
  const updateEdition = (editionId: string) => {
    const pageCount = catalogEditions.find(
      (edition) => edition.id === editionId,
    )?.pageCount;
    setDraft((current) => ({
      ...current,
      catalogEditionId: editionId,
      totalPages: pageCount?.toString() ?? '',
    }));
    setErrors((current) => ({
      ...current,
      catalogEditionId: undefined,
      totalPages: undefined,
      form: undefined,
    }));

    if (pageCount !== null && pageCount !== undefined) {
      pushToast({
        title: t('myLibrary.items.sessions.totalPagesUpdated.title'),
        message: (
          <span className="inline-flex flex-wrap items-center gap-1">
            {t('myLibrary.items.sessions.totalPagesUpdated.prefix')}{' '}
            <span className="rounded-md bg-paper-2 px-1.5 py-0.5 font-semibold text-ink">
              {pageCount}
            </span>
            {t('myLibrary.items.sessions.totalPagesUpdated.suffix')}
          </span>
        ),
        variant: 'success',
      });
    }
  };

  return (
    <form
      className={className}
      id={formId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const nextErrors = validateSessionDraft(draft, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
          return;
        }

        void onSubmit(draft).catch((error: unknown) => {
          setErrors({
            form: handleApiProblem(error, {
              fallbackKey: 'myLibrary.items.sessions.error.save',
              messageKeys: sessionMutationMessageKeys,
              t,
            }).message,
          });
        });
      }}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          error={errors.title}
          hideLabel={useFloatingLabels}
          hint={
            showFieldHints ? t('myLibrary.items.sessions.titleHint') : undefined
          }
          htmlFor={`${prefix}-title`}
          label={t('myLibrary.items.sessions.titleLabel')}
        >
          <Input
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.titleLabel')
                : undefined
            }
            id={`${prefix}-title`}
            maxLength={TITLE_MAX_LENGTH}
            placeholder={t('myLibrary.items.sessions.titlePlaceholder')}
            value={draft.title}
            onChange={(event) => updateDraft('title', event.target.value)}
          />
        </FormField>

        <FormField
          hideLabel={useFloatingLabels}
          htmlFor={`${prefix}-status`}
          label={t('myLibrary.items.sessions.status')}
        >
          <Select
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.status')
                : undefined
            }
            id={`${prefix}-status`}
            value={draft.status}
            onChange={(event) =>
              updateDraft(
                'status',
                event.target.value as LibraryItemReadingStatus,
              )
            }
          >
            {readingStatusValues.map((status) => (
              <option key={status} value={status}>
                {t(statusConfig[status].labelKey)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          hideLabel={useFloatingLabels}
          htmlFor={`${prefix}-edition`}
          label={t('myLibrary.items.sessions.edition')}
        >
          <Select
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.edition')
                : undefined
            }
            id={`${prefix}-edition`}
            value={draft.catalogEditionId}
            onChange={(event) => updateEdition(event.target.value)}
          >
            <option value="">
              {t('myLibrary.items.sessions.noneSelected')}
            </option>
            {catalogEditions.map((edition) => (
              <option key={edition.id} value={edition.id}>
                {getEditionLabel(catalogEditions, edition.id, locale, t)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          hideLabel={useFloatingLabels}
          htmlFor={`${prefix}-ownership`}
          label={t('myLibrary.items.sessions.ownership')}
        >
          <Select
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.ownership')
                : undefined
            }
            id={`${prefix}-ownership`}
            value={draft.libraryItemOwnershipId}
            onChange={(event) =>
              updateDraft('libraryItemOwnershipId', event.target.value)
            }
          >
            <option value="">
              {t('myLibrary.items.sessions.noneSelected')}
            </option>
            {item.ownerships.map((ownership) => (
              <option key={ownership.id} value={ownership.id}>
                {getOwnershipLabel(item, ownership.id, t)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          error={errors.currentPage}
          hideLabel={useFloatingLabels}
          hint={
            showFieldHints
              ? t('myLibrary.items.sessions.currentPageHint')
              : undefined
          }
          htmlFor={`${prefix}-current-page`}
          label={t('myLibrary.items.sessions.currentPage')}
        >
          <Input
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.currentPage')
                : undefined
            }
            id={`${prefix}-current-page`}
            max={PAGE_MAX}
            min={0}
            type="number"
            value={draft.currentPage}
            onChange={(event) => updateDraft('currentPage', event.target.value)}
          />
        </FormField>

        <FormField
          error={errors.totalPages}
          hideLabel={useFloatingLabels}
          hint={
            showFieldHints
              ? t('myLibrary.items.sessions.totalPagesHint')
              : undefined
          }
          htmlFor={`${prefix}-total-pages`}
          label={t('myLibrary.items.sessions.totalPages')}
        >
          <Input
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.totalPages')
                : undefined
            }
            id={`${prefix}-total-pages`}
            max={PAGE_MAX}
            min={1}
            type="number"
            value={draft.totalPages}
            onChange={(event) => updateDraft('totalPages', event.target.value)}
          />
        </FormField>

        <FormField
          error={errors.startedAt}
          hideLabel={useFloatingLabels}
          hint={
            showFieldHints
              ? t('myLibrary.items.sessions.startedAtHint')
              : undefined
          }
          htmlFor={`${prefix}-started-at`}
          label={t('myLibrary.items.sessions.startedAt')}
        >
          <Input
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.startedAt')
                : undefined
            }
            id={`${prefix}-started-at`}
            max={draft.finishedAt || undefined}
            type="date"
            value={draft.startedAt}
            onChange={(event) => updateDraft('startedAt', event.target.value)}
          />
        </FormField>

        <FormField
          error={errors.finishedAt}
          hideLabel={useFloatingLabels}
          hint={
            showFieldHints
              ? t('myLibrary.items.sessions.finishedAtHint')
              : undefined
          }
          htmlFor={`${prefix}-finished-at`}
          label={t('myLibrary.items.sessions.finishedAt')}
        >
          <Input
            floatingLabel={useFloatingLabels}
            floatingLabelText={
              useFloatingLabels
                ? t('myLibrary.items.sessions.finishedAt')
                : undefined
            }
            id={`${prefix}-finished-at`}
            min={draft.startedAt || undefined}
            type="date"
            value={draft.finishedAt}
            onChange={(event) => updateDraft('finishedAt', event.target.value)}
          />
        </FormField>
      </div>

      {errors.form ? (
        <p className="vui-form-field__error" role="alert">
          {errors.form}
        </p>
      ) : null}
    </form>
  );
}

function ReadingSessionEditorOverlay({
  catalogEditions,
  editor,
  isSaving,
  item,
  onClose,
  onSubmit,
}: {
  catalogEditions: LibraryItemDetailEdition[];
  editor: ReadingSessionEditorState;
  isSaving: boolean;
  item: LibraryItem;
  onClose: () => void;
  onSubmit: (draft: SessionDraft) => Promise<unknown>;
}) {
  const { t } = useI18n();
  const isBelowSmViewport = useIsBelowSmViewport();
  const initialSession = editor.mode === 'edit' ? editor.session : null;
  const isEditing = initialSession !== null;

  const formId = initialSession
    ? `reading-session-edit-${initialSession.id}`
    : 'reading-session-create';
  const fieldIdPrefix = initialSession?.id ?? 'new';
  const actions = (
    <>
      <Button
        type="button"
        variant={isBelowSmViewport ? 'secondary' : 'tertiary'}
        onClick={onClose}
      >
        {t('common.cancel')}
      </Button>
      <Button
        form={formId}
        isLoading={isSaving}
        loadingLabel={t('myLibrary.items.sessions.saving')}
        type="submit"
      >
        {t(
          isEditing
            ? 'myLibrary.items.sessions.save'
            : 'myLibrary.items.sessions.create',
        )}
      </Button>
    </>
  );

  return (
    <ResponsiveOverlayShell
      closeLabel={t('common.close')}
      dialogSize="lg"
      footer={
        isBelowSmViewport ? (
          actions
        ) : (
          <DialogActions stackOnMobile>{actions}</DialogActions>
        )
      }
      getReturnFocusElement={editor.getReturnFocusElement}
      onClose={onClose}
      onOpenAutoFocus={() => {
        document.getElementById(`${fieldIdPrefix}-status`)?.focus();
      }}
      title={t(
        initialSession
          ? 'myLibrary.items.sessions.editTitle'
          : 'myLibrary.items.sessions.createTitle',
      )}
    >
      <SessionEditor
        catalogEditions={catalogEditions}
        className="space-y-6"
        formId={formId}
        initialSession={initialSession}
        item={item}
        onSubmit={async (draft) => {
          await onSubmit(draft);
          onClose();
        }}
        showFieldHints={isEditing}
      />
    </ResponsiveOverlayShell>
  );
}

function ReadingSessionDetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="app-text-label text-ink-3">{label}</dt>
      <dd className="app-text-body-sm break-words text-ink">{value}</dd>
    </div>
  );
}

function ReadingSessionProgressSummary({
  session,
  statusLabel,
}: {
  session: LibraryItemReadingSession;
  statusLabel: string;
}) {
  const { formatNumber, t } = useI18n();
  const progressValue = getSessionProgressValue(session);
  const progressPercentage = getSessionProgressPercentage(session);
  const progressMarkerPosition =
    progressPercentage === null
      ? 0
      : Math.min(Math.max(progressPercentage, 3), 97);
  const progressLabel =
    progressPercentage === null
      ? null
      : t('myLibrary.items.sessions.progress', {
          values: {
            current: session.currentPage!,
            total: session.totalPages!,
          },
        });

  return (
    <Card
      aria-labelledby={`reading-session-journey-${session.id}`}
      className="relative space-y-6 overflow-hidden"
      variant="bookplate"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-forest/30 bg-forest-soft/60 text-forest shadow-sm">
            <Icon aria-hidden="true" name="bookmark" size={22} />
          </span>
          <div className="min-w-0">
            <p
              className="app-text-label text-ink-3"
              id={`reading-session-journey-${session.id}`}
            >
              {t('myLibrary.items.sessions.journeyTitle')}
            </p>
            {progressPercentage === null ? (
              <p className="app-text-body-sm mt-1 text-ink-2">
                {t('myLibrary.items.sessions.progressUnavailable')}
              </p>
            ) : (
              <p className="app-text-stat-value mt-0.5 text-ink">
                {formatNumber(progressPercentage)}%
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <span className="app-text-label text-ink-3">
            {t('myLibrary.items.sessions.status')}
          </span>
          <Tag
            variant={statusConfig[session.status].tagVariant}
            withDot={false}
          >
            {statusLabel}
          </Tag>
        </div>
      </div>

      {progressPercentage !== null && progressValue !== null ? (
        <div className="space-y-2">
          <p className="app-text-metadata text-ink-2">{progressLabel}</p>
          <div className="relative h-7" aria-hidden="true">
            <progress
              className="app-progress app-progress--md app-progress--forest absolute inset-x-0 top-1/2 -translate-y-1/2"
              max={session.totalPages!}
              value={progressValue}
            />
            <span
              className="absolute top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-paper bg-forest text-paper shadow-sm"
              style={{ left: `${progressMarkerPosition}%` }}
            >
              <Icon aria-hidden="true" name="bookmark" size={14} />
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="app-text-caption text-ink-3">
              {t('myLibrary.items.sessions.journeyBeginning')}
            </span>
            <span className="app-text-caption text-center font-medium text-forest">
              {t('myLibrary.items.sessions.journeyCurrent')}
            </span>
            <span className="app-text-caption text-right text-ink-3">
              {t('myLibrary.items.sessions.journeyFinish')}
            </span>
          </div>
          <progress
            aria-label={
              progressLabel ?? t('myLibrary.items.sessions.progressLabel')
            }
            aria-valuemax={session.totalPages!}
            aria-valuemin={0}
            aria-valuenow={progressValue}
            className="sr-only"
            max={session.totalPages!}
            value={progressValue}
          />
        </div>
      ) : null}
    </Card>
  );
}

function ReadingSessionDetailBackButton({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backButtonRef.current?.focus();
  }, []);

  return (
    <Button
      ref={backButtonRef}
      prependIcon="chevron-left"
      size="sm"
      variant="tertiary"
      onClick={onBack}
    >
      {t('myLibrary.items.sessions.backToList')}
    </Button>
  );
}

function ReadingSessionTimelineField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-7 top-1.5 size-2.5 rounded-full bg-forest ring-4 ring-paper"
      />
      <ReadingSessionDetailField label={label} value={value} />
    </div>
  );
}

function ReadingSessionDetail({
  canManage,
  catalogEditions,
  isDeleting,
  isEditing,
  item,
  onBack,
  onDelete,
  onEdit,
  session,
}: {
  canManage: boolean;
  catalogEditions: LibraryItemDetailEdition[];
  isDeleting: boolean;
  isEditing: boolean;
  item: LibraryItem;
  onBack: () => void;
  onDelete: () => void;
  onEdit: (getReturnFocusElement: () => HTMLElement | null) => void;
  session: LibraryItemReadingSession;
}) {
  const { formatDate, formatDateTime, formatNumber, locale, t } = useI18n();
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const sessionTitle = session.title?.trim() || null;
  const itemTitle = getItemTitle(item);
  const statusLabel = t(statusConfig[session.status].labelKey);
  const editionLabel = getEditionLabel(
    catalogEditions,
    session.catalogEditionId ?? '',
    locale,
    t,
  );
  const ownershipLabel = getOwnershipLabel(
    item,
    session.libraryItemOwnershipId ?? '',
    t,
  );

  const formatSessionDate = (value: string) =>
    formatDate(new Date(`${value}T00:00:00.000Z`));

  return (
    <div
      aria-labelledby={`reading-session-detail-${session.id}`}
      className="space-y-8"
      role="region"
    >
      <div className="flex flex-col gap-5 border-b border-rule/30 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <ReadingSessionDetailBackButton onBack={onBack} />
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="app-text-entity-title break-words text-ink"
              id={`reading-session-detail-${session.id}`}
            >
              {sessionTitle ?? t('myLibrary.items.sessions.detailTitle')}
            </h3>
            <span className="rounded-full border border-rule/50 bg-paper-2 px-2 py-0.5 text-xs font-semibold text-ink-3">
              {statusLabel}
            </span>
          </div>
          <p className="app-text-supporting-copy text-ink-3">
            {t('myLibrary.items.sessions.detailDescription')}
          </p>
        </div>

        {canManage ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              aria-expanded={isNotesOpen}
              aria-label={t(
                isNotesOpen
                  ? 'myLibrary.items.notes.closeAria'
                  : 'myLibrary.items.notes.openAria',
                { values: { status: statusLabel } },
              )}
              size="sm"
              variant="tertiary"
              onClick={() => setIsNotesOpen((current) => !current)}
            >
              {isNotesOpen
                ? t('myLibrary.items.notes.close')
                : t('myLibrary.items.notes.open')}
            </Button>
            <Button
              aria-expanded={isEditing}
              aria-label={t(
                sessionTitle
                  ? 'myLibrary.items.sessions.editAriaWithTitle'
                  : 'myLibrary.items.sessions.editAria',
                {
                  values: { status: statusLabel, title: sessionTitle ?? '' },
                },
              )}
              ref={editButtonRef}
              size="sm"
              variant="secondary"
              onClick={() => onEdit(() => editButtonRef.current)}
            >
              {t('myLibrary.items.sessions.edit')}
            </Button>
            <InlineConfirm
              cancelLabel={t('myLibrary.items.sessions.deleteCancel')}
              confirmLabel={t('myLibrary.items.sessions.deleteConfirm')}
              isLoading={isDeleting}
              message={t('myLibrary.items.sessions.deletePrompt')}
              onConfirm={onDelete}
              trigger={
                <Button
                  aria-label={t('myLibrary.items.sessions.deleteAria')}
                  size="sm"
                  variant="ghost"
                >
                  {t('myLibrary.items.sessions.delete')}
                </Button>
              }
              confirmVariant="danger"
            />
          </div>
        ) : null}
      </div>

      <ReadingSessionProgressSummary
        session={session}
        statusLabel={statusLabel}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <section
          aria-labelledby={`reading-session-context-${session.id}`}
          className="space-y-5"
        >
          <h4
            className="app-text-section-title text-ink"
            id={`reading-session-context-${session.id}`}
          >
            {t('myLibrary.items.sessions.contextTitle')}
          </h4>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <ReadingSessionDetailField
              label={t('myLibrary.items.sessions.book')}
              value={itemTitle}
            />
            {session.currentPage !== null ? (
              <ReadingSessionDetailField
                label={t('myLibrary.items.sessions.currentPage')}
                value={formatNumber(session.currentPage)}
              />
            ) : null}
            {session.totalPages !== null ? (
              <ReadingSessionDetailField
                label={t('myLibrary.items.sessions.totalPages')}
                value={formatNumber(session.totalPages)}
              />
            ) : null}
            {editionLabel ? (
              <ReadingSessionDetailField
                label={t('myLibrary.items.sessions.edition')}
                value={editionLabel}
              />
            ) : null}
            {ownershipLabel ? (
              <ReadingSessionDetailField
                label={t('myLibrary.items.sessions.ownership')}
                value={ownershipLabel}
              />
            ) : null}
          </dl>
        </section>

        <section
          aria-labelledby={`reading-session-timeline-${session.id}`}
          className="space-y-5"
        >
          <h4
            className="app-text-section-title text-ink"
            id={`reading-session-timeline-${session.id}`}
          >
            {t('myLibrary.items.sessions.timelineTitle')}
          </h4>
          <dl className="relative space-y-6 border-l border-rule/50 pl-6">
            {session.startedAt ? (
              <ReadingSessionTimelineField
                label={t('myLibrary.items.sessions.startedAt')}
                value={formatSessionDate(session.startedAt)}
              />
            ) : null}
            {session.finishedAt ? (
              <ReadingSessionTimelineField
                label={t('myLibrary.items.sessions.finishedAt')}
                value={formatSessionDate(session.finishedAt)}
              />
            ) : null}
            <ReadingSessionTimelineField
              label={t('myLibrary.items.sessions.createdAt')}
              value={formatDateTime(new Date(session.createdAt))}
            />
            <ReadingSessionTimelineField
              label={t('myLibrary.items.sessions.updatedLabel')}
              value={formatDateTime(new Date(session.updatedAt))}
            />
          </dl>
        </section>
      </div>

      {canManage && isNotesOpen ? (
        <LibraryItemReadingNotesSection
          libraryId={item.libraryId}
          libraryItemId={item.id}
          session={session}
        />
      ) : null}
    </div>
  );
}

function ReadingSessionRow({
  catalogEditions,
  item,
  onSelect,
  onSummaryRef,
  session,
}: {
  catalogEditions: LibraryItemDetailEdition[];
  item: LibraryItem;
  onSelect: () => void;
  onSummaryRef: (element: HTMLButtonElement | null) => void;
  session: LibraryItemReadingSession;
}) {
  const { formatDate, formatNumber, locale, t } = useI18n();
  const itemTitle = getItemTitle(item);
  const sessionTitle = session.title?.trim() || null;
  const title = sessionTitle ?? itemTitle;
  const statusLabel = t(statusConfig[session.status].labelKey);
  const editionLabel = getEditionLabel(
    catalogEditions,
    session.catalogEditionId ?? '',
    locale,
    t,
  );
  const ownershipLabel = getOwnershipLabel(
    item,
    session.libraryItemOwnershipId ?? '',
    t,
  );
  const progressLabel =
    session.currentPage !== null && session.totalPages !== null
      ? t('myLibrary.items.sessions.progress', {
          values: { current: session.currentPage, total: session.totalPages },
        })
      : null;
  const progressPercentage = getSessionProgressPercentage(session);

  return (
    <li>
      <button
        ref={onSummaryRef}
        aria-label={t(
          sessionTitle
            ? 'myLibrary.items.sessions.openAriaWithTitle'
            : 'myLibrary.items.sessions.openAria',
          {
            values: { status: statusLabel, title: sessionTitle ?? '' },
          },
        )}
        className="group flex w-full min-w-0 items-start gap-4 rounded-[var(--radius-paper-4)] border border-rule bg-paper px-4 py-4 text-left shadow-sm transition-colors hover:border-brick/30 hover:bg-vellum/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 sm:px-5 sm:py-5"
        type="button"
        onClick={onSelect}
      >
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-brick-soft/40 text-brick">
          <Icon aria-hidden="true" name="scroll-text" size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <span className="app-text-row-title min-w-0 text-ink transition-colors group-hover:text-brick">
              {title}
            </span>
            <Tag
              className="app-text-caption shrink-0"
              variant={statusConfig[session.status].tagVariant}
              withDot={false}
            >
              {statusLabel}
            </Tag>
          </span>

          <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-rule/40 pt-3 app-text-supporting-copy text-ink-2">
            {sessionTitle ? <span>{itemTitle}</span> : null}
            {editionLabel ? <span>{editionLabel}</span> : null}
            {ownershipLabel ? <span>{ownershipLabel}</span> : null}
            {session.startedAt ? (
              <span>
                {t('myLibrary.items.sessions.startedOn', {
                  values: {
                    date: formatDate(
                      new Date(`${session.startedAt}T00:00:00.000Z`),
                    ),
                  },
                })}
              </span>
            ) : null}
            {session.finishedAt ? (
              <span>
                {t('myLibrary.items.sessions.finishedOn', {
                  values: {
                    date: formatDate(
                      new Date(`${session.finishedAt}T00:00:00.000Z`),
                    ),
                  },
                })}
              </span>
            ) : null}
          </span>

          {progressLabel ? (
            <span className="mt-3 flex items-center gap-3">
              <span className="app-text-metadata min-w-0 flex-1 truncate text-ink-2">
                {progressLabel}
              </span>
              {progressPercentage !== null ? (
                <span className="app-text-metadata shrink-0 font-mono text-ink-3">
                  {formatNumber(progressPercentage)}%
                </span>
              ) : null}
              <progress
                aria-label={progressLabel}
                aria-valuemax={session.totalPages!}
                aria-valuemin={0}
                aria-valuenow={Math.min(
                  Math.max(session.currentPage!, 0),
                  session.totalPages!,
                )}
                className="app-progress app-progress--xs app-progress--forest w-20 shrink-0 sm:w-28"
                max={session.totalPages!}
                value={Math.min(
                  Math.max(session.currentPage!, 0),
                  session.totalPages!,
                )}
              />
            </span>
          ) : null}
        </span>

        <Icon
          aria-hidden="true"
          className="mt-1 shrink-0 text-ink-3 transition-colors group-hover:text-brick"
          name="chevron-right"
          size={20}
        />
      </button>
    </li>
  );
}

export function LibraryItemReadingSessionsSection({
  canManage,
  catalogEditions,
  item,
  libraryId,
}: {
  canManage: boolean;
  catalogEditions: LibraryItemDetailEdition[];
  item: LibraryItem;
  libraryId: string;
}) {
  const access = canManage ? 'owner' : 'viewer';
  const { t } = useI18n();
  const isBelowSm = useIsBelowSmViewport();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [sessionEditor, setSessionEditor] =
    useState<ReadingSessionEditorState | null>(null);
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);
  const createSessionButtonRef = useRef<HTMLButtonElement>(null);
  const sessionSummaryRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusSessionIdRef = useRef<string | null>(null);
  const sessionsQuery = useQuery({
    queryKey: libraryItemReadingSessionsQueryKey(libraryId, item.id, access),
    queryFn: () => sdk.libraries.listItemReadingSessions(libraryId, item.id),
    retry: false,
  });
  const sessionDetailQuery = useQuery({
    enabled: Boolean(detailSessionId),
    queryKey: detailSessionId
      ? libraryItemReadingSessionQueryKey(
          libraryId,
          item.id,
          detailSessionId,
          access,
        )
      : [
          ...libraryItemReadingSessionsQueryKey(libraryId, item.id, access),
          'detail',
          null,
        ],
    queryFn: () =>
      sdk.libraries.getItemReadingSession(libraryId, item.id, detailSessionId!),
    retry: false,
  });

  useEffect(() => {
    if (detailSessionId !== null || focusSessionIdRef.current === null) {
      return;
    }

    const sessionId = focusSessionIdRef.current;
    focusSessionIdRef.current = null;
    sessionSummaryRefs.current.get(sessionId)?.focus();
  }, [detailSessionId]);

  const openSessionDetail = (sessionId: string) => {
    setDetailSessionId(sessionId);
  };

  const openCreateSessionEditor = () => {
    setSessionEditor({
      getReturnFocusElement: () => createSessionButtonRef.current,
      mode: 'create',
    });
  };

  const closeSessionDetail = () => {
    if (detailSessionId !== null) {
      focusSessionIdRef.current = detailSessionId;
    }
    setDetailSessionId(null);
  };

  const refresh = async () => {
    await invalidateLibraryItemReadingSessionSurface(
      queryClient,
      libraryId,
      item.id,
      access,
    );
  };

  const mutationOptions = {
    onSuccess: refresh,
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'myLibrary.items.sessions.error.save',
          messageKeys: sessionMutationMessageKeys,
          t,
        }),
      );
    },
  };
  const createMutation = useMutation({
    mutationFn: (draft: SessionDraft) =>
      sdk.libraries.createItemReadingSession(
        libraryId,
        item.id,
        serializeSessionDraft(draft, { omitEmptyTotalPages: true }),
      ),
    ...mutationOptions,
  });
  const updateMutation = useMutation({
    mutationFn: ({
      draft,
      session,
    }: {
      draft: SessionDraft;
      session: LibraryItemReadingSession;
    }) =>
      sdk.libraries.updateItemReadingSession(libraryId, item.id, session.id, {
        ...serializeSessionDraft(draft),
        version: session.version,
      }),
    ...mutationOptions,
    onSuccess: async (updatedSession) => {
      queryClient.setQueryData(
        libraryItemReadingSessionQueryKey(
          libraryId,
          item.id,
          updatedSession.id,
          access,
        ),
        updatedSession,
      );
      await refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (session: LibraryItemReadingSession) =>
      sdk.libraries.removeItemReadingSession(
        libraryId,
        item.id,
        session.id,
        session.version,
      ),
    ...mutationOptions,
    onSuccess: async (_result, deletedSession) => {
      if (detailSessionId === deletedSession.id) {
        setDetailSessionId(null);
      }
      await refresh();
    },
  });

  const isCreateEditorOpen = sessionEditor?.mode === 'create';
  const sessions = sessionsQuery.data ?? [];
  return (
    <>
      <LibrarySection
        actions={
          canManage && detailSessionId === null ? (
            isBelowSm ? (
              <Button
                aria-expanded={isCreateEditorOpen}
                aria-label={t('myLibrary.items.sessions.create')}
                className="shrink-0"
                disabled={createMutation.isPending}
                icon="plus"
                ref={createSessionButtonRef}
                size="sm"
                variant="icon"
                onClick={openCreateSessionEditor}
              />
            ) : (
              <Button
                aria-expanded={isCreateEditorOpen}
                disabled={createMutation.isPending}
                prependIcon="plus"
                ref={createSessionButtonRef}
                size="md"
                variant="secondary"
                onClick={openCreateSessionEditor}
              >
                {t('myLibrary.items.sessions.create')}
              </Button>
            )
          ) : undefined
        }
        icon="scroll-text"
        description={
          canManage
            ? undefined
            : t('myLibrary.items.sessions.readOnlyDescription')
        }
        title={t('myLibrary.items.sessions.title')}
      >
        {detailSessionId !== null ? (
          sessionDetailQuery.isLoading ? (
            <div className="space-y-6">
              <ReadingSessionDetailBackButton onBack={closeSessionDetail} />
              <p
                aria-live="polite"
                className="app-text-supporting-copy text-ink-3"
              >
                {t('myLibrary.items.sessions.loadingDetail')}
              </p>
            </div>
          ) : sessionDetailQuery.isError ? (
            <div className="space-y-6">
              <ReadingSessionDetailBackButton onBack={closeSessionDetail} />
              <ApiProblemPageState
                error={sessionDetailQuery.error}
                fallbackAction={
                  <Button
                    variant="secondary"
                    onClick={() => void sessionDetailQuery.refetch()}
                  >
                    {t('errors.action.retry')}
                  </Button>
                }
              />
            </div>
          ) : sessionDetailQuery.data ? (
            <ReadingSessionDetail
              canManage={canManage}
              catalogEditions={catalogEditions}
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables?.id === sessionDetailQuery.data.id
              }
              isEditing={
                sessionEditor?.mode === 'edit' &&
                sessionEditor.sessionId === sessionDetailQuery.data.id
              }
              item={item}
              onBack={closeSessionDetail}
              onDelete={() => deleteMutation.mutate(sessionDetailQuery.data)}
              onEdit={(getReturnFocusElement) =>
                setSessionEditor({
                  getReturnFocusElement,
                  mode: 'edit',
                  session: sessionDetailQuery.data,
                  sessionId: sessionDetailQuery.data.id,
                })
              }
              session={sessionDetailQuery.data}
            />
          ) : null
        ) : sessionsQuery.isLoading ? (
          <p aria-live="polite" className="app-text-supporting-copy text-ink-3">
            {t('myLibrary.items.sessions.loading')}
          </p>
        ) : sessionsQuery.isError ? (
          <div className="space-y-3">
            <p className="app-text-supporting-copy text-ink-3">
              {t('myLibrary.items.sessions.error.load')}
            </p>
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => void sessionsQuery.refetch()}
            >
              {t('myLibrary.items.retry')}
            </Button>
          </div>
        ) : (
          <>
            {sessions.length === 0 ? (
              <EmptyState
                className="mt-16"
                icon="scroll-text"
                title={{ key: 'myLibrary.items.sessions.cardNoSessions' }}
                body={{ key: 'myLibrary.items.sessions.empty' }}
              />
            ) : (
              <ol className="space-y-3">
                {sessions.map((session) => (
                  <ReadingSessionRow
                    catalogEditions={catalogEditions}
                    item={item}
                    key={`${session.id}:${item.ownerships
                      .map((ownership) => ownership.id)
                      .join(',')}`}
                    onSelect={() => openSessionDetail(session.id)}
                    onSummaryRef={(element) => {
                      if (element) {
                        sessionSummaryRefs.current.set(session.id, element);
                      } else {
                        sessionSummaryRefs.current.delete(session.id);
                      }
                    }}
                    session={session}
                  />
                ))}
              </ol>
            )}
          </>
        )}
      </LibrarySection>

      {sessionEditor ? (
        <ReadingSessionEditorOverlay
          catalogEditions={catalogEditions}
          editor={sessionEditor}
          isSaving={
            sessionEditor.mode === 'create'
              ? createMutation.isPending
              : updateMutation.isPending
          }
          item={item}
          onClose={() => setSessionEditor(null)}
          onSubmit={(draft) =>
            sessionEditor.mode === 'create'
              ? createMutation.mutateAsync(draft)
              : updateMutation.mutateAsync({
                  draft,
                  session: sessionEditor.session,
                })
          }
        />
      ) : null}
    </>
  );
}
