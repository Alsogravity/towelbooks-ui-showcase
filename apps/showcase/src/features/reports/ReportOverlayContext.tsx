import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { isProfilePath } from '../../app/profileRoutes';
import { isParticipantsHashOpen } from '../rooms/participants/participantsHash';
import { isRoomCreateReadingHashOpen } from '../readings/create-reading/readingCreationNavigation';
import { isRoomSettingsHashOpen } from '../../pages/rooms/settings/roomSettingsHash';
import { isSettingsHashOpen } from '../settings/settingsHash';

import {
  buildReportHash,
  isReportTarget,
  parseReportHash,
  type ReportTarget,
} from './reportHash';

const REPORT_NAVIGATION_STATE_KEY = 'reportOverlay';

type ReportNavigationState = {
  previousHash: string;
};

type ReportOverlayContextValue = {
  closeReport: () => void;
  currentTarget: ReportTarget | null;
  getReturnFocusElement: () => HTMLElement | null;
  isOpen: boolean;
  openReport: (target: ReportTarget) => void;
};

const ReportOverlayContext = createContext<ReportOverlayContextValue | null>(
  null,
);

function asNavigationState(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return { ...(value as Record<string, unknown>) };
}

function isReportNavigationState(
  value: unknown,
): value is ReportNavigationState {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'previousHash' in value &&
    typeof value.previousHash === 'string'
  );
}

function isSupportedOverlayHash(hash: string): boolean {
  return (
    isSettingsHashOpen(hash) ||
    isRoomSettingsHashOpen(hash) ||
    isParticipantsHashOpen(hash) ||
    isRoomCreateReadingHashOpen(hash)
  );
}

function hasReportNavigationState(state: unknown): boolean {
  if (typeof state !== 'object' || state === null || Array.isArray(state)) {
    return false;
  }

  const reportState = (state as Record<string, unknown>)[
    REPORT_NAVIGATION_STATE_KEY
  ];

  return isReportNavigationState(reportState);
}

function addReportNavigationState(
  state: unknown,
  previousHash: string,
): Record<string, unknown> {
  return {
    ...asNavigationState(state),
    [REPORT_NAVIGATION_STATE_KEY]: { previousHash },
  };
}

function resolveReportReturnFocusElement(
  activeElement: HTMLElement | null,
): HTMLElement | null {
  if (!activeElement) {
    return null;
  }

  const menu = activeElement.closest<HTMLElement>('[role="menu"]');

  if (!menu?.id) {
    return activeElement;
  }

  for (const candidate of document.querySelectorAll<HTMLElement>(
    '[aria-controls]',
  )) {
    if (candidate.getAttribute('aria-controls') === menu.id) {
      return candidate;
    }
  }

  return activeElement;
}

function removeReportNavigationState(
  state: unknown,
): Record<string, unknown> | undefined {
  const nextState = asNavigationState(state);
  delete nextState[REPORT_NAVIGATION_STATE_KEY];

  return Object.keys(nextState).length > 0 ? nextState : undefined;
}

export function ReportOverlayProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { current: returnFocusElement } = useRef<{
    element: HTMLElement | null;
  }>({ element: null });
  const currentTarget = parseReportHash(location.hash);
  const isOpen = isAuthenticated && currentTarget !== null;

  const openReport = useCallback(
    (target: ReportTarget) => {
      if (!isAuthenticated || !isReportTarget(target)) {
        return;
      }

      if (typeof document !== 'undefined') {
        returnFocusElement.element = resolveReportReturnFocusElement(
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null,
        );
      }

      const currentReport = parseReportHash(location.hash);
      const previousHash = isSupportedOverlayHash(location.hash)
        ? location.hash
        : '';

      void navigate(
        {
          hash: buildReportHash(target),
          pathname: location.pathname,
          search: location.search,
        },
        {
          replace: currentReport !== null,
          state:
            currentReport !== null
              ? location.state
              : addReportNavigationState(location.state, previousHash),
        },
      );
    },
    [
      isAuthenticated,
      location.hash,
      location.pathname,
      location.search,
      location.state,
      navigate,
      returnFocusElement,
    ],
  );

  const closeReport = useCallback(() => {
    if (!isOpen) {
      return;
    }

    if (
      hasReportNavigationState(location.state) &&
      !isProfilePath(location.pathname)
    ) {
      void navigate(-1);
      return;
    }

    void navigate(
      {
        hash: '',
        pathname: location.pathname,
        search: location.search,
      },
      {
        replace: true,
        state: removeReportNavigationState(location.state),
      },
    );
  }, [isOpen, location.pathname, location.search, location.state, navigate]);

  const value = useMemo<ReportOverlayContextValue>(
    () => ({
      closeReport,
      currentTarget,
      getReturnFocusElement: () => returnFocusElement.element,
      isOpen,
      openReport,
    }),
    [closeReport, currentTarget, isOpen, openReport, returnFocusElement],
  );

  return (
    <ReportOverlayContext.Provider value={value}>
      {children}
    </ReportOverlayContext.Provider>
  );
}

export function useReportOverlay() {
  const context = useContext(ReportOverlayContext);

  if (context === null) {
    throw new Error(
      'useReportOverlay must be used within ReportOverlayProvider',
    );
  }

  return context;
}
