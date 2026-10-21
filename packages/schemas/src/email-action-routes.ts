/**
 * Single source of truth for every transactional email action URL.
 *
 * Email action URLs are product contracts that span the API outbox, the web
 * router, the SDK, and the rendered templates. When each service hand-builds its
 * own paths, a route rename or token-param drift silently strands a reader on a
 * 404 in the middle of a verification, password-reset, invite, or
 * account-lifecycle flow — a user-facing, production-blocking failure. The
 * account-deletion flow already hit exactly this class of bug.
 *
 * Centralising the path literals and the builders here means the link an email
 * emits and the route the SPA registers cannot diverge: the web router imports
 * these same constants, and the route-contract tests assert every internal
 * action path resolves to a registered frontend route.
 *
 * The account-deletion paths keep their dedicated home in
 * {@link ./auth/account-deletion-routes.js} (where the privacy-sensitive
 * lifecycle wiring lives); this module composes them into the shared registry
 * and convenience builders so callers have one place to reach for any link.
 */
import {
  ACCOUNT_DELETION_CANCEL_PATH,
  ACCOUNT_DELETION_CONFIRM_PATH,
  buildAccountDeletionActionUrls,
} from './auth/account-deletion-routes.js';

/** Email-verification landing route (guest auth shell). */
export const VERIFY_EMAIL_PATH = '/verify-email';

/** Password-reset landing route (guest auth shell). */
export const RESET_PASSWORD_PATH = '/reset-password';

/** Room-invite acceptance route (authenticated app shell). */
export const INVITE_ACCEPT_PATH = '/invites/accept';

/** Query-string key carrying a one-time email action token. */
export const EMAIL_ACTION_TOKEN_PARAM = 'token';

/**
 * Every internal (same-origin) email action path that must resolve to a
 * registered frontend route. The web route-contract test iterates this list.
 *
 * Notification deep links are intentionally excluded: their `href` is dynamic
 * and validated at resolution time against {@link buildNotificationActionUrl},
 * not against a fixed route table.
 */
export const EMAIL_ACTION_INTERNAL_PATHS = [
  VERIFY_EMAIL_PATH,
  RESET_PASSWORD_PATH,
  INVITE_ACCEPT_PATH,
  ACCOUNT_DELETION_CONFIRM_PATH,
  ACCOUNT_DELETION_CANCEL_PATH,
] as const;

export type EmailActionInternalPath =
  (typeof EMAIL_ACTION_INTERNAL_PATHS)[number];

/**
 * Builds an absolute, same-origin email action URL carrying the one-time token.
 * Using {@link URL} both resolves the path against {@link origin} and
 * percent-encodes the token so it survives a query-string round-trip.
 */
function buildTokenUrl(
  origin: string | URL,
  path: string,
  token: string,
): string {
  const url = new URL(path, origin);
  url.searchParams.set(EMAIL_ACTION_TOKEN_PARAM, token);

  return url.toString();
}

/** Absolute URL for the email-verification CTA. */
export function buildVerifyEmailUrl(
  origin: string | URL,
  token: string,
): string {
  return buildTokenUrl(origin, VERIFY_EMAIL_PATH, token);
}

/** Absolute URL for the password-reset CTA. */
export function buildResetPasswordUrl(
  origin: string | URL,
  token: string,
): string {
  return buildTokenUrl(origin, RESET_PASSWORD_PATH, token);
}

/** Absolute URL for the account-deletion confirmation CTA. */
export function buildAccountDeletionConfirmUrl(
  origin: string | URL,
  token: string,
): string {
  return buildAccountDeletionActionUrls(origin, token).confirmUrl;
}

/** Absolute URL for the account-deletion cancellation CTA. */
export function buildAccountDeletionCancelUrl(
  origin: string | URL,
  token: string,
): string {
  return buildAccountDeletionActionUrls(origin, token).cancelUrl;
}

/**
 * Resolves a notification's relative deep-link `href` into an absolute URL
 * against {@link origin}. Returns `null` for an absent or malformed `href` so
 * the email renders without a broken CTA rather than throwing. Unlike the other
 * builders the destination is dynamic, so it is not asserted against the route
 * table.
 */
export function buildNotificationActionUrl(
  origin: string | URL,
  href: string | null | undefined,
): string | null {
  if (!href) {
    return null;
  }

  try {
    return new URL(href, origin).toString();
  } catch {
    return null;
  }
}
