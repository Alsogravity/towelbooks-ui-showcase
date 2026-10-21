import type { RefreshResponse } from '@towelbooks/schemas';

import { authStore } from './authStore';

const REFRESH_LEAD_TIME_MS = 60_000;
const MIN_REFRESH_DELAY_MS = 1_000;
const TRANSIENT_REFRESH_RETRY_DELAY_MS = 30_000;

type RefreshHandler = () => Promise<RefreshResponse>;

let refreshHandler: RefreshHandler | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let refreshPromise: Promise<RefreshResponse | null> | null = null;
let sessionGeneration = 0;

function clearRefreshTimer(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleRefresh(delayMs: number): void {
  clearRefreshTimer();
  refreshTimer = setTimeout(
    () => {
      refreshTimer = null;
      void refreshAuthSession();
    },
    Math.max(MIN_REFRESH_DELAY_MS, delayMs),
  );
}

export function configureAuthSession(
  data: Pick<RefreshResponse, 'accessToken' | 'expiresInSeconds'>,
  handler: RefreshHandler,
): void {
  sessionGeneration += 1;
  refreshHandler = handler;
  authStore.setToken(data.accessToken);
  clearRefreshTimer();

  scheduleRefresh(
    Math.max(
      MIN_REFRESH_DELAY_MS,
      data.expiresInSeconds * 1_000 - REFRESH_LEAD_TIME_MS,
    ),
  );
}

export function clearAuthSession(): void {
  sessionGeneration += 1;
  refreshHandler = null;
  clearRefreshTimer();
  authStore.setToken(null);
}

export async function refreshAuthSession(): Promise<RefreshResponse | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const handler = refreshHandler;
  if (!handler) {
    return null;
  }

  const generationAtStart = sessionGeneration;
  let trackedPromise: Promise<RefreshResponse | null>;
  trackedPromise = handler()
    .then((data) => {
      if (
        sessionGeneration !== generationAtStart ||
        refreshHandler !== handler
      ) {
        return null;
      }

      configureAuthSession(data, handler);
      return data;
    })
    .catch(() => {
      if (
        sessionGeneration === generationAtStart &&
        refreshHandler === handler
      ) {
        scheduleRefresh(TRANSIENT_REFRESH_RETRY_DELAY_MS);
      }
      return null;
    })
    .finally(() => {
      if (refreshPromise === trackedPromise) {
        refreshPromise = null;
      }
    });

  refreshPromise = trackedPromise;
  return refreshPromise;
}

export function resetAuthTokenLifecycleForTests(): void {
  refreshPromise = null;
  clearAuthSession();
}
