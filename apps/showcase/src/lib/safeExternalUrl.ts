import {
  isValidExternalLinkUrl,
  normalizeExternalLinkUrl,
} from '@towelbooks/schemas';

export function getSafeExternalUrl(
  url: string | null | undefined,
): string | null {
  const normalizedUrl =
    typeof url === 'string' ? normalizeExternalLinkUrl(url) : undefined;

  if (!normalizedUrl) {
    return null;
  }

  try {
    return isValidExternalLinkUrl(normalizedUrl) ? normalizedUrl : null;
  } catch {
    return null;
  }
}
