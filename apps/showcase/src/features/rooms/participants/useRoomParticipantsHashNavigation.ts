import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  buildParticipantsHash,
  getParticipantsParentView,
  parseParticipantsHash,
  type ParticipantsHashView,
} from './participantsHash';

type ParticipantsLocationState = {
  participantsDepth?: number;
};

type UseRoomParticipantsHashNavigationOptions = {
  onBeforeBack?: (view: ParticipantsHashView) => void;
  onClose: () => void;
};

function readDepth(state: unknown): number {
  const value = (state as ParticipantsLocationState | null)?.participantsDepth;
  return typeof value === 'number' && value >= 1 ? value : 1;
}

/**
 * Participants overlay navigation backed by `location.hash`.
 * Forward navigation pushes hash entries; browser history is the view stack.
 * Back prefers `history.back()` when this session pushed nested entries;
 * deep links fall back to the logical parent hash (or close).
 */
export function useRoomParticipantsHashNavigation({
  onBeforeBack,
  onClose,
}: UseRoomParticipantsHashNavigationOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const view = parseParticipantsHash(location.hash);
  const depth = readDepth(location.state);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 });
  }, [location.hash]);

  const setView = useCallback(
    (next: ParticipantsHashView) => {
      const hash = buildParticipantsHash(next);
      if (hash === location.hash) {
        return;
      }

      void navigate(
        {
          hash,
          pathname: location.pathname,
          search: location.search,
        },
        {
          state: {
            ...(location.state as object | null),
            participantsDepth: depth + 1,
          } satisfies ParticipantsLocationState,
        },
      );
    },
    [
      depth,
      location.hash,
      location.pathname,
      location.search,
      location.state,
      navigate,
    ],
  );

  const replaceView = useCallback(
    (next: ParticipantsHashView) => {
      const hash = buildParticipantsHash(next);
      if (hash === location.hash) {
        return;
      }

      void navigate(
        {
          hash,
          pathname: location.pathname,
          search: location.search,
        },
        {
          replace: true,
          state: {
            ...(location.state as object | null),
            participantsDepth: depth,
          } satisfies ParticipantsLocationState,
        },
      );
    },
    [
      depth,
      location.hash,
      location.pathname,
      location.search,
      location.state,
      navigate,
    ],
  );

  const back = useCallback(() => {
    if (view == null) {
      onClose();
      return;
    }

    onBeforeBack?.(view);

    const parent = getParticipantsParentView(view);
    if (parent === 'close') {
      onClose();
      return;
    }

    if (depth > 1) {
      void navigate(-1);
      return;
    }

    // Deep-link / first overlay entry: stay on the room page and open parent.
    void navigate(
      {
        hash: buildParticipantsHash(parent),
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace: true,
        state: {
          ...(location.state as object | null),
          participantsDepth: 1,
        } satisfies ParticipantsLocationState,
      },
    );
  }, [
    depth,
    location.pathname,
    location.search,
    location.state,
    navigate,
    onBeforeBack,
    onClose,
    view,
  ]);

  const isRootView =
    view == null || getParticipantsParentView(view) === 'close';

  return {
    back,
    isRootView,
    replaceView,
    scrollRef,
    setView,
    view,
  };
}
