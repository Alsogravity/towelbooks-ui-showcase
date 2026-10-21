import { useCallback } from 'react';

import { CapsuleActionGroup } from '../primitives';
import { useOpenSettingsAction } from '../../features/settings/useOpenSettingsAction';
import { useI18n } from '../../i18n';

import type { PointerEvent as ReactPointerEvent } from 'react';

export function ProfileMobileSettingsButton() {
  const { t } = useI18n();
  const openSettings = useOpenSettingsAction();

  const blurAfterTouch = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'touch') {
        return;
      }

      event.currentTarget.blur();
    },
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end px-4 pt-[max(env(safe-area-inset-top),0.5rem)] lg:hidden">
      <CapsuleActionGroup
        className="app-mobile-header__actions pointer-events-auto"
        primaryIconName="settings"
        searchButtonProps={{
          'aria-label': t('settings.layout.title'),
          onClick: openSettings,
          onPointerUp: blurAfterTouch,
        }}
      />
    </div>
  );
}
