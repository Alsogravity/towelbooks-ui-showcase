import type { PendingInAppMessage } from '@towelbooks/schemas';

import { getPendingInAppMessageCapability } from './inAppMessageCapabilities';
import { OnboardingMessageRenderer } from './OnboardingMessageRenderer';

export type InAppMessageRendererProps = {
  message: PendingInAppMessage;
  onResolved: () => void;
};

/**
 * Selects a renderer by the centralized type:surface capability. Only the
 * onboarding orientation fullscreen renderer ships today; any other capability renders
 * nothing rather than guessing — new renderers register here as they are built.
 */
export function InAppMessageRenderer({
  message,
  onResolved,
}: InAppMessageRendererProps) {
  const capability = getPendingInAppMessageCapability(message);

  // The capability selects the renderer; the discriminant (`message.type`)
  // narrows the payload to the concrete shape that renderer expects. The two
  // always agree because the capability is derived from the message type.
  if (
    capability === 'orientation:fullscreen' &&
    message.type === 'orientation'
  ) {
    return (
      <OnboardingMessageRenderer
        messageKey={message.key}
        onResolved={onResolved}
        payload={message.payload}
      />
    );
  }

  return null;
}
