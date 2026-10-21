import { useCallback, useEffect, useRef } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router';

import type { useI18n } from '../../i18n';

export function useCatalogReviewUnsavedChangesGuard(
  isDirty: boolean,
  t: ReturnType<typeof useI18n>['t'],
) {
  const allowProgrammaticNavigationRef = useRef(false);

  const shouldBlockNavigation = useCallback(() => {
    return isDirty && !allowProgrammaticNavigationRef.current;
  }, [isDirty]);
  const blocker = useBlocker(shouldBlockNavigation);

  useEffect(() => {
    if (blocker.state !== 'blocked') {
      return;
    }

    if (window.confirm(t('catalog.catalogReviewEditor.unsaved.confirm'))) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker, t]);

  useBeforeUnload(
    (event) => {
      if (!isDirty || allowProgrammaticNavigationRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    },
    { capture: true },
  );

  return allowProgrammaticNavigationRef;
}
