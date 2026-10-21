const MARKDOWN_LINK_PATTERN = /!?\[([^\]\r\n]+)\]\(\s*[^)\r\n]+\s*\)/gu;
const MARKDOWN_REFERENCE_DEFINITION_PATTERN =
  /^\s{0,3}\[[^\]\r\n]+\]:\s*(?:<[^>\r\n]+>|(?:https?:\/\/|ftp:\/\/|\/\/|\/|\.\.?\/|www\.)\S+)\s*$/gmu;
const HTML_URL_ATTRIBUTE_PATTERN =
  /\b(?:href|src|cite|action|formaction|poster)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/giu;
const URL_SCHEME_PATTERN =
  /\b[a-z][a-z\d+.-]{1,31}:(?:\/\/[^\s<>()]+|[A-Za-z][^\s<>()]*)/giu;
const PROTOCOL_RELATIVE_URL_PATTERN =
  /(^|[^\p{L}\p{N}@_-])\/\/(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,}(?::\d{2,5})?(?:[/?#][^\s<>()]*)?/giu;
const IPV4_URL_PATTERN =
  /(^|[^\p{L}\p{N}@_-])(?:(?:https?:)?\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d{2,5})?(?:[/?#][^\s<>()]*)?/gu;
const DOMAIN_URL_PATTERN =
  /(^|[^\p{L}\p{N}@_-])((?:www\.)?(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,}(?::\d{2,5})?(?:[/?#][^\s<>()]*)?)/giu;

const TEXT_URL_PATTERNS = [
  MARKDOWN_LINK_PATTERN,
  MARKDOWN_REFERENCE_DEFINITION_PATTERN,
  HTML_URL_ATTRIBUTE_PATTERN,
  URL_SCHEME_PATTERN,
  PROTOCOL_RELATIVE_URL_PATTERN,
  IPV4_URL_PATTERN,
  DOMAIN_URL_PATTERN,
];

export const TEXT_URL_NOT_ALLOWED_MESSAGE =
  'URLs are not allowed in this text.';

function matchesTextUrlPattern(pattern: RegExp, value: string): boolean {
  pattern.lastIndex = 0;
  return pattern.test(value);
}

export function containsTextUrl(value: string): boolean {
  return TEXT_URL_PATTERNS.some((pattern) =>
    matchesTextUrlPattern(pattern, value),
  );
}

export function removeTextUrls(value: string): string {
  return value
    .replace(MARKDOWN_LINK_PATTERN, '$1')
    .replace(MARKDOWN_REFERENCE_DEFINITION_PATTERN, '')
    .replace(HTML_URL_ATTRIBUTE_PATTERN, '')
    .replace(URL_SCHEME_PATTERN, '')
    .replace(PROTOCOL_RELATIVE_URL_PATTERN, '$1')
    .replace(IPV4_URL_PATTERN, '$1')
    .replace(DOMAIN_URL_PATTERN, '$1');
}
