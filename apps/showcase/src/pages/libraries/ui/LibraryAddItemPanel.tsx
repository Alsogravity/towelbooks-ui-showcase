import { MobilePanelShell } from '../../../components/overlay';
import { useI18n } from '../../../i18n';

import type { ReactNode } from 'react';

type LibraryAddItemPanelProps = {
  title: string;
  onClose: () => void;
  getReturnFocusElement: () => HTMLElement | null;
  children: ReactNode;
};

export function LibraryAddItemPanel({
  title,
  onClose,
  getReturnFocusElement,
  children,
}: LibraryAddItemPanelProps) {
  const { t } = useI18n();

  return (
    <MobilePanelShell
      closeLabel={t('common.close')}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      onOpenAutoFocus={() => {
        const input =
          document.getElementById('catalog-contribution-identifier') ??
          document.getElementById('catalog-search-input');

        if (input instanceof HTMLInputElement) {
          input.focus();
        }
      }}
      panelClassName="max-w-2xl"
      title={title}
      titleId="add-item-panel-title"
    >
      {children}
    </MobilePanelShell>
  );
}
