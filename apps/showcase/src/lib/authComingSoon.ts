/**
 * Build-time switch that gates the guest auth screens (login, register,
 * verify-email, forgot/reset password) behind a single "available soon"
 * screen. It lets the public site ship to production before the backend is
 * live without exposing sign-in flows that cannot succeed yet.
 *
 * The value is read from the Vite env at build time so it is baked into the
 * bundle; flipping it requires a rebuild/redeploy, not a runtime change.
 */
export type AuthComingSoonEnv = {
  VITE_AUTH_COMING_SOON?: string;
};

export function isAuthComingSoonEnabled(env: AuthComingSoonEnv): boolean {
  return env.VITE_AUTH_COMING_SOON?.trim().toLowerCase() === 'true';
}
