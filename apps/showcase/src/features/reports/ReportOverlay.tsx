import {
  REPORT_DETAILS_MAX_LENGTH,
  reportReasonsByTarget,
  type ReportReason,
  type ReportTargetType,
} from '@towelbooks/schemas';
import { getApiErrorCode } from '@towelbooks/sdk';
import { useState, useId, type FormEvent } from 'react';

import { MobileOverlayPanelShell } from '../../layouts/app/MobileOverlayPanelShell';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormField,
  FormTextareaField,
  Select,
} from '../../components/primitives';
import { useI18n, type MessageKey } from '../../i18n';
import { useIsDesktopShellViewport } from '../../layouts/app/shellViewport';
import { sdk } from '../../lib/sdk';

import { useReportOverlay } from './ReportOverlayContext';
import type { ReportTarget } from './reportHash';

const targetLabelKeys = {
  catalog_work: 'reports.form.target.catalog_work',
  comment: 'reports.form.target.comment',
  profile: 'reports.form.target.profile',
  room: 'reports.form.target.room',
} as const satisfies Record<ReportTargetType, MessageKey>;

const reasonLabelKeys = {
  harassment: 'reports.reason.harassment',
  hateful_content: 'reports.reason.hateful_content',
  impersonation: 'reports.reason.impersonation',
  incorrect_or_misleading_information:
    'reports.reason.incorrect_or_misleading_information',
  other: 'reports.reason.other',
  privacy_or_illegal_content: 'reports.reason.privacy_or_illegal_content',
  sexual_or_violent_content: 'reports.reason.sexual_or_violent_content',
  spam: 'reports.reason.spam',
} as const satisfies Record<ReportReason, MessageKey>;

type SubmissionErrorKey =
  | 'reports.form.error.alreadyOpen'
  | 'reports.form.error.generic'
  | 'reports.form.error.unauthenticated'
  | 'reports.form.error.validation';

function getSubmissionErrorKey(error: unknown): SubmissionErrorKey {
  switch (getApiErrorCode(error)) {
    case 'REPORT_ALREADY_OPEN':
      return 'reports.form.error.alreadyOpen';
    case 'UNAUTHENTICATED':
      return 'reports.form.error.unauthenticated';
    case 'VALIDATION_FAILED':
      return 'reports.form.error.validation';
    default:
      return 'reports.form.error.generic';
  }
}

function ReportFormContent({
  details,
  descriptionId,
  errorKey,
  isDisabled,
  onDetailsChange,
  onReasonChange,
  reason,
  submitted,
  target,
}: {
  details: string;
  descriptionId: string;
  errorKey: SubmissionErrorKey | 'reports.form.error.requiredReason' | null;
  isDisabled: boolean;
  onDetailsChange: (value: string) => void;
  onReasonChange: (value: ReportReason) => void;
  reason: ReportReason | null;
  submitted: boolean;
  target: ReportTarget;
}) {
  const { t } = useI18n();
  const reasonErrorId = useId();
  const hasReasonError = errorKey === 'reports.form.error.requiredReason';
  const targetLabel = t(targetLabelKeys[target.targetType]);
  const reasons = reportReasonsByTarget[target.targetType];

  return (
    <div className="space-y-6">
      <p id={descriptionId} className="supporting-copy text-ink-2">
        {submitted
          ? t('reports.form.success.body')
          : t('reports.overlay.description')}
      </p>

      {submitted ? (
        <Alert variant="success">
          <strong>{t('reports.form.success.title')}</strong>
        </Alert>
      ) : (
        <>
          {errorKey ? (
            <Alert
              id={hasReasonError ? reasonErrorId : undefined}
              variant="error"
            >
              {t(errorKey)}
            </Alert>
          ) : null}

          <FormField
            htmlFor="report-reason"
            label={t('reports.form.reason.legend', {
              values: { target: targetLabel },
            })}
          >
            <Select
              aria-describedby={hasReasonError ? reasonErrorId : undefined}
              aria-invalid={hasReasonError ? true : undefined}
              disabled={isDisabled}
              id="report-reason"
              onChange={(event) => {
                const nextReason = event.currentTarget.value as ReportReason;

                if ((reasons as readonly ReportReason[]).includes(nextReason)) {
                  onReasonChange(nextReason);
                }
              }}
              value={reason ?? ''}
            >
              {reasons.map((reasonOption) => (
                <option key={reasonOption} value={reasonOption}>
                  {t(reasonLabelKeys[reasonOption])}
                </option>
              ))}
            </Select>
          </FormField>

          <FormTextareaField
            disabled={isDisabled}
            id="report-details"
            label={t('reports.form.details.label')}
            maxLength={REPORT_DETAILS_MAX_LENGTH}
            rows={5}
            showCharacterCounter
            onChange={(event) => onDetailsChange(event.currentTarget.value)}
            value={details}
          />
        </>
      )}
    </div>
  );
}

function ReportFormActions({
  isSubmitting,
  onClose,
  submitted,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  submitted: boolean;
}) {
  const { t } = useI18n();

  if (submitted) {
    return (
      <Button onClick={onClose} type="button">
        {t('reports.form.success.close')}
      </Button>
    );
  }

  return (
    <>
      <Button disabled={isSubmitting} onClick={onClose} variant="ghost">
        {t('reports.form.cancel')}
      </Button>
      <Button
        isLoading={isSubmitting}
        loadingLabel={t('reports.form.submitting')}
        type="submit"
      >
        {t('reports.form.submit')}
      </Button>
    </>
  );
}

function ReportForm({
  getReturnFocusElement,
  onClose,
  target,
}: {
  getReturnFocusElement: () => HTMLElement | null;
  onClose: () => void;
  target: ReportTarget;
}) {
  const { t } = useI18n();
  const isDesktop = useIsDesktopShellViewport();
  const descriptionId = useId();
  const [details, setDetails] = useState('');
  const [errorKey, setErrorKey] = useState<
    SubmissionErrorKey | 'reports.form.error.requiredReason' | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitted || isSubmitting) {
      return;
    }

    if (reason === null) {
      setErrorKey('reports.form.error.requiredReason');
      return;
    }

    setErrorKey(null);
    setIsSubmitting(true);

    try {
      await sdk.reports.create({
        ...(details.trim() ? { details: details.trim() } : {}),
        reason,
        targetId: target.targetId,
        targetType: target.targetType,
      });
      setSubmitted(true);
    } catch (error) {
      setErrorKey(getSubmissionErrorKey(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <ReportFormContent
      details={details}
      descriptionId={descriptionId}
      errorKey={errorKey}
      isDisabled={isSubmitting}
      onDetailsChange={(value) => {
        setDetails(value);
        setErrorKey(null);
      }}
      onReasonChange={(value) => {
        setReason(value);
        setErrorKey(null);
      }}
      reason={reason}
      submitted={submitted}
      target={target}
    />
  );

  const actions = (
    <ReportFormActions
      isSubmitting={isSubmitting}
      onClose={onClose}
      submitted={submitted}
    />
  );

  if (isDesktop) {
    return (
      <Dialog
        aria-describedby={descriptionId}
        closeButtonLabel={t('common.close')}
        getReturnFocusElement={getReturnFocusElement}
        onClose={onClose}
        showCloseButton
        title={t('reports.overlay.title')}
      >
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <DialogBody className="gap-6 px-6 py-6">{content}</DialogBody>
          <DialogActions>{actions}</DialogActions>
        </form>
      </Dialog>
    );
  }

  return (
    <MobileOverlayPanelShell
      ariaDescribedBy={descriptionId}
      contentClassName="gap-6 px-4 pb-8 pt-2"
      getReturnFocusElement={getReturnFocusElement}
      headerConfig={{
        title: t('reports.overlay.title'),
        trailingAction: {
          ariaLabel: t('common.close'),
          iconName: 'x',
          onClick: onClose,
        },
      }}
      onClose={onClose}
      title={t('reports.overlay.title')}
      titleId="report-overlay-title"
    >
      <form onSubmit={(event) => void handleSubmit(event)}>
        {content}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-rule pt-6">
          {actions}
        </div>
      </form>
    </MobileOverlayPanelShell>
  );
}

export function ReportOverlay() {
  const { closeReport, currentTarget, getReturnFocusElement, isOpen } =
    useReportOverlay();

  if (!isOpen || currentTarget === null) {
    return null;
  }

  return (
    <ReportForm
      key={`${currentTarget.targetType}:${currentTarget.targetId}`}
      getReturnFocusElement={getReturnFocusElement}
      onClose={closeReport}
      target={currentTarget}
    />
  );
}
