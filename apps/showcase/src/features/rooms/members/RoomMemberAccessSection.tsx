import {
  AppActionGroup,
  AppPropertyClickableValue,
  AppPropertyList,
  AppPropertyRow,
  AppSubsection,
} from '../../../components/application';
import { Button, Tag } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import {
  getRoomMemberAccessSourceLabelKey,
  getRoomMemberEffectiveAccessDisplayLabelKey,
  resolveRoomMemberEffectiveAccessDisplayState,
  roomMemberAccessStatusVariant,
  roomMemberEffectiveAccessStatusVariant,
} from './roomMembersDisplay';

import type { RoomMemberManagementDetail } from '../types';

type RoomMemberAccessSectionProps = {
  detail: RoomMemberManagementDetail;
  isSubmittingRevoke: boolean;
  isSubmittingRevokeInvite: boolean;
  isSubmittingRestoreInvite: boolean;
  onRevoke: () => void;
  onRevokeInvite: () => void;
  onRestoreInvite: () => void;
  onSetAccess: () => void;
  onRestoreAccess: () => void;
  onUpdateExpiration: () => void;
};

export function RoomMemberAccessSection({
  detail,
  isSubmittingRevoke,
  isSubmittingRevokeInvite,
  isSubmittingRestoreInvite,
  onRevoke,
  onRevokeInvite,
  onRestoreInvite,
  onSetAccess,
  onRestoreAccess,
  onUpdateExpiration,
}: RoomMemberAccessSectionProps) {
  const { formatDate, t } = useI18n();
  const fallbackText = t('rooms.members.management.value.notSet');
  const isSuspended = detail.member.status === 'suspended';
  const manual = detail.manualAccess;
  const canRevoke = detail.availableActions.canRevokeManualAccess;

  const sortedGrants = [...detail.access.grants].sort((left, right) => {
    const order = { manual: 0, invite: 1, payment: 2, system: 3 } as const;
    return order[left.source] - order[right.source];
  });

  function renderManualActions() {
    if (isSuspended) {
      return (
        <>
          <p className="meta text-ink-3">
            {t('rooms.members.management.access.manual.suspendedNote')}
          </p>
          {canRevoke ? (
            <AppActionGroup className="justify-end">
              <Button
                className="w-full sm:w-max"
                type="button"
                variant="danger"
                isLoading={isSubmittingRevoke}
                onClick={onRevoke}
              >
                {t('rooms.members.management.access.revoke')}
              </Button>
            </AppActionGroup>
          ) : null}
        </>
      );
    }

    if (manual.state === 'none') {
      return (
        <AppActionGroup>
          <Button type="button" variant="secondary" onClick={onSetAccess}>
            {t('rooms.members.management.access.manual.set')}
          </Button>
        </AppActionGroup>
      );
    }

    if (manual.state === 'revoked') {
      return (
        <AppActionGroup>
          <Button type="button" variant="secondary" onClick={onRestoreAccess}>
            {t('rooms.members.management.access.manual.restore')}
          </Button>
        </AppActionGroup>
      );
    }

    if (manual.state === 'expired') {
      return (
        <AppActionGroup>
          <Button type="button" variant="secondary" onClick={onRestoreAccess}>
            {t('rooms.members.management.access.manual.restore')}
          </Button>
        </AppActionGroup>
      );
    }

    return (
      <AppActionGroup className="justify-end">
        <Button
          className="w-full sm:w-max"
          type="button"
          variant="danger"
          isLoading={isSubmittingRevoke}
          onClick={onRevoke}
        >
          {t('rooms.members.management.access.revoke')}
        </Button>
      </AppActionGroup>
    );
  }

  function renderManualRows() {
    const rows: React.ReactNode[] = [];

    if (manual.startsAt && manual.state !== 'revoked') {
      rows.push(
        <AppPropertyRow
          key="startsAt"
          mobileLayout="inline"
          label={t('rooms.members.management.access.manual.startsAt')}
          value={formatDate(manual.startsAt)}
        />,
      );
    }

    if (manual.revokedAt) {
      rows.push(
        <AppPropertyRow
          key="revokedAt"
          mobileLayout="inline"
          label={t('rooms.members.management.access.manual.revokedAt')}
          value={formatDate(manual.revokedAt)}
        />,
      );
    }

    if (manual.state === 'expired' && manual.expiresAt) {
      rows.push(
        <AppPropertyRow
          key="expiredAt"
          mobileLayout="inline"
          label={t('rooms.members.management.access.manual.expiredAt')}
          value={formatDate(manual.expiresAt)}
        />,
      );
    }

    if (manual.state === 'active' && !isSuspended) {
      const expiresAtValue = manual.expiresAt
        ? formatDate(manual.expiresAt)
        : t('rooms.members.access.noExpiration');

      rows.push(
        <AppPropertyRow
          key="expiresAt"
          mobileLayout="inline"
          label={t('rooms.members.management.access.manual.expiresAt')}
          value={
            <AppPropertyClickableValue
              ariaLabel={t(
                'rooms.members.management.access.manual.changeExpirationLabel',
              )}
              onClick={onUpdateExpiration}
            >
              {expiresAtValue}
            </AppPropertyClickableValue>
          }
        />,
      );
    }

    if (isSuspended && manual.expiresAt && manual.state === 'active') {
      rows.push(
        <AppPropertyRow
          key="expiresAt"
          mobileLayout="inline"
          label={t('rooms.members.management.access.manual.expiresAt')}
          value={formatDate(manual.expiresAt)}
        />,
      );
    }

    return rows;
  }

  const manualNote =
    !isSuspended && manual.state === 'none'
      ? null
      : detail.member.role === 'owner' && manual.state === 'none'
        ? t('rooms.members.management.access.manual.ownerNote')
        : null;

  return (
    <>
      <AppSubsection
        titleAs="h4"
        title={t('rooms.members.management.access.effectiveTitle')}
        description={t('rooms.members.management.access.effectiveDescription')}
      >
        <AppPropertyList>
          <AppPropertyRow
            mobileLayout="inline"
            label={t('rooms.members.management.access.state')}
            value={
              <Tag
                variant={
                  roomMemberEffectiveAccessStatusVariant[
                    resolveRoomMemberEffectiveAccessDisplayState(detail)
                  ]
                }
                className="app-text-caption px-2 py-0.5"
              >
                {t(
                  getRoomMemberEffectiveAccessDisplayLabelKey(
                    resolveRoomMemberEffectiveAccessDisplayState(detail),
                  ),
                )}
              </Tag>
            }
          />
          <AppPropertyRow
            mobileLayout="inline"
            label={t('rooms.members.management.access.expiresAt')}
            value={
              detail.access.effectiveExpiresAt
                ? formatDate(detail.access.effectiveExpiresAt)
                : t('rooms.members.access.noExpiration')
            }
          />
          <AppPropertyRow
            mobileLayout="inline"
            label={t('rooms.members.management.access.sources')}
            value={
              detail.access.activeSources.length > 0 ? (
                <span className="flex flex-wrap justify-start gap-2 sm:justify-end">
                  {detail.access.activeSources.map((source) => (
                    <Tag
                      key={source}
                      variant="role"
                      className="app-text-caption px-2 py-0.5"
                    >
                      {t(getRoomMemberAccessSourceLabelKey(source))}
                    </Tag>
                  ))}
                </span>
              ) : (
                fallbackText
              )
            }
          />
        </AppPropertyList>
      </AppSubsection>

      {sortedGrants.filter((g) => g.source === 'invite').length > 0 ? (
        <AppSubsection
          titleAs="h4"
          title={t('rooms.members.management.access.inviteTitle')}
          description={t('rooms.members.management.access.inviteDescription')}
        >
          <ul className="divide-y divide-rule">
            {sortedGrants
              .filter((g) => g.source === 'invite')
              .map((grant) => (
                <li
                  key={`${grant.source}-${grant.startsAt}-${grant.expiresAt ?? 'none'}`}
                  className="py-3"
                >
                  <AppPropertyList>
                    <AppPropertyRow
                      mobileLayout="inline"
                      label={t('rooms.members.management.access.state')}
                      value={
                        <Tag
                          variant={roomMemberAccessStatusVariant[grant.state]}
                          className="app-text-caption px-2 py-0.5"
                        >
                          {t(`rooms.members.access.status.${grant.state}`)}
                        </Tag>
                      }
                    />
                    <AppPropertyRow
                      mobileLayout="inline"
                      label={t('rooms.members.management.access.startedAt')}
                      value={formatDate(grant.startsAt)}
                    />
                    <AppPropertyRow
                      mobileLayout="inline"
                      label={t(
                        grant.state === 'expired'
                          ? 'rooms.members.management.access.expiredAt'
                          : 'rooms.members.management.access.expiresAt',
                      )}
                      value={
                        grant.expiresAt
                          ? formatDate(grant.expiresAt)
                          : detail.access.state === 'active'
                            ? t('rooms.members.access.noExpiration')
                            : fallbackText
                      }
                    />
                    <AppPropertyRow
                      mobileLayout="inline"
                      label={t('rooms.members.management.access.revokedAt')}
                      value={
                        grant.revokedAt
                          ? formatDate(grant.revokedAt)
                          : fallbackText
                      }
                    />
                  </AppPropertyList>
                </li>
              ))}
          </ul>
          {detail.availableActions.canRevokeInviteAccess ? (
            <AppActionGroup className="justify-end">
              <Button
                className="w-full sm:w-max"
                type="button"
                variant="danger"
                isLoading={isSubmittingRevokeInvite}
                onClick={onRevokeInvite}
              >
                {t('rooms.members.access.invite.revoke')}
              </Button>
            </AppActionGroup>
          ) : null}
          {detail.availableActions.canRestoreInviteAccess ? (
            <AppActionGroup>
              <Button
                type="button"
                variant="secondary"
                isLoading={isSubmittingRestoreInvite}
                onClick={onRestoreInvite}
              >
                {t('rooms.members.access.invite.restore')}
              </Button>
            </AppActionGroup>
          ) : null}
        </AppSubsection>
      ) : null}

      <AppSubsection
        titleAs="h4"
        title={t('rooms.members.management.access.manualTitle')}
        description={t('rooms.members.management.access.manualDescription')}
      >
        <AppPropertyList>
          <AppPropertyRow
            mobileLayout="inline"
            label={t('rooms.members.management.access.manual.state')}
            value={
              <Tag
                variant={roomMemberAccessStatusVariant[manual.state]}
                className="app-text-caption px-2 py-0.5"
              >
                {t(`rooms.members.access.status.${manual.state}`)}
              </Tag>
            }
          />
          {renderManualRows()}
        </AppPropertyList>

        {manualNote ? <p className="meta text-ink-3">{manualNote}</p> : null}

        {renderManualActions()}
      </AppSubsection>
    </>
  );
}
