import { type RefObject } from 'react';

/*
 * Central dialog stack (epic #653 review remediation, finding P2-2).
 *
 * Every open Dialog registers itself; the topmost (last-pushed) entry is the
 * ACTIVE dialog. The stack owns the two behaviors that must belong to a single
 * dialog at a time:
 *
 * - the one global `keydown` listener, which dispatches every Escape/Tab event
 *   to the active dialog's handler only — lower dialogs never see the event,
 *   so they cannot close together or fight over Tab containment;
 * - background isolation, which always isolates every `document.body` child
 *   except the active dialog's own portal wrapper. A lower dialog's portal is
 *   itself a body child, so its content becomes inert/aria-hidden the moment a
 *   higher dialog opens and is un-isolated again when it regains the top of
 *   the stack.
 *
 * Body scroll locking stays refcounted in Dialog.tsx: several open dialogs
 * must keep the lock until the last one closes.
 */

export interface DialogStackEntry {
  /** Stable per-dialog identity. */
  id: number;
  /** The dialog's portal wrapper (`.vui-dialog`), re-read at event time. */
  wrapperRef: RefObject<HTMLElement | null>;
  /**
   * Escape/Tab handler of this dialog. The active dialog's handler receives
   * every keydown; it must read dismissal props from refs at event time (the
   * handler closure is created once per dialog instance).
   */
  keydownHandler: ((event: globalThis.KeyboardEvent) => void) | null;
}

let nextDialogId = 1;

export function createDialogEntryId(): number {
  return nextDialogId++;
}

const stack: DialogStackEntry[] = [];

export function isTopmostDialog(id: number): boolean {
  const topmost = stack[stack.length - 1];

  return topmost !== undefined && topmost.id === id;
}

function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
  stack[stack.length - 1]?.keydownHandler?.(event);
}

/*
 * Background isolation. Applies the safest supported strategy to every body
 * child outside the active dialog: the native `inert` attribute where
 * supported, `aria-hidden="true"` otherwise (jsdom-safe feature detection).
 * The isolated set is rebuilt whenever the stack changes: each rebuild first
 * restores the previous pass (records hold the true pre-isolation state) and
 * then re-snapshots the body around the new active dialog's wrapper, which
 * both covers lower dialogs' portals and prunes wrappers that unmounted in
 * between.
 */
type BackgroundIsolationEntry = {
  element: HTMLElement;
  previousAriaHidden: string | null;
  previousInert: boolean;
};

let backgroundIsolationEntries: BackgroundIsolationEntry[] = [];

function inertSupported() {
  return typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;
}

function restoreBackgroundIsolation() {
  for (const entry of backgroundIsolationEntries) {
    if (entry.previousAriaHidden === null) {
      entry.element.removeAttribute('aria-hidden');
    } else {
      entry.element.setAttribute('aria-hidden', entry.previousAriaHidden);
    }

    if (inertSupported()) {
      entry.element.inert = entry.previousInert;
    }
  }

  backgroundIsolationEntries = [];
}

function rebuildBackgroundIsolation(excludeElement: HTMLElement | null) {
  restoreBackgroundIsolation();

  if (!excludeElement) {
    return;
  }

  backgroundIsolationEntries = Array.from(document.body.children)
    .filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== excludeElement,
    )
    .map((element) => ({
      element,
      previousAriaHidden: element.getAttribute('aria-hidden'),
      previousInert: inertSupported() ? element.inert : false,
    }));

  for (const entry of backgroundIsolationEntries) {
    entry.element.setAttribute('aria-hidden', 'true');

    if (inertSupported()) {
      entry.element.inert = true;
    }
  }
}

/**
 * Registers an open dialog as the new topmost and re-isolates the background
 * around its wrapper. The first registration also attaches the single global
 * keydown listener. Idempotent for a dialog that is already registered.
 */
export function pushDialog(entry: DialogStackEntry) {
  const wasEmpty = stack.length === 0;
  const existingIndex = stack.findIndex((other) => other.id === entry.id);

  if (existingIndex !== -1) {
    stack.splice(existingIndex, 1);
  }

  if (wasEmpty) {
    document.addEventListener('keydown', handleGlobalKeyDown);
  }

  stack.push(entry);
  rebuildBackgroundIsolation(entry.wrapperRef.current);
}

/**
 * Unregisters a dialog. When the last dialog closes, the background isolation
 * is fully restored and the global keydown listener is removed; otherwise the
 * isolation is rebuilt around the next topmost dialog, which silently resumes
 * Escape/Tab handling and focus trapping.
 */
export function popDialog(id: number) {
  const index = stack.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return;
  }

  stack.splice(index, 1);

  if (stack.length === 0) {
    restoreBackgroundIsolation();
    document.removeEventListener('keydown', handleGlobalKeyDown);
    return;
  }

  rebuildBackgroundIsolation(stack[stack.length - 1]!.wrapperRef.current);
}
