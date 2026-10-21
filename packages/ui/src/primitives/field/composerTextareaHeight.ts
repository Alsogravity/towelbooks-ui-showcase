export const COMPOSER_TEXTAREA_MAX_ROWS = 10;

const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'overlay', 'scroll']);

function isScrollableOverflow(value: string) {
  return SCROLLABLE_OVERFLOW_VALUES.has(value);
}

function getScrollableAncestors(element: HTMLElement) {
  const ancestors: HTMLElement[] = [];
  let parent = element.parentElement;

  while (parent) {
    const styles = getComputedStyle(parent);

    if (
      isScrollableOverflow(styles.overflow) ||
      isScrollableOverflow(styles.overflowX) ||
      isScrollableOverflow(styles.overflowY)
    ) {
      ancestors.push(parent);
    }

    parent = parent.parentElement;
  }

  return ancestors;
}

export function syncComposerTextareaHeight(
  element: HTMLTextAreaElement,
  minRows: number,
  maxRows: number = COMPOSER_TEXTAREA_MAX_ROWS,
) {
  const scrollPositions = getScrollableAncestors(element).map((ancestor) => ({
    ancestor,
    left: ancestor.scrollLeft,
    top: ancestor.scrollTop,
  }));
  const styles = getComputedStyle(element);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  const resolvedLineHeight = Number.isFinite(lineHeight) ? lineHeight : 20;
  const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
  const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
  const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
  const borderBottom = Number.parseFloat(styles.borderBottomWidth) || 0;
  const minHeight =
    resolvedLineHeight * minRows +
    paddingTop +
    paddingBottom +
    borderTop +
    borderBottom;
  const maxHeight =
    resolvedLineHeight * maxRows +
    paddingTop +
    paddingBottom +
    borderTop +
    borderBottom;

  element.style.height = '0px';
  const scrollHeight = element.scrollHeight;
  const nextHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

  element.style.height = `${nextHeight}px`;
  element.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';

  for (const { ancestor, left, top } of scrollPositions) {
    ancestor.scrollLeft = left;
    ancestor.scrollTop = top;
  }
}
