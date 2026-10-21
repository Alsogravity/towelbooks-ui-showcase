type AnalyticsConsent = 'granted' | 'denied';

const gtmScriptAttribute = 'data-towelbooks-gtm';
const analyticsNetworkBlockAttribute =
  'data-towelbooks-analytics-network-block';
const googleAnalyticsConnectSources = new Set([
  'https://www.google-analytics.com',
  'https://analytics.google.com',
  'https://www.google.com',
]);
const fallbackConnectSources = [
  "'self'",
  'https://challenges.cloudflare.com',
  'https://api.towelbooks.com',
  'https://api-staging.towelbooks.com',
  'https://*.s3.us-east-1.amazonaws.com',
];

function gtag(): void {
  window.dataLayer = window.dataLayer ?? [];
  // Google's documented command API records the arguments object, not a
  // lookalike array. GTM consumes this exact data-layer command shape.
  window.dataLayer.push(arguments);
}

function initializeConsentMode(): void {
  if (window.gtag) {
    return;
  }

  window.gtag = gtag;
  window.gtag('consent', 'default', {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: 'denied',
  });
}

function getBaselineConnectSources(): string[] {
  const policyMeta = Array.from(
    document.head.querySelectorAll<HTMLMetaElement>('meta[http-equiv]'),
  ).find(
    (meta) =>
      !meta.hasAttribute(analyticsNetworkBlockAttribute) &&
      meta.httpEquiv.toLowerCase() === 'content-security-policy',
  );
  const connectDirective = policyMeta?.content
    .split(';')
    .map((directive) => directive.trim())
    .find(
      (directive) =>
        directive === 'connect-src' || directive.startsWith('connect-src '),
    );

  if (!connectDirective) {
    return fallbackConnectSources;
  }

  return connectDirective
    .split(/\s+/)
    .slice(1)
    .filter((source) => !googleAnalyticsConnectSources.has(source));
}

function blockGoogleAnalyticsConnections(): void {
  if (document.head.querySelector(`meta[${analyticsNetworkBlockAttribute}]`)) {
    return;
  }

  const connectSources = getBaselineConnectSources();
  const policy = document.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.setAttribute(analyticsNetworkBlockAttribute, 'true');
  policy.content = `connect-src ${
    connectSources.length > 0 ? connectSources.join(' ') : "'none'"
  }`;
  document.head.append(policy);
}

/** The sole boundary that communicates consent and GTM lifecycle to Google. */
export function updateConsent(state: AnalyticsConsent): void {
  initializeConsentMode();
  window.gtag?.('consent', 'update', { analytics_storage: state });
}

/**
 * Stops an already-loaded GTM runtime from issuing consent-less pings.
 *
 * Consent Mode's denied state still permits cookieless network requests. A
 * second CSP therefore removes the approved Google collection origins before
 * the denial command is delivered. The caller must reload the document after
 * the account withdrawal succeeds so the third-party runtime is destroyed.
 */
export function shutdownGtmAfterConsentWithdrawal(): boolean {
  const loadedScripts = document.head.querySelectorAll<HTMLScriptElement>(
    `script[${gtmScriptAttribute}]`,
  );
  const loadedFrames = document.querySelectorAll<HTMLIFrameElement>(
    'iframe[src^="https://www.googletagmanager.com/"]',
  );
  const networkBlock = document.head.querySelector(
    `meta[${analyticsNetworkBlockAttribute}]`,
  );
  const hadLoadedRuntime =
    loadedScripts.length > 0 ||
    loadedFrames.length > 0 ||
    networkBlock !== null;

  if (hadLoadedRuntime) {
    blockGoogleAnalyticsConnections();
  }

  updateConsent('denied');
  loadedScripts.forEach((script) => script.remove());
  loadedFrames.forEach((frame) => frame.remove());

  return hadLoadedRuntime;
}

export function loadGtmAfterConsent(
  containerId: string,
  gtmScriptUrl: string,
): void {
  try {
    if (
      document.head.querySelector(`meta[${analyticsNetworkBlockAttribute}]`)
    ) {
      return;
    }

    initializeConsentMode();
    updateConsent('granted');

    if (document.querySelector(`script[${gtmScriptAttribute}]`)) {
      return;
    }

    window.dataLayer?.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute(gtmScriptAttribute, 'true');
    script.src = `${gtmScriptUrl}?id=${encodeURIComponent(containerId)}`;
    document.head.append(script);
  } catch {
    // Analytics is optional and must never affect application availability.
  }
}
