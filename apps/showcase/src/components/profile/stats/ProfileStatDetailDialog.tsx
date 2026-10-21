import { type ReactNode } from 'react';

import { CatalogReviewsPanel } from './panels/CatalogReviewsPanel';
import { BooksReadPanel } from './panels/BooksReadPanel';
import { RoomsPanel } from './panels/RoomsPanel';
import { RatingsPanel } from './panels/RatingsPanel';
import { type ProfileSummaryStatDialogKey } from './profileStats';
import { shouldShowProfilePreviewEyebrow } from './profileStatPreview';
import { Dialog, DialogBody } from '../../primitives';
import { useI18n } from '../../../i18n';

const STAT_DIALOG_TITLE_KEYS: Record<ProfileSummaryStatDialogKey, string> = {
  catalogReviews: 'profile.stats.catalogReviews',
  booksRead: 'profile.stats.booksRead',
  ratings: 'profile.stats.ratings',
  rooms: 'profile.stats.rooms',
};

const STAT_DIALOG_PANELS: Record<
  ProfileSummaryStatDialogKey,
  (props: {
    emptyCompact: boolean;
    isOwnProfile: boolean;
    totalCount?: number;
    username: string;
  }) => ReactNode
> = {
  catalogReviews: ({ emptyCompact, isOwnProfile, totalCount, username }) => (
    <CatalogReviewsPanel
      emptyCompact={emptyCompact}
      isOwnProfile={isOwnProfile}
      totalCount={totalCount}
      username={username}
    />
  ),
  booksRead: ({ emptyCompact, totalCount, username }) => (
    <BooksReadPanel
      emptyCompact={emptyCompact}
      totalCount={totalCount}
      username={username}
    />
  ),
  ratings: ({ emptyCompact, totalCount, username }) => (
    <RatingsPanel
      emptyCompact={emptyCompact}
      totalCount={totalCount}
      username={username}
    />
  ),
  rooms: ({ emptyCompact, totalCount, username }) => (
    <RoomsPanel
      emptyCompact={emptyCompact}
      totalCount={totalCount}
      username={username}
    />
  ),
};

export interface ProfileStatDetailDialogProps {
  getReturnFocusElement?: () => HTMLElement | null;
  isOwnProfile?: boolean;
  onClose: () => void;
  statKey: ProfileSummaryStatDialogKey;
  totalCount?: number;
  username: string;
}

export function ProfileStatDetailDialog({
  getReturnFocusElement,
  isOwnProfile = false,
  onClose,
  statKey,
  totalCount,
  username,
}: ProfileStatDetailDialogProps) {
  const { t } = useI18n();
  const title = t(STAT_DIALOG_TITLE_KEYS[statKey]);
  const showPreviewEyebrow = shouldShowProfilePreviewEyebrow(totalCount);

  return (
    <Dialog
      closeButtonLabel={t('profile.statDialog.close')}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      showCloseButton
      size="lg"
      title={title}
    >
      <DialogBody className="max-h-[min(70vh,640px)] overflow-y-auto px-6 py-6">
        {showPreviewEyebrow ? (
          <p className="app-text-metadata -mt-2 mb-4 text-ink-3">
            {t('profile.statDialog.previewEyebrow')}
          </p>
        ) : null}
        {STAT_DIALOG_PANELS[statKey]({
          emptyCompact: true,
          isOwnProfile,
          totalCount,
          username,
        })}
      </DialogBody>
    </Dialog>
  );
}
