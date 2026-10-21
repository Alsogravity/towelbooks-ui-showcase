import type { ReactNode } from 'react';

const collapsibleHeaderSlotClassName = [
  'inline-flex shrink-0 items-center justify-center overflow-visible',
  'transition-[width,opacity,transform] duration-300',
  'ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
].join(' ');

const collapsibleHeaderSlotCollapsedClassName =
  'h-0 w-0 -translate-x-2 opacity-0';

/** Canonical header slot footprint (2.5rem). */
const collapsibleHeaderSlotVisibleClassName =
  'h-10 w-10 translate-x-0 opacity-100';

export type CollapsibleHeaderSlotProps = {
  children?: ReactNode;
  className?: string;
  visible: boolean;
};

/**
 * Reserves header space with CSS transitions so adjacent title/actions do not
 * reflow when a control appears or disappears. Children mount only while
 * visible so hidden controls stay out of the tab order.
 */
export function CollapsibleHeaderSlot({
  children,
  className,
  visible,
}: CollapsibleHeaderSlotProps) {
  return (
    <span
      aria-hidden={visible ? undefined : true}
      className={[
        collapsibleHeaderSlotClassName,
        visible
          ? collapsibleHeaderSlotVisibleClassName
          : collapsibleHeaderSlotCollapsedClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-collapsible-header-slot=""
      data-visible={visible ? 'true' : 'false'}
    >
      {visible ? children : null}
    </span>
  );
}
