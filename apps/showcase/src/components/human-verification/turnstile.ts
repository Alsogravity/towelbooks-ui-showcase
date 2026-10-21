export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_SCRIPT_ID = 'towelbooks-turnstile-script';

export type TurnstileWidgetOptions = Readonly<{
  action: string;
  callback: (token: string) => void;
  'error-callback': () => void;
  'expired-callback': () => void;
  'timeout-callback': () => void;
  sitekey: string;
}>;

export type TurnstileApi = Readonly<{
  ready: (callback: () => void) => void;
  remove: (widgetId: string) => void;
  render: (container: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId: string) => void;
}>;

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoadPromise: Promise<TurnstileApi> | null = null;

export function loadTurnstileScript(): Promise<TurnstileApi> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(
      new Error('Turnstile requires a browser environment.'),
    );
  }

  if (!document.getElementById(TURNSTILE_SCRIPT_ID)) {
    scriptLoadPromise = null;
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  scriptLoadPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement('script');

    if (
      existingScript &&
      new URL(existingScript.src, document.baseURI).href !==
        TURNSTILE_SCRIPT_URL
    ) {
      reject(new Error('Turnstile script source is not approved.'));
      return;
    }

    const resolveApi = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
        return;
      }

      reject(new Error('Turnstile did not expose its browser API.'));
    };

    script.addEventListener('load', resolveApi, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Turnstile script failed to load.')),
      { once: true },
    );

    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.async = true;
      script.defer = true;
      script.src = TURNSTILE_SCRIPT_URL;
      document.head.append(script);
    }
  }).catch((error: unknown) => {
    scriptLoadPromise = null;
    throw error;
  });

  return scriptLoadPromise;
}
