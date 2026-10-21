/**
 * Single source of truth for the account-deletion email action routes.
 *
 * The API embeds these paths in the confirmation email's confirm/cancel CTAs
 * (built against `APP_ORIGIN`), and the web app registers the very same paths
 * as SPA routes. Sharing the literals here means the emailed link and the
 * frontend route cannot drift apart and strand a reader on a 404 mid
 * account-lifecycle flow — a privacy-sensitive, production-blocking failure.
 *
 * Any change here must keep the API outbox, the web router, and their guard
 * tests in lockstep; they all import from this module.
 */
export const ACCOUNT_DELETION_CONFIRM_PATH = '/account-deletion/confirm';
export const ACCOUNT_DELETION_CANCEL_PATH = '/account-deletion/cancel';

/** Query-string key carrying the one-time account-deletion token. */
export const ACCOUNT_DELETION_TOKEN_PARAM = 'token';

export type AccountDeletionActionUrls = Readonly<{
  cancelUrl: string;
  confirmUrl: string;
}>;

/**
 * Builds the absolute confirm/cancel URLs for the account-deletion email from a
 * frontend origin and the one-time token. Centralising construction here keeps
 * the token param name and route paths consistent with the web routes.
 */
export function buildAccountDeletionActionUrls(
  origin: string | URL,
  token: string,
): AccountDeletionActionUrls {
  const confirmUrl = new URL(ACCOUNT_DELETION_CONFIRM_PATH, origin);
  confirmUrl.searchParams.set(ACCOUNT_DELETION_TOKEN_PARAM, token);

  const cancelUrl = new URL(ACCOUNT_DELETION_CANCEL_PATH, origin);
  cancelUrl.searchParams.set(ACCOUNT_DELETION_TOKEN_PARAM, token);

  return {
    cancelUrl: cancelUrl.toString(),
    confirmUrl: confirmUrl.toString(),
  };
}
