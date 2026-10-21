/**
 * Shared `@mention` parsing used by both the web client (to render mentions as
 * profile links) and the API (to resolve mentioned users for notifications).
 *
 * Group 1 is the leading boundary character (start-of-string or a non-word,
 * non-`@` char) which is kept as plain text when rendering. Group 2 is the
 * username. The boundary guards against matching email domains (e.g. the
 * `@example` in `user@example.com`). The username charset mirrors the
 * registration rule (`/^[a-z0-9_-]+$/`).
 */
export const MENTION_PATTERN = /(^|[^\w@])@([a-z0-9_-]+)/g;

/**
 * Returns the unique usernames mentioned in `body`, in order of first
 * appearance. The returned regex state is never shared (`matchAll` clones the
 * source pattern), so this is safe to call repeatedly.
 */
export function extractMentions(body: string): string[] {
  const usernames: string[] = [];
  const seen = new Set<string>();

  for (const match of body.matchAll(MENTION_PATTERN)) {
    const username = match[2];

    if (username && !seen.has(username)) {
      seen.add(username);
      usernames.push(username);
    }
  }

  return usernames;
}
