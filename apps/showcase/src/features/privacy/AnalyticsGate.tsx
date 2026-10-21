import { useEffect, useRef } from 'react';

import {
  getGTMContainerId,
  getGtmScriptUrl,
  GTMAnalyticsService,
  loadGtmAfterConsent,
  NoOpAnalyticsService,
  setActiveService,
  shutdownGtmAfterConsentWithdrawal,
} from '../analytics';
import { useAnalyticsConsent } from './AnalyticsConsentContext';

type AnalyticsGateProps = {
  reloadPage?: () => void;
};

function reloadCurrentPage() {
  window.location.reload();
}

export function AnalyticsGate({
  reloadPage = reloadCurrentPage,
}: AnalyticsGateProps = {}) {
  const { state } = useAnalyticsConsent();
  const containerId = getGTMContainerId();
  const gtmScriptUrl = getGtmScriptUrl();
  const reloadRequested = useRef(false);

  useEffect(() => {
    if (
      !containerId ||
      !gtmScriptUrl ||
      state.status !== 'resolved' ||
      state.effective !== 'granted'
    ) {
      setActiveService(new NoOpAnalyticsService());
      const requiresReload = shutdownGtmAfterConsentWithdrawal();
      if (requiresReload && !reloadRequested.current) {
        reloadRequested.current = true;
        reloadPage();
      }
      return;
    }
    loadGtmAfterConsent(containerId, gtmScriptUrl);
    setActiveService(new GTMAnalyticsService());
  }, [containerId, gtmScriptUrl, reloadPage, state]);

  return null;
}
