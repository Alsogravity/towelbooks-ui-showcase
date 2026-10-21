import { useState } from 'react';

import { MobilePanelShell } from '../../components/overlay';
import { Card, Button } from '../../components/primitives';
import {
  CatalogWorkPicker,
  type CatalogWorkPickerResult,
} from '../catalog/CatalogWorkPicker';
import { useI18n } from '../../i18n';

type CollectionItemAddDialogProps = {
  addedWorkIds: ReadonlySet<string>;
  errorMessage?: string | null;
  getReturnFocusElement?: () => HTMLElement | null;
  isPending: boolean;
  onClose: () => void;
  onSelect: (result: CatalogWorkPickerResult) => void;
};

export function CollectionItemAddDialog({
  addedWorkIds,
  errorMessage,
  getReturnFocusElement,
  isPending,
  onClose,
  onSelect,
}: CollectionItemAddDialogProps) {
  const { t } = useI18n();
  const [pendingWorkId, setPendingWorkId] = useState<string | null>(null);

  return (
    <MobilePanelShell
      closeLabel={t('common.close')}
      getReturnFocusElement={getReturnFocusElement}
      onClose={onClose}
      onOpenAutoFocus={() => {
        const input = document.getElementById(
          'collection-catalog-search-input',
        );

        if (input instanceof HTMLInputElement) {
          input.focus();
        }
      }}
      panelClassName="max-w-2xl"
      title={t('collections.detail.addTitle')}
      titleId="collection-add-item-panel-title"
    >
      <div className="space-y-4">
        {errorMessage ? (
          <p className="app-text-supporting-copy text-brick" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <CatalogWorkPicker
          inputId="collection-catalog-search-input"
          noResultsContent={
            <Card className="border-dashed bg-paper-2/30 py-8 text-center">
              <p className="app-text-supporting-copy text-ink-3">
                {t('catalog.picker.noResults')}
              </p>
            </Card>
          }
          queryLabel={t('catalog.picker.queryLabel')}
          queryPlaceholder={t('catalog.picker.queryPlaceholder')}
          renderActions={(result: CatalogWorkPickerResult) => {
            const isAdded = addedWorkIds.has(result.catalogWorkId);

            return (
              <Button
                disabled={isPending || isAdded}
                isLoading={isPending && pendingWorkId === result.catalogWorkId}
                loadingLabel={t('collections.detail.adding')}
                onClick={() => {
                  setPendingWorkId(result.catalogWorkId);
                  onSelect(result);
                }}
                size="sm"
                type="button"
                variant="secondary"
              >
                {isAdded
                  ? t('collections.detail.added')
                  : t('collections.detail.add')}
              </Button>
            );
          }}
          searchAction={t('catalog.picker.search')}
          searchingAction={t('catalog.picker.searching')}
        />
      </div>
    </MobilePanelShell>
  );
}
