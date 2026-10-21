import { useLayoutEffect, useState, type RefObject } from 'react';

export function useHostElement(hostRef: RefObject<HTMLElement | null>) {
  const [hostElement, setHostElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    let frame: number | undefined;

    const syncHostElement = () => {
      const next = hostRef.current;
      setHostElement((current) => (current === next ? current : next));
    };

    syncHostElement();
    queueMicrotask(syncHostElement);

    if (!hostRef.current) {
      frame = requestAnimationFrame(syncHostElement);
    }

    return () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
      }
    };
  }, [hostRef]);

  return hostElement;
}
