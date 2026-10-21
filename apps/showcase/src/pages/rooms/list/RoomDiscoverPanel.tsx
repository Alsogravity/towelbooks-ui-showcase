import { MobilePanelShell } from '../../../components/overlay';
import { useI18n } from '../../../i18n';

import type { ReactNode } from 'react';

type RoomDiscoverPanelProps = {
  title: string;
  onClose: () => void;
  getReturnFocusElement: () => HTMLElement | null;
  children: ReactNode;
};

export function RoomDiscoverPanel({
  title,
  onClose,
  getReturnFocusElement,
  children,
}: RoomDiscoverPanelProps) {
  const { t } = useI18n();

  return (
    <MobilePanelShell
      closeLabel={t('rooms.list.search.clearLabel')}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      onOpenAutoFocus={() => {
        const input = document.getElementById('rooms-discover-search-input');

        if (input instanceof HTMLInputElement) {
          input.focus();
        }
      }}
      panelClassName="max-w-2xl"
      title={title}
      titleId="rooms-discover-panel-title"
    >
      {children}
    </MobilePanelShell>
  );
}
