import { useMemo } from 'react';

import { AppSubsection } from '../../../components/application';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import { Button, Icon } from '../../../components/primitives';
import { getInviteStatus, type InviteStatus } from '../roomCopy';

import type { useI18n } from '../../../i18n';
import type { RoomInvite } from '../types';

const STATUS_PRIORITY: Record<InviteStatus, number> = {
  active: 0,
  expired: 1,
  used: 2,
  revoked: 3,
};

type RoomInvitesListViewProps = {
  allInvites: RoomInvite[];
  displayMode?: 'all' | 'active' | 'inactive';
  formatDate: ReturnType<typeof useI18n>['formatDate'];
  formatNumber: ReturnType<typeof useI18n>['formatNumber'];
  hasMore: boolean;
  invitesError: unknown;
  isLoadingInvites: boolean;
  isLoadingMore: boolean;
  onCreateInvite: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
  onViewDetails: (inviteId: string) => void;
  t: ReturnType<typeof useI18n>['t'];
};

type InviteSectionProps = {
  emptyMessage: string;
  formatDate: ReturnType<typeof useI18n>['formatDate'];
  formatNumber: ReturnType<typeof useI18n>['formatNumber'];
  invites: RoomInvite[];
  onViewDetails: (inviteId: string) => void;
  t: ReturnType<typeof useI18n>['t'];
};

export function RoomInvitesListView({
  allInvites,
  displayMode = 'all',
  formatDate,
  formatNumber,
  hasMore,
  invitesError,
  isLoadingInvites,
  isLoadingMore,
  onCreateInvite,
  onLoadMore,
  onRetry,
  onViewDetails,
  t,
}: RoomInvitesListViewProps) {
  const { activeInvites, previousInvites } = useMemo(
    () =>
      allInvites.length > 0
        ? [...allInvites]
            .sort((a, b) => {
              const statusDiff =
                STATUS_PRIORITY[getInviteStatus(a)] -
                STATUS_PRIORITY[getInviteStatus(b)];

              if (statusDiff !== 0) return statusDiff;

              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            })
            .reduce(
              (sections, invite) => {
                if (getInviteStatus(invite) === 'active') {
                  sections.activeInvites.push(invite);
                } else {
                  sections.previousInvites.push(invite);
                }

                return sections;
              },
              {
                activeInvites: [] as RoomInvite[],
                previousInvites: [] as RoomInvite[],
              },
            )
        : { activeInvites: [], previousInvites: [] },
    [allInvites],
  );

  const showActive = displayMode === 'all' || displayMode === 'active';
  const showInactive = displayMode === 'all' || displayMode === 'inactive';
  const filteredActive = showActive ? activeInvites : [];
  const filteredPrevious = showInactive ? previousInvites : [];
  const totalInvites = filteredActive.length + filteredPrevious.length;

  if (!isLoadingInvites && !invitesError && totalInvites === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <EmptyState
          className="mb-0"
          icon="mail"
          title={{
            key: 'invites.list.empty.title',
            fallback: 'No invites created yet',
          }}
          body={{
            key: 'invites.list.empty.body',
            fallback:
              'Generate the first invite when the next reader is ready to join.',
          }}
          action={
            displayMode !== 'inactive' ? (
              <Button type="button" onClick={onCreateInvite}>
                {t('invites.action.create')}
              </Button>
            ) : undefined
          }
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        {isLoadingInvites ? (
          <div className="py-6">
            <LoadingState
              label={{
                key: 'invites.list.loading',
                fallback: 'Loading invites...',
              }}
            />
          </div>
        ) : invitesError ? (
          <div className="py-6">
            <ErrorState
              title={{
                key: 'invites.list.error.title',
                fallback: 'Unable to load invites',
              }}
              body={{
                key: 'invites.list.error.body',
                fallback: 'Unable to load invites right now.',
              }}
              action={
                <Button variant="secondary" onClick={() => void onRetry()}>
                  {t('errors.action.retry')}
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {showActive ? (
              <InviteListSection
                emptyMessage={t('invites.list.activeEmpty')}
                formatDate={formatDate}
                formatNumber={formatNumber}
                invites={filteredActive}
                onViewDetails={onViewDetails}
                t={t}
              />
            ) : null}

            {showInactive ? (
              <InviteListSection
                emptyMessage={t('invites.list.previousEmpty')}
                formatDate={formatDate}
                formatNumber={formatNumber}
                invites={filteredPrevious}
                onViewDetails={onViewDetails}
                t={t}
              />
            ) : null}
          </div>
        )}

        {hasMore && !isLoadingInvites && !invitesError ? (
          <div className="flex justify-center pt-2">
            <Button
              variant="tertiary"
              size="sm"
              isLoading={isLoadingMore}
              loadingLabel={t('invites.list.loading')}
              onClick={onLoadMore}
            >
              {t('invites.list.loadMore')}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InviteListSection({
  emptyMessage,
  formatDate,
  formatNumber,
  invites,
  onViewDetails,
  t,
}: InviteSectionProps) {
  return (
    <AppSubsection>
      {invites.length === 0 ? (
        <p className="meta py-3 text-ink-3">{emptyMessage}</p>
      ) : (
        <ul>
          {invites.map((invite) => (
            <InviteListRow
              key={invite.id}
              formatDate={formatDate}
              formatNumber={formatNumber}
              invite={invite}
              onViewDetails={onViewDetails}
              t={t}
            />
          ))}
        </ul>
      )}
    </AppSubsection>
  );
}

function InviteListRow({
  formatDate,
  formatNumber,
  invite,
  onViewDetails,
  t,
}: {
  formatDate: ReturnType<typeof useI18n>['formatDate'];
  formatNumber: ReturnType<typeof useI18n>['formatNumber'];
  invite: RoomInvite;
  onViewDetails: (inviteId: string) => void;
  t: ReturnType<typeof useI18n>['t'];
}) {
  const status = getInviteStatus(invite);

  return (
    <li>
      <div className="flex items-center gap-3 rounded-[var(--radius-paper-4)] px-3 py-3 transition-colors hover:bg-paper-2 focus-within:ring-2 focus-within:ring-brick/40">
        <button
          type="button"
          className="min-w-0 flex-1 text-left focus-visible:outline-none"
          onClick={() => onViewDetails(invite.id)}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div
                className="text-ink"
                style={{ fontSize: 'var(--fs-body-lg)' }}
              >
                {invite.restriction.type === 'allowed_emails'
                  ? t('invites.target.restricted', {
                      values: {
                        accepted: formatNumber(
                          invite.restriction.acceptedCount,
                        ),
                        allowed: formatNumber(invite.restriction.allowedCount),
                      },
                    })
                  : t('invites.target.open')}
              </div>
              <span
                className="text-ink-3"
                style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 400 }}
              >
                {formatNumber(invite.useCount)} / {formatNumber(invite.maxUses)}
              </span>
            </div>
            <div className="meta flex flex-wrap gap-x-2 gap-y-1 text-ink-3">
              <span>
                {t('invites.created', {
                  values: { date: formatDate(invite.createdAt) },
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  status === 'expired' || status === 'revoked'
                    ? 'text-brick'
                    : ''
                }
              >
                {status === 'revoked'
                  ? t('invites.status.revoked')
                  : status === 'expired'
                    ? t('invites.expired', {
                        values: { date: formatDate(invite.expiresAt) },
                      })
                    : t('invites.expires', {
                        values: { date: formatDate(invite.expiresAt) },
                      })}
              </span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <Icon
            name="chevron-right"
            size={20}
            className="shrink-0 text-ink-2"
          />
        </div>
      </div>
    </li>
  );
}
