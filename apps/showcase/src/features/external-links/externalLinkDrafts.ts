import type { ExternalLink, ExternalLinkInput } from '@towelbooks/schemas';

export function toExternalLinkInputs(
  links: Array<Pick<ExternalLink, 'title' | 'url'> | ExternalLinkInput>,
): ExternalLinkInput[] {
  return links.map(({ title, url }) => ({ title, url }));
}

export function areExternalLinkInputsEqual(
  left: ExternalLinkInput[],
  right: ExternalLinkInput[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((link, index) => {
    const other = right[index];
    return (
      other !== undefined &&
      link.title === other.title &&
      link.url === other.url
    );
  });
}
