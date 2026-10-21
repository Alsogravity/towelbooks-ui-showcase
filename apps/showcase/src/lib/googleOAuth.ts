import { resolveApiBaseUrl } from './apiBaseUrl';

export type GoogleOAuthIntent = 'sign_in' | 'register';

export type GoogleOAuthEnv = {
  VITE_GOOGLE_OAUTH_ENABLED?: string;
};

export function isGoogleOAuthEnabled(env: GoogleOAuthEnv): boolean {
  return env.VITE_GOOGLE_OAUTH_ENABLED?.trim().toLowerCase() === 'true';
}

export function googleOAuthStartUrl(intent: GoogleOAuthIntent): string {
  const baseUrl = resolveApiBaseUrl(import.meta.env);
  return `${baseUrl}/auth/google/start?intent=${intent}`;
}

export const OAUTH_ACCOUNT_EXISTS_PATH = '/oauth/account-exists' as const;

export const OAUTH_ERROR_PATH = '/oauth/error' as const;
