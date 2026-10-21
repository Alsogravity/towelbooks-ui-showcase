import { type ExternalLink } from '@towelbooks/schemas';

export function getExternalLinkHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

export function formatExternalLinksSummary(
  links: ExternalLink[],
  moreLabel: (count: number) => string,
): string | null {
  if (links.length === 0) {
    return null;
  }

  const firstHostname = getExternalLinkHostname(links[0]!.url);
  const remainingCount = links.length - 1;

  if (remainingCount <= 0) {
    return firstHostname;
  }

  return `${firstHostname} ${moreLabel(remainingCount)}`;
}
