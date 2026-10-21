import type { RoomAnnouncement } from '@towelbooks/schemas';
import { useSearchParams } from 'react-router';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../../components/feedback';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  Icon,
} from '../../../../components/primitives';
import { handleApiProblem } from '../../../../features/errors';
import { useI18n } from '../../../../i18n';
import { useIsBelowSmViewport } from '../../../../layouts/app/shellViewport';
import { getDiscussionAuthorName } from '../../community/discussions/getDiscussionAuthorName';
import { roomTabSectionIcons } from '../roomTabSectionIcons';
import { RoomAnnouncementDialogFields } from './RoomAnnouncementDialogFields';
import { RoomAnnouncementsList } from './RoomAnnouncementsList';
import { RoomTabSectionHeader } from './RoomTabSectionHeader';
import { useRoomAnnouncementsTabState } from './useRoomAnnouncementsTabState';

type RoomAnnouncementsTabProps = {
  roomId: string;
  canManage: boolean;
};

export function RoomAnnouncementsTab({
  canManage,
  roomId,
}: RoomAnnouncementsTabProps) {
  const { formatDate, t } = useI18n();
  const isBelowSm = useIsBelowSmViewport();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    announcements,
    announcementsQuery,
    archiveMutation,
    archiveTarget,
    bodyDraft,
    createMutation,
    editingAnnouncement,
    isBodyEmpty,
    isCreateOpen,
    mutationError,
    openCreate,
    openEdit,
    setArchiveTarget,
    setBodyDraft,
    setEditingAnnouncement,
    setIsCreateOpen,
    setTitleDraft,
    titleDraft,
    updateMutation,
  } = useRoomAnnouncementsTabState(roomId);

  const announcementId = searchParams.get('announcement');
  const viewingAnnouncement: RoomAnnouncement | null = announcementId
    ? (announcements.find((a) => a.id === announcementId) ?? null)
    : null;

  const handleViewingAnnouncementClose = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('announcement');
    setSearchParams(next, { replace: true });
  };

  if (announcementsQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-rule/80 bg-paper p-6 shadow-sm">
        <LoadingState
          label={{
            key: 'rooms.detail.announcements.loading',
            fallback: 'Loading announcements...',
          }}
        />
      </div>
    );
  }

  if (announcementsQuery.error) {
    return (
      <ErrorState
        title={{ key: 'rooms.detail.announcements.error.title' }}
        body={{ key: 'rooms.detail.announcements.error.body' }}
        action={
          <Button
            variant="secondary"
            onClick={() => void announcementsQuery.refetch()}
          >
            {t('errors.action.retry')}
          </Button>
        }
      />
    );
  }
  return (
    <section
      aria-label={t('rooms.detail.announcements.title')}
      className="py-4"
    >
      <div className="space-y-8">
        <RoomTabSectionHeader
          icon={roomTabSectionIcons.announcements}
          title={t('rooms.detail.announcements.title')}
          actions={
            canManage ? (
              isBelowSm ? (
                <Button
                  icon="plus"
                  variant="icon"
                  size="sm"
                  className="shrink-0"
                  aria-label={t('rooms.detail.announcements.create')}
                  onClick={openCreate}
                />
              ) : (
                <Button
                  prependIcon="plus"
                  variant="secondary"
                  size="md"
                  onClick={openCreate}
                >
                  {t('rooms.detail.announcements.create')}
                </Button>
              )
            ) : undefined
          }
        />

        {mutationError ? (
          <Alert variant="error">
            {
              handleApiProblem(mutationError, {
                fallbackKey: 'rooms.detail.announcements.error.submit',
                t,
              }).message
            }
          </Alert>
        ) : null}

        {announcements.length === 0 ? (
          <EmptyState
            className="mt-16"
            icon="bell"
            title={{ key: 'rooms.detail.announcements.empty.title' }}
            body={{
              key: canManage
                ? 'rooms.detail.announcements.empty.body.canManage'
                : 'rooms.detail.announcements.empty.body.readOnly',
            }}
          />
        ) : (
          <RoomAnnouncementsList
            announcements={announcements}
            onSelect={(announcement) => {
              const next = new URLSearchParams(searchParams);
              next.set('announcement', announcement.id);
              setSearchParams(next, { replace: true });
            }}
          />
        )}
      </div>

      {viewingAnnouncement ? (
        <Dialog
          title={
            viewingAnnouncement.title ??
            t('rooms.detail.announcements.untitled')
          }
          onClose={handleViewingAnnouncementClose}
          size="lg"
          showCloseButton
          closeButtonLabel={t('common.close')}
          headerLeading={
            <Icon
              name="megaphone-glyph"
              size={20}
              strokeWidth={1.7}
              className="shrink-0 text-ink-4"
              aria-hidden
            />
          }
          leadingAction={
            canManage
              ? {
                  ariaLabel: t('rooms.detail.announcements.actions.archive'),
                  iconName: 'archive',
                  onClick: () => {
                    handleViewingAnnouncementClose();
                    setArchiveTarget(viewingAnnouncement);
                  },
                }
              : undefined
          }
          primaryAction={
            canManage
              ? {
                  ariaLabel: t('rooms.detail.announcements.actions.edit'),
                  iconName: 'pen',
                  onClick: () => {
                    handleViewingAnnouncementClose();
                    openEdit(viewingAnnouncement);
                  },
                }
              : undefined
          }
        >
          {() => (
            <>
              <DialogBody>
                <div className="flex flex-col gap-4">
                  <p className="app-text-body whitespace-pre-wrap text-ink">
                    {viewingAnnouncement.body}
                  </p>
                  <div className="app-text-metadata flex flex-wrap items-center justify-end gap-3 text-ink-4">
                    <span>
                      {t('rooms.detail.announcements.byline', {
                        values: {
                          authorName: getDiscussionAuthorName(
                            viewingAnnouncement.author,
                          ),
                        },
                      })}
                    </span>
                    <span>{formatDate(viewingAnnouncement.createdAt)}</span>
                  </div>
                </div>
              </DialogBody>
            </>
          )}
        </Dialog>
      ) : null}

      {isCreateOpen ? (
        <Dialog
          title={t('rooms.detail.announcements.createDialog.title')}
          onClose={() => setIsCreateOpen(false)}
          size="md"
        >
          {({ close }) => (
            <>
              <RoomAnnouncementDialogFields
                bodyDraft={bodyDraft}
                onBodyChange={setBodyDraft}
                onTitleChange={setTitleDraft}
                titleDraft={titleDraft}
              />
              <DialogActions>
                <Button variant="ghost" onClick={() => close()}>
                  {t('common.cancel')}
                </Button>
                <Button
                  disabled={isBodyEmpty}
                  isLoading={createMutation.isPending}
                  loadingLabel={t('rooms.detail.announcements.creating')}
                  onClick={() => createMutation.mutate()}
                >
                  {t('rooms.detail.announcements.createDialog.confirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}

      {editingAnnouncement ? (
        <Dialog
          title={t('rooms.detail.announcements.editDialog.title')}
          onClose={() => setEditingAnnouncement(null)}
          size="md"
        >
          {({ close }) => (
            <>
              <RoomAnnouncementDialogFields
                bodyDraft={bodyDraft}
                onBodyChange={setBodyDraft}
                onTitleChange={setTitleDraft}
                titleDraft={titleDraft}
              />
              <DialogActions>
                <Button variant="ghost" onClick={() => close()}>
                  {t('common.cancel')}
                </Button>
                <Button
                  disabled={isBodyEmpty}
                  isLoading={updateMutation.isPending}
                  loadingLabel={t('rooms.detail.announcements.saving')}
                  onClick={() => updateMutation.mutate()}
                >
                  {t('rooms.detail.announcements.actions.save')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}

      {archiveTarget ? (
        <Dialog
          title={t('rooms.detail.announcements.archiveDialog.title')}
          onClose={() => setArchiveTarget(null)}
          size="sm"
        >
          {({ close }) => (
            <>
              <DialogBody>
                <p className="app-text-supporting-copy text-ink-3">
                  {t('rooms.detail.announcements.archiveDialog.body')}
                </p>
              </DialogBody>
              <DialogActions>
                <Button variant="ghost" onClick={() => close()}>
                  {t('common.cancel')}
                </Button>
                <Button
                  isLoading={archiveMutation.isPending}
                  loadingLabel={t('rooms.detail.announcements.archiving')}
                  onClick={() => archiveMutation.mutate()}
                >
                  {t('rooms.detail.announcements.archiveDialog.confirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}
    </section>
  );
}
