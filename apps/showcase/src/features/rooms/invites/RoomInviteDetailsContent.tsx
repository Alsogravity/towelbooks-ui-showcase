import {
  AppPropertyList,
  AppPropertyRow,
  AppSubsection,
} from '../../../components/application';
import {
  Button,
  Dialog,
  DialogBody,
  InlineConfirm,
  Tag,
} from '../../../components/primitives';
import { UserAvatar } from '../../../entities/user/ui';
import { useI18n } from '../../../i18n';
import { InviteLinkSection } from './InviteLinkSection';
import { RoomInviteLinkAlert } from './RoomInviteLinkAlert';
import {
  getInviteStatus,
  getInviteStatusLabel,
  type InviteStatus,
} from '../roomCopy';

import type { RoomInviteDetailsResponse } from '../types';

const inviteStatusVariant: Record<
  InviteStatus,
  'default' | 'gilt' | 'private' | 'reading'
> = {
  active: 'reading',
  expired: 'gilt',
  revoked: 'private',
  used: 'default',
};

type RoomInviteDetailsContentProps = {
  createdInviteRestrictionType?: 'allowed_emails' | 'none' | null;
  details: RoomInviteDetailsResponse;
  inviteUrl?: string | null;
  copyStatus?: string | null;
  isGeneratingLink: boolean;
  isRevokingInvite: boolean;
  onCopyInviteLink?: () => void;
  onDismissCreatedAlert?: () => void;
  onGenerateLink: () => Promise<string>;
  onRevokeInvite: () => void;
};

export function RoomInviteDetailsContent({
  createdInviteRestrictionType = null,
  details,
  inviteUrl = null,
  copyStatus = null,
  isGeneratingLink,
  isRevokingInvite,
  onCopyInviteLink,
  onDismissCreatedAlert,
  onGenerateLink,
  onRevokeInvite,
}: RoomInviteDetailsContentProps) {
  const { formatDate, formatNumber, t } = useI18n();
  const status = getInviteStatus(details.invite);
  const isRestricted = details.invite.restriction.type === 'allowed_emails';
  const acceptedAllowedEmails = details.allowedEmails.filter(
    (item) => item.status === 'accepted',
  );
  const pendingAllowedEmails = details.allowedEmails.filter(
    (item) => item.status === 'pending',
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <AppSubsection title={t('invites.details.summary.title')}>
          <AppPropertyList>
            <AppPropertyRow
              label={t('invites.details.summary.status')}
              value={
                <Tag variant={inviteStatusVariant[status]}>
                  {getInviteStatusLabel(t, status)}
                </Tag>
              }
            />
            <AppPropertyRow
              label={t('invites.details.summary.restriction')}
              value={
                <Tag variant={isRestricted ? 'gilt' : 'default'}>
                  {isRestricted
                    ? t('invites.details.restriction.restricted')
                    : t('invites.details.restriction.open')}
                </Tag>
              }
            />
            <AppPropertyRow
              label={
                isRestricted
                  ? t('invites.details.summary.acceptance')
                  : t('invites.details.summary.usage')
              }
              value={
                isRestricted
                  ? t('invites.details.acceptedCount', {
                      values: {
                        accepted: formatNumber(
                          details.invite.restriction.acceptedCount,
                        ),
                        total: formatNumber(
                          details.invite.restriction.allowedCount,
                        ),
                      },
                    })
                  : t('invites.uses', {
                      values: {
                        used: formatNumber(details.invite.useCount),
                        max: formatNumber(details.invite.maxUses),
                      },
                    })
              }
            />
            <AppPropertyRow
              label={t('invites.details.summary.expiresAt')}
              value={formatDate(details.invite.expiresAt)}
            />
            <AppPropertyRow
              label={t('invites.details.summary.createdAt')}
              value={formatDate(details.invite.createdAt)}
            />
          </AppPropertyList>
        </AppSubsection>

        {status === 'active' ? (
          <InviteLinkSection
            isGenerating={isGeneratingLink}
            onGenerateLink={onGenerateLink}
          />
        ) : null}

        {isRestricted ? (
          <>
            <AppSubsection title={t('invites.details.accepted.heading')}>
              {acceptedAllowedEmails.length > 0 ? (
                <ul className="divide-y divide-rule">
                  {acceptedAllowedEmails.map((item) => (
                    <InviteAllowedEmailRow
                      key={item.id}
                      acceptedAt={item.acceptedAt}
                      emailDelivery={item.emailDelivery}
                      mask={item.mask}
                      user={item.acceptedBy}
                    />
                  ))}
                </ul>
              ) : (
                <p className="meta py-3 text-ink-3">
                  {t('invites.details.accepted.empty')}
                </p>
              )}
            </AppSubsection>

            <AppSubsection title={t('invites.details.pending.heading')}>
              {pendingAllowedEmails.length > 0 ? (
                <ul className="divide-y divide-rule">
                  {pendingAllowedEmails.map((item) => (
                    <InvitePendingEmailRow
                      key={item.id}
                      emailDelivery={item.emailDelivery}
                      mask={item.mask}
                    />
                  ))}
                </ul>
              ) : (
                <p className="meta py-3 text-ink-3">
                  {t('invites.details.pending.empty')}
                </p>
              )}
            </AppSubsection>
          </>
        ) : (
          <>
            <AppSubsection title={t('invites.details.open.acceptedHeading')}>
              {details.redemptions.length > 0 ? (
                <ul className="divide-y divide-rule">
                  {details.redemptions.map((redemption) => (
                    <InviteRedemptionRow
                      key={`${redemption.user.id}-${redemption.redeemedAt}`}
                      redeemedAt={redemption.redeemedAt}
                      user={redemption.user}
                    />
                  ))}
                </ul>
              ) : (
                <p className="meta py-3 text-ink-3">
                  {t('invites.details.open.acceptedEmpty')}
                </p>
              )}
            </AppSubsection>

            <AppSubsection title={t('invites.details.open.noPendingTitle')}>
              <p className="meta text-ink-3">
                {t('invites.details.open.noPendingBody')}
              </p>
            </AppSubsection>
          </>
        )}
        {status === 'active' ? (
          <div className="flex justify-end">
            <InlineConfirm
              confirmLabel={t('invites.action.revokeConfirm')}
              confirmVariant="danger"
              isLoading={isRevokingInvite}
              onConfirm={onRevokeInvite}
              trigger={
                <Button size="sm" variant="secondary">
                  {t('invites.action.revoke')}
                </Button>
              }
            />
          </div>
        ) : null}
      </div>
      {inviteUrl && onDismissCreatedAlert && onCopyInviteLink ? (
        <Dialog onClose={onDismissCreatedAlert} size="lg">
          <DialogBody disableDefaultSpacing>
            <RoomInviteLinkAlert
              copyStatus={copyStatus}
              emailDeliverySummary={null}
              inviteUrl={inviteUrl}
              onCopyInviteLink={onCopyInviteLink}
              onDismiss={onDismissCreatedAlert}
              restrictionType={
                createdInviteRestrictionType === 'allowed_emails'
                  ? 'allowed_emails'
                  : 'none'
              }
              t={t}
            />
          </DialogBody>
        </Dialog>
      ) : null}
    </>
  );
}

function InviteAllowedEmailRow({
  acceptedAt,
  emailDelivery,
  mask,
  user,
}: {
  acceptedAt: string | null;
  emailDelivery: RoomInviteDetailsResponse['allowedEmails'][number]['emailDelivery'];
  mask: string;
  user: RoomInviteDetailsResponse['allowedEmails'][number]['acceptedBy'];
}) {
  const { formatDate, t } = useI18n();
  const displayName =
    user?.displayName || user?.username || t('shell.userFallback');

  return (
    <li className="flex items-center gap-3 py-3">
      {user ? (
        <UserAvatar
          avatar={user.avatar}
          decorative
          displayName={displayName}
          size="md"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {user ? (
          <p className="truncate font-medium text-ink">
            {displayName}
            {user.username ? (
              <span className="font-normal text-ink-3">
                {' '}
                · @{user.username}
              </span>
            ) : null}
          </p>
        ) : null}
        <p className="meta text-ink-3">
          {mask}
          {acceptedAt
            ? ` · ${t('invites.details.acceptedAt', {
                values: { date: formatDate(acceptedAt) },
              })}`
            : ''}
        </p>
        {emailDelivery ? (
          <InviteEmailDeliveryStatusLine emailDelivery={emailDelivery} />
        ) : null}
      </div>
    </li>
  );
}

function InvitePendingEmailRow({
  emailDelivery,
  mask,
}: {
  emailDelivery: RoomInviteDetailsResponse['allowedEmails'][number]['emailDelivery'];
  mask: string;
}) {
  const { t } = useI18n();

  return (
    <li className="py-3">
      <p className="font-medium text-ink">{mask}</p>
      <p className="meta text-ink-3">{t('invites.details.pending.status')}</p>
      {emailDelivery ? (
        <InviteEmailDeliveryStatusLine emailDelivery={emailDelivery} />
      ) : null}
    </li>
  );
}

function InviteEmailDeliveryStatusLine({
  emailDelivery,
}: {
  emailDelivery: NonNullable<
    RoomInviteDetailsResponse['allowedEmails'][number]['emailDelivery']
  >;
}) {
  const { t } = useI18n();

  return (
    <p className="meta text-ink-3">
      {t('invites.details.emailDelivery.status', {
        values: {
          status: t(`invites.details.emailDelivery.${emailDelivery.status}`),
        },
      })}
    </p>
  );
}

function InviteRedemptionRow({
  redeemedAt,
  user,
}: {
  redeemedAt: string;
  user: RoomInviteDetailsResponse['redemptions'][number]['user'];
}) {
  const { formatDate, t } = useI18n();
  const displayName =
    user.displayName || user.username || t('shell.userFallback');

  return (
    <li className="flex items-center gap-3 py-3">
      <UserAvatar
        avatar={user.avatar}
        decorative
        displayName={displayName}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">
          {displayName}
          {user.username ? (
            <span className="font-normal text-ink-3"> · @{user.username}</span>
          ) : null}
        </p>
        <p className="meta text-ink-3">
          {t('invites.details.redeemedAt', {
            values: { date: formatDate(redeemedAt) },
          })}
        </p>
      </div>
    </li>
  );
}
