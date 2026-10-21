import type { LibraryItemOwnershipFormat } from '@towelbooks/schemas';
import { useState } from 'react';

import {
  Alert,
  Button,
  ButtonLink,
  Icon,
  PopoverPanel,
} from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';
import { toggleOwnershipFormat } from './catalogWorkDetailHelpers';

export function CatalogWorkDetailLibraryActions({
  isAddToLibraryPending,
  isInLibrary,
  isLibraryLookupError,
  isLibraryLookupLoading,
  libraryActionErrorMessage,
  libraryId,
  onAddToLibrary,
}: {
  isAddToLibraryPending: boolean;
  isInLibrary: boolean;
  isLibraryLookupError: boolean;
  isLibraryLookupLoading: boolean;
  libraryActionErrorMessage: string | null;
  libraryId: string | null;
  onAddToLibrary: (formats: LibraryItemOwnershipFormat[]) => void;
}) {
  const { t } = useI18n();
  const addToLibraryLabel = isInLibrary
    ? t('catalog.workDetail.actions.viewInLibrary')
    : t('catalog.workDetail.actions.addToLibrary');
  const viewLibraryHref = libraryId ? `/libraries/${libraryId}` : '/my-library';
  const addToLibraryOptions: Array<{
    format: LibraryItemOwnershipFormat;
    label: string;
  }> = [
    {
      format: 'physical',
      label: t('catalog.workDetail.libraryDialog.format.physical'),
    },
    {
      format: 'ebook',
      label: t('catalog.workDetail.libraryDialog.format.ebook'),
    },
    {
      format: 'audiobook',
      label: t('catalog.workDetail.libraryDialog.format.audiobook'),
    },
  ];
  const [selectedOwnershipFormats, setSelectedOwnershipFormats] = useState<
    LibraryItemOwnershipFormat[]
  >([]);
  const hasSelectedOwnershipFormats = selectedOwnershipFormats.length > 0;
  const [isLibraryPopoverOpen, setIsLibraryPopoverOpen] = useState(false);

  return (
    <div className="flex items-center">
      {isInLibrary ? (
        <ButtonLink
          className="text-forest"
          prependIcon="book-check"
          to={viewLibraryHref}
          variant="secondary"
        >
          {addToLibraryLabel}
        </ButtonLink>
      ) : (
        <PopoverPanel
          open={isLibraryPopoverOpen}
          activator={({ activatorProps, ref }) => (
            <Button
              {...activatorProps}
              ref={ref}
              aria-pressed={false}
              disabled={isLibraryLookupLoading || isLibraryLookupError}
              isLoading={isAddToLibraryPending}
              prependIcon="plus"
              type="button"
              variant="primary"
            >
              {addToLibraryLabel}
            </Button>
          )}
          bodyClassName="pb-1"
          contentProps={{
            'aria-label': t('catalog.workDetail.actions.addToLibrary'),
          }}
          disabled={isLibraryLookupLoading || isLibraryLookupError}
          footer={
            <Button
              className="w-full"
              disabled={!hasSelectedOwnershipFormats || isAddToLibraryPending}
              isLoading={isAddToLibraryPending}
              type="button"
              onClick={() => {
                void onAddToLibrary(selectedOwnershipFormats);
              }}
            >
              {isAddToLibraryPending
                ? t('catalog.workDetail.libraryDialog.submitting')
                : t('catalog.workDetail.libraryDialog.confirm')}
            </Button>
          }
          onOpenChange={(open) => {
            setIsLibraryPopoverOpen(open);
            if (open) {
              setSelectedOwnershipFormats([]);
            }
          }}
          placement="bottom-start"
          focusOnOpen="first"
          size="sm"
        >
          <div className="px-1 pt-3">
            <fieldset className="grid gap-2.5">
              <legend className="sr-only">
                {t('catalog.workDetail.libraryDialog.formatLabel')}
              </legend>
              {addToLibraryOptions.map((option) => {
                const isChecked = selectedOwnershipFormats.includes(
                  option.format,
                );

                return (
                  <label key={option.format} className="block cursor-pointer">
                    <input
                      checked={isChecked}
                      className="peer sr-only"
                      disabled={isAddToLibraryPending}
                      type="checkbox"
                      onChange={() => {
                        setSelectedOwnershipFormats((currentFormats) =>
                          toggleOwnershipFormat(currentFormats, option.format),
                        );
                      }}
                    />
                    <div
                      className={[
                        'flex items-center justify-between gap-4 rounded-2xl border border-rule bg-paper-2/60 px-4 py-3.5 transition-colors',
                        'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brick',
                        'peer-checked:border-brick peer-checked:bg-brick-soft/25 peer-checked:shadow-2',
                        'peer-disabled:opacity-60',
                      ].join(' ')}
                    >
                      <span className="flex-1 text-sm text-ink">
                        {option.label}
                      </span>
                      <Icon
                        aria-hidden="true"
                        className={
                          isChecked ? 'text-brick opacity-100' : 'opacity-0'
                        }
                        name="check"
                        size={16}
                      />
                    </div>
                  </label>
                );
              })}
            </fieldset>
            {libraryActionErrorMessage ? (
              <div className="pt-2">
                <Alert variant="error">{libraryActionErrorMessage}</Alert>
              </div>
            ) : null}
          </div>
        </PopoverPanel>
      )}
    </div>
  );
}
