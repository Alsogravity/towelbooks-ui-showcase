import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

/**
 * A primitive that renders its children into a DOM node that exists outside
 * of the DOM hierarchy of the parent component.
 */
export function Portal({ children, container }: PortalProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  const target = container ?? document.body;
  return createPortal(children, target);
}
