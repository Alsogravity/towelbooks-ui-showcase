import {
  AppActionGroup,
  AppPropertyList,
  AppPropertyRow,
} from '../../../components/application';
import { Alert, Button, FormField } from '../../../components/primitives';

import type { useI18n } from '../../../i18n';
import type { RoomInvite } from '../types';
type RoomInviteLinkAlertProps = {
  copyStatus: string | null;
  emailDeliverySummary: RoomInvite['emailDeliverySummary'] | null;
  inviteUrl: string;
  onCopyInviteLink: () => void;
  onDismiss: () => void;
  restrictionType: 'allowed_emails' | 'none';
  t: ReturnType<typeof useI18n>['t'];
};

export function RoomInviteLinkAlert({
  copyStatus,
  emailDeliverySummary,
  inviteUrl,
  onCopyInviteLink,
  onDismiss,
  restrictionType,
  t,
}: RoomInviteLinkAlertProps) {
  return (
    <Alert variant="success">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="app-text-dialog-title text-ink">
            {t('invites.reveal.title')}
          </p>
          <p className="meta text-ink-3">{t('invites.reveal.securityNote')}</p>
          <p className="meta text-ink-3">
            {t(
              restrictionType === 'allowed_emails'
                ? 'invites.reveal.restrictedNote'
                : 'invites.reveal.openNote',
            )}
          </p>
          <p className="meta text-ink-3">
            {emailDeliverySummary
              ? t('invites.reveal.emailQueued', {
                  values: {
                    queued: emailDeliverySummary.queued,
                    requested: emailDeliverySummary.requested,
                  },
                })
              : t('invites.reveal.manualShareNote')}
          </p>
          {emailDeliverySummary ? (
            <AppPropertyList className="mt-2">
              <AppPropertyRow
                label={t('invites.reveal.emailDeliveryLabel')}
                value={t('invites.reveal.emailDeliveryValue', {
                  values: {
                    queued: emailDeliverySummary.queued,
                    requested: emailDeliverySummary.requested,
                  },
                })}
              />
            </AppPropertyList>
          ) : null}
          {emailDeliverySummary &&
          emailDeliverySummary.queued < emailDeliverySummary.requested ? (
            <p className="meta text-ink-3">
              {t('invites.reveal.emailSomeNotSent')}
            </p>
          ) : null}
        </div>

        <FormField label={t('invites.reveal.urlLabel')}>
          <div className="flex flex-col gap-2 sm:flex-row">
            {/*
             * The control is wrapped (input + copy button), so FormField
             * cannot auto-associate its label with the input. Name the input
             * directly with aria-label instead of htmlFor, which would land on
             * the wrapper div and leave the field unlabeled.
             */}
            <input
              aria-label={t('invites.reveal.urlLabel')}
              readOnly
              value={inviteUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 rounded-sm border border-rule bg-vellum px-2 py-2 font-mono text-xs text-ink"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prependIcon="copy"
              onClick={onCopyInviteLink}
            >
              {t('invites.reveal.copy')}
            </Button>
          </div>
        </FormField>

        <p
          className="meta min-h-[1.25rem] text-ink-3"
          aria-live="polite"
          role="status"
        >
          {copyStatus ?? ''}
        </p>

        <AppActionGroup className="justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            {t('invites.reveal.dismiss')}
          </Button>
        </AppActionGroup>
      </div>
    </Alert>
  );
}
