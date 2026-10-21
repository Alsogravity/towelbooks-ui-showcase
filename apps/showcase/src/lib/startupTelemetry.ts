import { useEffect } from 'react';

export type StartupPhase =
  | 'entry'
  | 'providers-ready'
  | 'auth-bootstrap-start'
  | 'auth-bootstrap-settled'
  | 'i18n-ready'
  | 'route-gate-ready'
  | 'interactive';

const STARTUP_MARK_PREFIX = 'towelbooks.startup';
const completedPhases = new Set<StartupPhase>();

function getPerformance(): Performance | null {
  return typeof performance !== 'undefined' ? performance : null;
}

/**
 * Adds bounded, non-sensitive User Timing entries for the browser startup
 * path. These entries are intentionally local to the page; existing error
 * logging remains responsible for failure reporting.
 */
export function markStartupPhase(phase: StartupPhase): void {
  if (completedPhases.has(phase)) {
    return;
  }

  const browserPerformance = getPerformance();
  if (!browserPerformance?.mark) {
    return;
  }

  const markName = `${STARTUP_MARK_PREFIX}.${phase}`;

  try {
    browserPerformance.mark(markName);
    if (phase !== 'entry') {
      browserPerformance.measure(
        `${STARTUP_MARK_PREFIX}.${phase}.from-entry`,
        `${STARTUP_MARK_PREFIX}.entry`,
        markName,
      );
    }
    completedPhases.add(phase);
  } catch {
    // A constrained or partially mocked Performance implementation must not
    // interfere with application startup.
  }
}

export function useMarkStartupInteractive(): void {
  useEffect(() => {
    markStartupPhase('interactive');
  }, []);
}

export function resetStartupTelemetryForTests(): void {
  completedPhases.clear();
}
