import { useEffect } from 'react';

import { ErrorState, LoadingState } from '../../../../components/feedback';
import { Button } from '../../../../components/primitives';
import { useRoomDiscussionsTab } from './useRoomDiscussionsTab';
import { RoomDiscussionDetailView } from './ui/RoomDiscussionDetailView';
import { RoomDiscussionListView } from './ui/RoomDiscussionListView';
import { CreateDiscussionDialog } from './ui/CreateDiscussionDialog';
import { DeleteDiscussionTargetDialog } from './ui/DeleteDiscussionTargetDialog';
import { EditDiscussionDialog } from './ui/EditDiscussionDialog';
import { useI18n } from '../../../../i18n';

import type { RoomDiscussionsViewProps } from './discussionTypes';

export function RoomDiscussionsView(props: RoomDiscussionsViewProps) {
  const { t } = useI18n();
  const tab = useRoomDiscussionsTab(props);
  const { setIsCreateDialogOpen } = tab;
  const {
    onRetryDiscussions,
    registerCreateHandler,
    roomId,
    selectedDiscussionId,
  } = props;

  useEffect(() => {
    if (!registerCreateHandler) {
      return undefined;
    }

    registerCreateHandler(() => {
      setIsCreateDialogOpen(true);
    });

    return () => {
      registerCreateHandler(null);
    };
  }, [registerCreateHandler, setIsCreateDialogOpen]);

  if (selectedDiscussionId) {
    return (
      <>
        <RoomDiscussionDetailView
          onBackToList={() => props.onSelectDiscussion(null)}
          roomId={roomId}
          discussionQuery={tab.discussionQuery}
          onDeleteDiscussion={() => {
            if (!tab.selectedDiscussion) {
              return;
            }

            tab.setDeleteTarget(tab.selectedDiscussion);
          }}
          onEditDiscussion={tab.openEditDiscussionDialog}
          onModerate={(action) => tab.moderateDiscussionMutation.mutate(action)}
          onInteractionChange={tab.onInteractionChange}
          selectedDiscussion={tab.selectedDiscussion}
        />

        {tab.isCreateDialogOpen ? (
          <CreateDiscussionDialog
            body={tab.createBody}
            isPending={tab.createDiscussionMutation.isPending}
            onBodyChange={tab.setCreateBody}
            onClose={() => tab.setIsCreateDialogOpen(false)}
            onSubmit={() => tab.createDiscussionMutation.mutate()}
            onTitleChange={tab.setCreateTitle}
            title={tab.createTitle}
          />
        ) : null}

        {tab.isEditDiscussionDialogOpen ? (
          <EditDiscussionDialog
            bodyDraft={tab.discussionBodyDraft}
            isPending={tab.updateDiscussionMutation.isPending}
            onBodyChange={tab.setDiscussionBodyDraft}
            onClose={() => tab.setIsEditDiscussionDialogOpen(false)}
            onSubmit={() => tab.updateDiscussionMutation.mutate()}
            onTitleChange={tab.setDiscussionTitleDraft}
            titleDraft={tab.discussionTitleDraft}
          />
        ) : null}

        {tab.deleteTarget ? (
          <DeleteDiscussionTargetDialog
            isPending={tab.deleteMutation.isPending}
            onClose={() => tab.setDeleteTarget(null)}
            onConfirm={() => tab.deleteMutation.mutate()}
          />
        ) : null}
      </>
    );
  }

  if (tab.isLoadingDiscussions) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-12 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.discussions.loading',
            fallback: 'Loading discussions...',
          }}
        />
      </div>
    );
  }

  if (props.hasBlockingDiscussionsError || !tab.communitySettings) {
    return (
      <ErrorState
        title={{ key: 'rooms.detail.discussions.error.title' }}
        body={{ key: 'rooms.detail.discussions.error.body' }}
        action={
          <Button variant="secondary" onClick={() => void onRetryDiscussions()}>
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <RoomDiscussionListView
        roomId={roomId}
        combinedMutationError={tab.combinedMutationError}
        communitySettings={tab.communitySettings}
        discussions={tab.discussions}
        onOpenCreateDialog={() => tab.setIsCreateDialogOpen(true)}
      />

      {tab.isCreateDialogOpen ? (
        <CreateDiscussionDialog
          body={tab.createBody}
          isPending={tab.createDiscussionMutation.isPending}
          onBodyChange={tab.setCreateBody}
          onClose={() => tab.setIsCreateDialogOpen(false)}
          onSubmit={() => tab.createDiscussionMutation.mutate()}
          onTitleChange={tab.setCreateTitle}
          title={tab.createTitle}
        />
      ) : null}

      {tab.isEditDiscussionDialogOpen ? (
        <EditDiscussionDialog
          bodyDraft={tab.discussionBodyDraft}
          isPending={tab.updateDiscussionMutation.isPending}
          onBodyChange={tab.setDiscussionBodyDraft}
          onClose={() => tab.setIsEditDiscussionDialogOpen(false)}
          onSubmit={() => tab.updateDiscussionMutation.mutate()}
          onTitleChange={tab.setDiscussionTitleDraft}
          titleDraft={tab.discussionTitleDraft}
        />
      ) : null}

      {tab.deleteTarget ? (
        <DeleteDiscussionTargetDialog
          isPending={tab.deleteMutation.isPending}
          onClose={() => tab.setDeleteTarget(null)}
          onConfirm={() => tab.deleteMutation.mutate()}
        />
      ) : null}
    </>
  );
}
