import { useSyncExternalStore } from 'react';

import { pageTitleChangeEventName } from '../../hooks/usePageTitle';

export function resolveMobileHeaderTitle(
  documentTitle: string,
  appName: string,
) {
  const normalizedDocumentTitle = documentTitle.trim();

  if (!normalizedDocumentTitle) {
    return appName;
  }

  const appTitleSuffix = ` · ${appName}`;

  return normalizedDocumentTitle.endsWith(appTitleSuffix)
    ? normalizedDocumentTitle.slice(0, -appTitleSuffix.length)
    : normalizedDocumentTitle;
}

function subscribeToPageTitleChanges(onStoreChange: () => void) {
  window.addEventListener(pageTitleChangeEventName, onStoreChange);

  return () => {
    window.removeEventListener(pageTitleChangeEventName, onStoreChange);
  };
}

export function useResolvedPageTitle(appName: string) {
  return useSyncExternalStore(
    subscribeToPageTitleChanges,
    () => resolveMobileHeaderTitle(document.title, appName),
    () => appName,
  );
}
