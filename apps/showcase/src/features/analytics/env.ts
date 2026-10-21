function getAnalyticsBuildConfig(): TowelBooksAnalyticsBuildConfig | undefined {
  const config = document.querySelector<HTMLMetaElement>(
    'meta[name="towelbooks-analytics-config"]',
  );

  if (!config) {
    return undefined;
  }

  if (config.dataset.enabled === 'false') {
    return { enabled: false, containerId: null };
  }

  const { containerId, gtmScriptUrl } = config.dataset;
  if (
    config.dataset.enabled === 'true' &&
    containerId !== undefined &&
    gtmScriptUrl === 'https://www.googletagmanager.com/gtm.js'
  ) {
    return {
      enabled: true,
      containerId: containerId as `GTM-${string}`,
      gtmScriptUrl,
    };
  }

  return undefined;
}

export function getGTMContainerId(): string | undefined {
  const config = getAnalyticsBuildConfig();
  return config?.enabled ? config.containerId : undefined;
}

export function getGtmScriptUrl(): string | undefined {
  const config = getAnalyticsBuildConfig();
  return config?.enabled ? config.gtmScriptUrl : undefined;
}
