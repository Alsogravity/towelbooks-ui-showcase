/**
 * Removes whitespace and invisible Unicode formatting characters that can be
 * introduced when an identifier is copied from bidirectional text. These
 * characters have no meaning in ISBNs or ASINs and must not survive into a
 * route or canonical identifier.
 */
export function normalizeIdentifierFormatting(input: string): string {
  return input.replace(/[\s\p{Cf}]/gu, '');
}
