/**
 * Shared polling configuration for the notification-bell count surface.
 *
 * The bell aggregates four lightweight summary endpoints (unread notifications,
 * follow requests, room join requests, room member invites) that stay mounted
 * for every open authenticated session. A 5-minute poll keeps the badge fresh
 * for long-lived focused sessions at a fraction of the previous 60s rate, and
 * focus refetches cover the common "switched tabs and came back" case. The
 * panel's acknowledge/mark-seen mutations invalidate these queries on user
 * action, so the count is never stale after interaction.
 */
export const NOTIFICATIONS_BELL_POLL_MS = 5 * 60_000;
