import { useEffect, useMemo, useState } from 'react';

import {
  canRenderInAppMessage,
  warnUnsupportedInAppMessage,
} from './inAppMessageCapabilities';
import { InAppMessageRenderer } from './InAppMessageRenderer';
import { usePendingInAppMessages } from './useInAppMessages';

/**
 * Mounts inside the authenticated app layout (after the user and legal gates)
 * and renders at most one pending in-app message as an overlay. It never blocks
 * app rendering: while messages load — or if the fetch fails — it renders
 * nothing, so the user is never trapped behind a failed overlay.
 *
 * All message display flows through this host; features must not render their
 * own message overlays.
 */
export function InAppMessageHost() {
  const { data } = usePendingInAppMessages();
  const [resolvedKeys, setResolvedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  useEffect(() => {
    for (const message of items) {
      if (!canRenderInAppMessage(message)) {
        warnUnsupportedInAppMessage(message);
      }
    }
  }, [items]);

  const activeMessage = items.find(
    (message) =>
      !resolvedKeys.has(message.key) && canRenderInAppMessage(message),
  );

  if (!activeMessage) {
    return null;
  }

  return (
    <InAppMessageRenderer
      key={activeMessage.key}
      message={activeMessage}
      onResolved={() =>
        setResolvedKeys((previous) => {
          const next = new Set(previous);
          next.add(activeMessage.key);
          return next;
        })
      }
    />
  );
}
