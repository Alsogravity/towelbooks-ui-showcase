import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../../components/feedback';
import { Button, Tag } from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';
import { sdk } from '../../../../lib/sdk';
import {
  buildCommunityPollsHref,
  type RegisterCommunityCreateHandler,
} from '../communityViewModel';

import { RoomPollDetailView } from './RoomPollDetailView';
import { CreatePollPanel } from './CreatePollPanel';
import { getPollKey, getPollListKey } from './pollQueryKeys';
import { getPollKindEmoji } from './pollPresentation';
import { getPollStatusMeta } from './pollStatus';

import type { CommunitySettings, PaginatedPollsResponse } from '../../types';
import type { CreatePollRequest } from '@towelbooks/schemas';

type RoomPollsViewProps = {
  roomId: string;
  communitySettings: CommunitySettings;
  hasBlockingPollsError: boolean;
  isLoadingPolls: boolean;
  registerCreateHandler?: RegisterCommunityCreateHandler;
  onRetryPolls: () => void;
  polls: PaginatedPollsResponse | undefined;
  selectedPollId: string | null;
};

export function RoomPollsView({
  roomId,
  communitySettings,
  hasBlockingPollsError,
  isLoadingPolls,
  registerCreateHandler,
  onRetryPolls,
  polls,
  selectedPollId,
}: RoomPollsViewProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const pollItems = useMemo(() => polls?.items ?? [], [polls?.items]);

  useEffect(() => {
    if (!registerCreateHandler) {
      return undefined;
    }

    registerCreateHandler(() => setIsCreateDialogOpen(true));

    return () => {
      registerCreateHandler(null);
    };
  }, [registerCreateHandler]);

  const createPollMutation = useMutation({
    mutationFn: (body: CreatePollRequest) => sdk.polls.createPoll(roomId, body),
    onSuccess: async (createdPoll) => {
      setIsCreateDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: getPollListKey(roomId) });
      await queryClient.prefetchQuery({
        queryKey: getPollKey(roomId, createdPoll.id),
        queryFn: () => sdk.polls.getPoll(roomId, createdPoll.id),
      });
    },
  });

  if (selectedPollId) {
    return <RoomPollDetailView roomId={roomId} pollId={selectedPollId} />;
  }

  if (isLoadingPolls) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.polls.loading',
            fallback: 'Loading polls...',
          }}
        />
      </div>
    );
  }

  if (hasBlockingPollsError) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <ErrorState
          title={{ key: 'rooms.detail.community.error.title' }}
          body={{ key: 'rooms.detail.community.error.body' }}
          action={
            <Button variant="secondary" onClick={() => void onRetryPolls()}>
              {t('errors.action.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {pollItems.length === 0 ? (
          <div className="rounded-2xl border border-rule/80 bg-paper p-8 shadow-sm">
            <EmptyState
              icon="poll-glyph"
              title={{ key: 'rooms.detail.polls.empty.title' }}
              body={{
                key: communitySettings.viewerCanCreatePolls
                  ? 'rooms.detail.polls.empty.body.canCreate'
                  : 'rooms.detail.polls.empty.body.readOnly',
              }}
              action={
                communitySettings.viewerCanCreatePolls ? (
                  <Button
                    prependIcon="plus"
                    size="md"
                    variant="secondary"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    {t('rooms.detail.polls.create')}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-rule/80 bg-paper shadow-sm">
            <ul className="divide-y divide-rule">
              {pollItems.map((poll) => (
                <li key={poll.id}>
                  <Link
                    className="flex w-full flex-col gap-2 px-5 py-5 text-left transition-colors hover:bg-rule/10"
                    to={buildCommunityPollsHref(roomId, poll.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span aria-hidden className="app-text-body mt-0.5">
                          {getPollKindEmoji(poll.kind)}
                        </span>
                        <div className="min-w-0">
                          <div className="app-text-row-title text-ink">
                            {poll.title}
                          </div>
                          {poll.description ? (
                            <p className="mt-1 line-clamp-2 text-sm text-ink-3">
                              {poll.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Tag
                          variant={
                            getPollStatusMeta(poll.derivedStatus).variant
                          }
                        >
                          {t(getPollStatusMeta(poll.derivedStatus).labelKey)}
                        </Tag>
                        <span className="text-xs text-ink-4">
                          {t('rooms.detail.polls.responseCount', {
                            values: { count: poll.responseCount },
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isCreateDialogOpen ? (
        <CreatePollPanel
          isPending={createPollMutation.isPending}
          mutationError={createPollMutation.error}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={(body) => createPollMutation.mutate(body)}
        />
      ) : null}
    </>
  );
}
