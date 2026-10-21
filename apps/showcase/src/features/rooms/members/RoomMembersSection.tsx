import { CircleSpinner, LoadingState } from '../../../components/feedback';
import { Alert, Button, Input } from '../../../components/primitives';
import { handleApiProblem } from '../../errors';
import { useI18n } from '../../../i18n';
import { RoomMembersList } from '../detail/ui/RoomMembersList';
import { useDebouncedMemberSearch, useRoomMembers } from './useRoomMembers';

import type { RefObject } from 'react';
import type { RoomMember } from '../types';

type RoomMembersSectionProps = {
  canManage: boolean;
  onManageMember: (member: RoomMember) => void;
  roomId: string;
  scrollRootRef?: RefObject<HTMLElement | null>;
};

export function RoomMembersSection({
  canManage,
  onManageMember,
  roomId,
  scrollRootRef,
}: RoomMembersSectionProps) {
  const { t } = useI18n();
  const { debouncedSearch, searchInput, setSearchInput } =
    useDebouncedMemberSearch();
  const {
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    items,
    loadMoreRef,
    refetch,
    error,
  } = useRoomMembers(roomId, {
    q: debouncedSearch,
    scrollRootRef,
  });

  const showEmpty = !isLoading && !isError && items.length === 0;
  const emptyMessage = debouncedSearch
    ? t('rooms.members.search.empty')
    : t('rooms.members.empty');

  return (
    <section
      aria-label={t('rooms.detail.hero.stats.members')}
      className="space-y-3"
    >
      <Input
        aria-label={t('rooms.members.search.label')}
        className="h-10 w-full border-rule/60 bg-vellum/50 text-sm focus:bg-vellum"
        clearable
        clearButtonLabel={t('rooms.list.search.clearLabel')}
        enterKeyHint="search"
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder={t('rooms.members.search.placeholder')}
        prependIcon="search"
        type="search"
        value={searchInput}
      />
      {isLoading ? (
        <LoadingState
          label={{
            key: 'rooms.members.loading',
            fallback: 'Loading members...',
          }}
        />
      ) : isError ? (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {
                handleApiProblem(error, {
                  fallbackKey: 'rooms.detail.members.error.title',
                  t,
                }).message
              }
            </span>
            <Button
              onClick={() => void refetch()}
              size="sm"
              variant="secondary"
            >
              {t('errors.action.retry')}
            </Button>
          </div>
        </Alert>
      ) : showEmpty ? (
        <p className="text-sm text-ink-3">{emptyMessage}</p>
      ) : (
        <>
          <RoomMembersList
            canManage={canManage}
            members={items}
            onManageMember={onManageMember}
          />
          {hasNextPage ? (
            <div ref={loadMoreRef} className="flex justify-center py-2">
              {isFetchingNextPage ? (
                <div className="flex justify-center text-ink-3">
                  <CircleSpinner label={t('rooms.members.loadingMore')} />
                </div>
              ) : (
                <Button
                  onClick={() => void fetchNextPage()}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {t('rooms.members.loadMore')}
                </Button>
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
