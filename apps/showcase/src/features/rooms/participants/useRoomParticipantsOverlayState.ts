import { type MouseEvent, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  buildParticipantsHash,
  isParticipantsHashOpen,
  parseParticipantsHash,
  participantsRootFromView,
  rootViewToParticipantsHash,
  type ParticipantsRootView,
} from './participantsHash';

type UseRoomParticipantsOverlayStateOptions = {
  canManageRoomOperations: boolean;
  canReviewJoinRequests: boolean;
  hasMemberRoomAccess: boolean;
  roomLoaded: boolean;
};

function canAccessParticipantsView(
  root: ParticipantsRootView,
  options: {
    canManageRoomOperations: boolean;
    canReviewJoinRequests: boolean;
    hasMemberRoomAccess: boolean;
  },
): boolean {
  if (root === 'members') {
    return options.hasMemberRoomAccess;
  }
  if (root === 'invites') {
    return options.canManageRoomOperations;
  }
  return options.canReviewJoinRequests;
}

export function useRoomParticipantsOverlayState({
  canManageRoomOperations,
  canReviewJoinRequests,
  hasMemberRoomAccess,
  roomLoaded,
}: UseRoomParticipantsOverlayStateOptions) {
  const location = useLocation();
  const navigate = useNavigate();
  const membersTriggerRef = useRef<HTMLButtonElement | null>(null);

  const parsedView = parseParticipantsHash(location.hash);
  const requestedRoot =
    parsedView != null ? participantsRootFromView(parsedView) : null;

  const isParticipantsOverlayVisible =
    requestedRoot != null &&
    canAccessParticipantsView(requestedRoot, {
      canManageRoomOperations,
      canReviewJoinRequests,
      hasMemberRoomAccess,
    });

  const isParticipantsOverlayRequested = parsedView != null;

  const closeOverlay = useCallback(() => {
    if (!isParticipantsHashOpen(location.hash) && location.hash === '') {
      return;
    }

    // Only clear the hash when it is a participants route (or leftover empty).
    if (location.hash !== '' && !isParticipantsHashOpen(location.hash)) {
      return;
    }

    void navigate(
      {
        hash: '',
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true },
    );
  }, [location.hash, location.pathname, location.search, navigate]);

  const openOverlay = useCallback(
    (root: ParticipantsRootView) => {
      const hash = buildParticipantsHash(rootViewToParticipantsHash(root));
      void navigate(
        {
          hash,
          pathname: location.pathname,
          search: location.search,
        },
        {
          state: {
            ...(location.state as object | null),
            participantsDepth: 1,
          },
        },
      );
    },
    [location.pathname, location.search, location.state, navigate],
  );

  const handleOpenMembersOverlay = (event: MouseEvent<HTMLButtonElement>) => {
    membersTriggerRef.current = event.currentTarget;
    openOverlay('members');
  };

  useEffect(() => {
    if (!roomLoaded || parsedView == null || requestedRoot == null) {
      return;
    }

    if (
      !canAccessParticipantsView(requestedRoot, {
        canManageRoomOperations,
        canReviewJoinRequests,
        hasMemberRoomAccess,
      })
    ) {
      closeOverlay();
    }
  }, [
    canManageRoomOperations,
    canReviewJoinRequests,
    closeOverlay,
    hasMemberRoomAccess,
    parsedView,
    requestedRoot,
    roomLoaded,
  ]);

  return {
    getReturnFocusElement: () => membersTriggerRef.current,
    handleOpenMembersOverlay,
    isParticipantsOverlayRequested,
    isParticipantsOverlayVisible,
    onClose: closeOverlay,
    openOverlay,
  };
}
