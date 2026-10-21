import {
  getInAppMessageCapability,
  type InAppMessageClientCapability,
  type PendingInAppMessage,
} from '@towelbooks/schemas';

/**
 * The web client currently renders fullscreen orientation onboarding messages.
 * Keep this list as the single source of truth for the SDK capability query and
 * local host-side filtering; add new pairs only with a renderer and tests.
 */
export const SUPPORTED_WEB_IN_APP_MESSAGE_CAPABILITIES = [
  'orientation:fullscreen',
] as const satisfies readonly InAppMessageClientCapability[];

const SUPPORTED_WEB_IN_APP_MESSAGE_CAPABILITY_SET =
  new Set<InAppMessageClientCapability>(
    SUPPORTED_WEB_IN_APP_MESSAGE_CAPABILITIES,
  );

export function getPendingInAppMessageCapability(
  message: PendingInAppMessage,
): InAppMessageClientCapability {
  return getInAppMessageCapability(message);
}

export function canRenderInAppMessage(message: PendingInAppMessage): boolean {
  return SUPPORTED_WEB_IN_APP_MESSAGE_CAPABILITY_SET.has(
    getPendingInAppMessageCapability(message),
  );
}

export function warnUnsupportedInAppMessage(
  message: PendingInAppMessage,
): void {
  console.warn('Unsupported in-app message skipped by web client.', {
    capability: getPendingInAppMessageCapability(message),
    key: message.key,
    surface: message.surface,
    type: message.type,
  });
}
