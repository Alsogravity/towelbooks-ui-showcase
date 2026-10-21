import { useCallback, useEffect, useRef, useState } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router';

import type { DiscardChangesDialogProps } from './DiscardChangesDialog';
import type { DiscardChangesCopyKeys } from './discardChangesCopy';

export type UseUnsavedChangesGuardOptions = {
  /** When true, leaving is intercepted (Cancel, route change, browser back). */
  isDirty: boolean;
  /**
   * Called when the user confirms discard and there is no active router
   * blocker (e.g. Cancel button). For blocked navigations, the guard calls
   * `blocker.proceed()` so the original route transition continues.
   */
  onLeave: () => void;
  /** Optional dialog copy overrides (i18n keys). */
  copy?: Partial<DiscardChangesCopyKeys>;
  /**
   * When false, skip `useBlocker` / `useBeforeUnload` and only gate explicit
   * `requestLeave` calls. Default true.
   */
  blockNavigation?: boolean;
};

export type UseUnsavedChangesGuardResult = {
  /**
   * Prefer this for Cancel / close controls. Opens the discard dialog when
   * dirty; otherwise runs `onLeave` immediately.
   */
  requestLeave: () => void;
  /**
   * Call before intentional navigations (successful save, etc.) so the
   * router blocker does not re-prompt.
   */
  allowProgrammaticNavigation: () => void;
  /**
   * Props for {@link DiscardChangesDialog}. Spread onto the dialog once near
   * the form root: `<DiscardChangesDialog {...discardChangesDialogProps} />`.
   */
  discardChangesDialogProps: DiscardChangesDialogProps;
};

/**
 * Shared unsaved-changes guard for multi-field edit surfaces.
 *
 * - **Cancel / close** → `requestLeave()`
 * - **Route / back** → React Router `useBlocker` + same dialog; confirm resumes
 *   the blocked navigation via `blocker.proceed()`
 * - **Tab close / refresh** → browser `beforeunload` prompt
 * - **Save / intentional leave** → `allowProgrammaticNavigation()` then navigate
 */
export function useUnsavedChangesGuard({
  isDirty,
  onLeave,
  copy,
  blockNavigation = true,
}: UseUnsavedChangesGuardOptions): UseUnsavedChangesGuardResult {
  const allowProgrammaticNavigationRef = useRef(false);
  const [isManualDiscardOpen, setIsManualDiscardOpen] = useState(false);

  const shouldBlockNavigation = useCallback(() => {
    if (!blockNavigation) {
      return false;
    }

    return isDirty && !allowProgrammaticNavigationRef.current;
  }, [blockNavigation, isDirty]);

  const navigationBlocker = useBlocker(shouldBlockNavigation);
  // Keep a live ref so confirm/dismiss always see the current blocker state
  // even if the callback closed over a previous render.
  const navigationBlockerRef = useRef(navigationBlocker);
  useEffect(() => {
    navigationBlockerRef.current = navigationBlocker;
  }, [navigationBlocker]);

  const isDiscardDialogOpen =
    isManualDiscardOpen ||
    (blockNavigation && navigationBlocker.state === 'blocked');

  useBeforeUnload(
    (event) => {
      if (
        !blockNavigation ||
        !isDirty ||
        allowProgrammaticNavigationRef.current
      ) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    },
    { capture: true },
  );

  const allowProgrammaticNavigation = useCallback(() => {
    allowProgrammaticNavigationRef.current = true;
  }, []);

  const requestLeave = useCallback(() => {
    if (isDirty) {
      setIsManualDiscardOpen(true);
      return;
    }

    allowProgrammaticNavigationRef.current = true;
    onLeave();
  }, [isDirty, onLeave]);

  const dismissDiscardDialog = useCallback(() => {
    setIsManualDiscardOpen(false);

    const blocker = navigationBlockerRef.current;
    if (blockNavigation && blocker.state === 'blocked') {
      // Stay on this page; cancel the pending navigation.
      blocker.reset();
    }
  }, [blockNavigation]);

  const confirmDiscard = useCallback(() => {
    // Allow the pending (or follow-up) navigation so the blocker does not
    // re-fire when we proceed / call onLeave.
    allowProgrammaticNavigationRef.current = true;

    const blocker = navigationBlockerRef.current;

    // Must call proceed() while still `blocked` and before any state update that
    // re-evaluates shouldBlockNavigation (which would auto-unblock → invalid
    // transition unblocked → proceeding).
    if (blockNavigation && blocker.state === 'blocked') {
      blocker.proceed();
      // Dialog closes when blocker leaves `blocked`; clear manual flag too.
      setIsManualDiscardOpen(false);
      return;
    }

    setIsManualDiscardOpen(false);
    // Explicit leave (Cancel control) — no blocked route to resume.
    onLeave();
  }, [blockNavigation, onLeave]);

  return {
    allowProgrammaticNavigation,
    discardChangesDialogProps: {
      isOpen: isDiscardDialogOpen,
      onCancel: dismissDiscardDialog,
      onConfirm: confirmDiscard,
      copy,
    },
    requestLeave,
  };
}
