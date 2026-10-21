import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router';

import { NotificationsPanel } from './NotificationsPanel';
import { useAcknowledgeNotifications } from './useNotifications';
import { useMarkFollowRequestsSeen } from '../follow-requests/useFollowRequestsSummary';
import { useMarkRoomMemberInvitesSeen } from '../room-member-invites/useRoomMemberInvitesSummary';
import { useMarkRoomJoinRequestsSeen } from '../room-join-requests/useRoomJoinRequestsSummary';

type NotificationsPanelSide = 'left' | 'right';
type NotificationPanelSessionState = {
  followRequestsSnapshotAt: string | null;
  followRequestsUnseenCount: number | null;
  openedAt: number;
  roomJoinRequestsSnapshotAt: string | null;
  roomJoinRequestsUnseenCount: number | null;
  roomMemberInvitesSnapshotAt: string | null;
  roomMemberInvitesUnseenCount: number | null;
  unreadCount: number | null;
  unreadIds: string[];
};

type NotificationsPanelContextValue = {
  close: () => void;
  isOpen: boolean;
  openFromMobileHeader: () => void;
  openFromSidebar: () => void;
  registerFollowRequestsSummary: (input: {
    snapshotAt: string;
    unseenCount: number;
  }) => void;
  registerRoomJoinRequestsSummary: (input: {
    snapshotAt: string;
    unseenCount: number;
  }) => void;
  registerRoomMemberInvitesSummary: (input: {
    snapshotAt: string;
    unseenCount: number;
  }) => void;
  registerVisibleUnreadNotifications: (input: {
    unreadCount: number;
    unreadIds: string[];
  }) => void;
  sessionOpenedAt: number | null;
  sessionUnreadIds: ReadonlySet<string>;
};

type NotificationsPanelState = {
  routeKey: string;
  session: NotificationPanelSessionState;
  side: NotificationsPanelSide;
};

function sessionHasUnread(session: NotificationPanelSessionState): boolean {
  return (session.unreadCount ?? 0) > 0 || session.unreadIds.length > 0;
}

function sessionHasUnseenFollowRequests(
  session: NotificationPanelSessionState,
): boolean {
  return (
    (session.followRequestsUnseenCount ?? 0) > 0 &&
    session.followRequestsSnapshotAt !== null
  );
}

function sessionHasUnseenRoomJoinRequests(
  session: NotificationPanelSessionState,
): boolean {
  return (
    (session.roomJoinRequestsUnseenCount ?? 0) > 0 &&
    session.roomJoinRequestsSnapshotAt !== null
  );
}

function sessionHasUnseenRoomMemberInvites(
  session: NotificationPanelSessionState,
): boolean {
  return (
    (session.roomMemberInvitesUnseenCount ?? 0) > 0 &&
    session.roomMemberInvitesSnapshotAt !== null
  );
}

const NotificationsPanelContext =
  createContext<NotificationsPanelContextValue | null>(null);

export function NotificationsPanelProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}${location.hash}`;
  const acknowledge = useAcknowledgeNotifications();
  const markFollowRequestsSeen = useMarkFollowRequestsSeen();
  const markRoomJoinRequestsSeen = useMarkRoomJoinRequestsSeen();
  const markRoomMemberInvitesSeen = useMarkRoomMemberInvitesSeen();
  const [panelState, setPanelState] = useState<NotificationsPanelState | null>(
    null,
  );
  const panelStateRef = useRef<NotificationsPanelState | null>(panelState);

  const acknowledgeSessionIfNeeded = useCallback(
    (session: NotificationPanelSessionState) => {
      if (sessionHasUnread(session)) {
        acknowledge.mutate();
      }

      if (sessionHasUnseenFollowRequests(session)) {
        const seenBefore = session.followRequestsSnapshotAt;

        if (seenBefore !== null) {
          markFollowRequestsSeen.mutate({
            seenBefore,
          });
        }
      }

      if (sessionHasUnseenRoomJoinRequests(session)) {
        const seenBefore = session.roomJoinRequestsSnapshotAt;

        if (seenBefore !== null) {
          markRoomJoinRequestsSeen.mutate({
            seenBefore,
          });
        }
      }

      if (sessionHasUnseenRoomMemberInvites(session)) {
        const seenBefore = session.roomMemberInvitesSnapshotAt;

        if (seenBefore !== null) {
          markRoomMemberInvitesSeen.mutate({
            seenBefore,
          });
        }
      }
    },
    [
      acknowledge,
      markFollowRequestsSeen,
      markRoomJoinRequestsSeen,
      markRoomMemberInvitesSeen,
    ],
  );

  const clearPanelState = useCallback(() => {
    panelStateRef.current = null;
    setPanelState(null);
  }, []);

  const closePanel = useCallback(() => {
    const activePanel = panelStateRef.current;

    clearPanelState();

    if (activePanel) {
      acknowledgeSessionIfNeeded(activePanel.session);
    }
  }, [acknowledgeSessionIfNeeded, clearPanelState]);

  const openPanel = useCallback(
    (side: NotificationsPanelSide) => {
      const nextPanelState = {
        routeKey,
        side,
        session: {
          followRequestsSnapshotAt: null,
          followRequestsUnseenCount: null,
          openedAt: Date.now(),
          roomJoinRequestsSnapshotAt: null,
          roomJoinRequestsUnseenCount: null,
          roomMemberInvitesSnapshotAt: null,
          roomMemberInvitesUnseenCount: null,
          unreadCount: null,
          unreadIds: [],
        },
      } satisfies NotificationsPanelState;

      panelStateRef.current = nextPanelState;
      setPanelState(nextPanelState);
    },
    [routeKey],
  );

  const openFromMobileHeader = useCallback(() => {
    openPanel('right');
  }, [openPanel]);

  const openFromSidebar = useCallback(() => {
    openPanel('left');
  }, [openPanel]);

  const activePanel = panelState?.routeKey === routeKey ? panelState : null;
  const sessionUnreadIds = useMemo(
    () => new Set(activePanel?.session.unreadIds ?? []),
    [activePanel?.session.unreadIds],
  );

  useEffect(() => {
    const activeSession = panelStateRef.current;

    if (activeSession === null || activeSession.routeKey === routeKey) {
      return;
    }

    clearPanelState();
    acknowledgeSessionIfNeeded(activeSession.session);
  }, [acknowledgeSessionIfNeeded, clearPanelState, routeKey]);

  const registerVisibleUnreadNotifications = useCallback(
    ({
      unreadCount,
      unreadIds,
    }: {
      unreadCount: number;
      unreadIds: string[];
    }) => {
      setPanelState((current) => {
        if (current === null || current.routeKey !== routeKey) {
          return current;
        }

        const mergedUnreadIds = Array.from(
          new Set([...current.session.unreadIds, ...unreadIds]),
        );
        const unreadIdsUnchanged =
          mergedUnreadIds.length === current.session.unreadIds.length;

        if (current.session.unreadCount === unreadCount && unreadIdsUnchanged) {
          panelStateRef.current = current;
          return current;
        }

        const nextState = {
          ...current,
          session: {
            ...current.session,
            unreadCount,
            unreadIds: mergedUnreadIds,
          },
        };

        panelStateRef.current = nextState;
        return nextState;
      });
    },
    [routeKey],
  );

  const registerFollowRequestsSummary = useCallback(
    ({
      snapshotAt,
      unseenCount,
    }: {
      snapshotAt: string;
      unseenCount: number;
    }) => {
      setPanelState((current) => {
        if (current === null || current.routeKey !== routeKey) {
          return current;
        }

        if (
          current.session.followRequestsSnapshotAt === snapshotAt &&
          current.session.followRequestsUnseenCount === unseenCount
        ) {
          panelStateRef.current = current;
          return current;
        }

        const nextState = {
          ...current,
          session: {
            ...current.session,
            followRequestsSnapshotAt: snapshotAt,
            followRequestsUnseenCount: unseenCount,
          },
        };

        panelStateRef.current = nextState;
        return nextState;
      });
    },
    [routeKey],
  );

  const registerRoomJoinRequestsSummary = useCallback(
    ({
      snapshotAt,
      unseenCount,
    }: {
      snapshotAt: string;
      unseenCount: number;
    }) => {
      setPanelState((current) => {
        if (current === null || current.routeKey !== routeKey) {
          return current;
        }

        if (
          current.session.roomJoinRequestsSnapshotAt === snapshotAt &&
          current.session.roomJoinRequestsUnseenCount === unseenCount
        ) {
          panelStateRef.current = current;
          return current;
        }

        const nextState = {
          ...current,
          session: {
            ...current.session,
            roomJoinRequestsSnapshotAt: snapshotAt,
            roomJoinRequestsUnseenCount: unseenCount,
          },
        };

        panelStateRef.current = nextState;
        return nextState;
      });
    },
    [routeKey],
  );

  const registerRoomMemberInvitesSummary = useCallback(
    ({
      snapshotAt,
      unseenCount,
    }: {
      snapshotAt: string;
      unseenCount: number;
    }) => {
      setPanelState((current) => {
        if (current === null || current.routeKey !== routeKey) {
          return current;
        }

        if (
          current.session.roomMemberInvitesSnapshotAt === snapshotAt &&
          current.session.roomMemberInvitesUnseenCount === unseenCount
        ) {
          panelStateRef.current = current;
          return current;
        }

        const nextState = {
          ...current,
          session: {
            ...current.session,
            roomMemberInvitesSnapshotAt: snapshotAt,
            roomMemberInvitesUnseenCount: unseenCount,
          },
        };

        panelStateRef.current = nextState;
        return nextState;
      });
    },
    [routeKey],
  );

  const value = useMemo(
    () => ({
      close: closePanel,
      isOpen: activePanel !== null,
      openFromMobileHeader,
      openFromSidebar,
      registerFollowRequestsSummary,
      registerRoomJoinRequestsSummary,
      registerRoomMemberInvitesSummary,
      registerVisibleUnreadNotifications,
      sessionOpenedAt: activePanel?.session.openedAt ?? null,
      sessionUnreadIds,
    }),
    [
      activePanel,
      closePanel,
      openFromMobileHeader,
      openFromSidebar,
      registerFollowRequestsSummary,
      registerRoomJoinRequestsSummary,
      registerRoomMemberInvitesSummary,
      registerVisibleUnreadNotifications,
      sessionUnreadIds,
    ],
  );

  return (
    <NotificationsPanelContext.Provider value={value}>
      {children}
      {activePanel ? (
        <NotificationsPanel onClose={closePanel} side={activePanel.side} />
      ) : null}
    </NotificationsPanelContext.Provider>
  );
}

export function useNotificationsPanel() {
  const context = useContext(NotificationsPanelContext);

  if (context === null) {
    throw new Error(
      'useNotificationsPanel must be used within NotificationsPanelProvider.',
    );
  }

  return context;
}
