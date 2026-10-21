import { type IncomingFollowRequestsSummaryResponse } from '@towelbooks/schemas';

import { Avatar, Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';

type FollowRequestsSummaryRowProps = {
  onOpen: () => void;
  summary: IncomingFollowRequestsSummaryResponse;
};

export function FollowRequestsSummaryRow({
  onOpen,
  summary,
}: FollowRequestsSummaryRowProps) {
  const { t } = useI18n();
  const newestRequester = summary.preview[0];
  const newestUsername = newestRequester?.username ?? '';
  const remainingCount = Math.max(summary.pendingCount - 1, 0);
  const subtitle =
    summary.pendingCount === 1
      ? t('notifications.followRequests.summary.subtitle.one', {
          values: { username: newestUsername },
        })
      : t('notifications.followRequests.summary.subtitle.many', {
          values: { count: remainingCount, username: newestUsername },
        });

  return (
    <button
      aria-label={t('notifications.followRequests.summary.openLabel')}
      className="flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-paper-4)] border border-rule bg-paper px-4 py-3 text-left transition-colors hover:border-brick/30 hover:bg-vellum/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
      onClick={onOpen}
      type="button"
    >
      <span className="flex w-14 shrink-0 items-center" aria-hidden="true">
        {summary.preview.length > 0 ? (
          summary.preview.map((requester, index) => {
            const displayName =
              requester.displayName?.trim() || requester.username;

            return (
              <Avatar
                background={requester.avatar.background}
                className={index === 0 ? 'relative z-10' : '-ml-3'}
                foreground={requester.avatar.foreground}
                imageAlt={displayName}
                imageUrl={requester.avatar.imageUrl}
                initial={requester.avatar.initial}
                key={requester.id}
                size="md"
              />
            );
          })
        ) : (
          <span className="flex size-9 items-center justify-center rounded-full bg-paper-2 text-ink-3">
            <Icon name="user-plus" size={18} />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="app-text-row-title block text-ink">
          {t('notifications.followRequests.summary.title')}
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink-3">
          {subtitle}
        </span>
      </span>
      <Icon name="chevron-right" size={20} className="shrink-0 text-ink-3" />
    </button>
  );
}
