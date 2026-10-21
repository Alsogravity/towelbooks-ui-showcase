const SCROLL_LOCK_OVERFLOW = new Set(['auto', 'overlay', 'scroll']);

function hasScrollableOverflow(element: HTMLElement) {
  const { overflow, overflowX, overflowY } = getComputedStyle(element);

  return [overflow, overflowX, overflowY].some((value) =>
    SCROLL_LOCK_OVERFLOW.has(value),
  );
}

export function getScrollParents(element: HTMLElement | null): HTMLElement[] {
  const parents: HTMLElement[] = [];
  let parent = element?.parentElement ?? null;

  while (parent) {
    if (hasScrollableOverflow(parent)) {
      parents.push(parent);
    }

    parent = parent.parentElement;
  }

  return parents;
}

export function lockScrollParents(element: HTMLElement | null) {
  const scrollParents = getScrollParents(element);
  const previousOverflow = scrollParents.map(
    (scrollParent) => scrollParent.style.overflow,
  );

  for (const scrollParent of scrollParents) {
    scrollParent.style.overflow = 'hidden';
  }

  return () => {
    scrollParents.forEach((scrollParent, index) => {
      scrollParent.style.overflow = previousOverflow[index] ?? '';
    });
  };
}
