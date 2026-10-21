/// <reference types="vite/client" />

// Declaration-merges with vite/client's ImportMetaEnv (which keeps its
// `[key: string]: any` index signature for any other vars) to give the
// app-specific build-time flags a precise type at their read sites.
interface ImportMetaEnv {
  readonly VITE_AUTH_COMING_SOON?: string;
  readonly VITE_MAINTENANCE_MODE?: string;
  readonly VITE_GOOGLE_OAUTH_ENABLED?: string;
  readonly VITE_LOCAL_MEDIA_ORIGIN?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_DEPLOY_ENV?: string;
}

type TowelBooksAnalyticsBuildConfig =
  | { readonly enabled: false; readonly containerId: null }
  | {
      readonly enabled: true;
      readonly containerId: `GTM-${string}`;
      readonly gtmScriptUrl: 'https://www.googletagmanager.com/gtm.js';
    };
