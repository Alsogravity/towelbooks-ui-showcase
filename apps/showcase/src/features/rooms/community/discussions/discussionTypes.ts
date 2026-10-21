import type { RegisterCommunityCreateHandler } from '../communityViewModel';
import type { CommunitySettings, Discussion } from '../../types';

export type RoomDiscussionsViewProps = {
  roomId: string;
  communitySettings: CommunitySettings | undefined;
  discussions: { items: Discussion[] } | undefined;
  hasBlockingDiscussionsError: boolean;
  isLoadingDiscussions: boolean;
  registerCreateHandler?: RegisterCommunityCreateHandler;
  onRetryDiscussions: () => void;
  selectedDiscussionId: string | null;
  onSelectDiscussion: (discussionId: string | null) => void;
};

export type DeleteTarget = Discussion | null;

export type DiscussionModerationAction = 'pin' | 'unpin' | 'lock' | 'unlock';
