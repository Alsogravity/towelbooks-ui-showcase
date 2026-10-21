export type CommunityView = 'discussions' | 'polls';

export type CommunityCreateAction = {
  label: string;
  onClick: () => void;
};

export type RegisterCommunityCreateHandler = (
  handler: (() => void) | null,
) => void;

export function resolveCommunityView(view: string | null): CommunityView {
  if (view === 'polls') {
    return 'polls';
  }

  return 'discussions';
}

export function buildCommunityDiscussionsHref(
  roomId: string,
  discussionId?: string | null,
): string {
  const params = new URLSearchParams({
    tab: 'community',
    view: 'discussions',
  });

  if (discussionId) {
    params.set('discussion', discussionId);
  }

  return `/rooms/${roomId}?${params.toString()}`;
}

export function buildCommunityPollsHref(
  roomId: string,
  pollId?: string | null,
): string {
  const params = new URLSearchParams({
    tab: 'community',
    view: 'polls',
  });

  if (pollId) {
    params.set('poll', pollId);
  }

  return `/rooms/${roomId}?${params.toString()}`;
}
