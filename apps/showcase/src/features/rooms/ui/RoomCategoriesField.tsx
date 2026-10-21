import {
  ROOM_CATEGORIES_MAX_COUNT,
  type CatalogTaxonomyCategoryOption,
} from '@towelbooks/schemas';

import { FilterSelectableOption } from '../../../components/filters';
import { Button } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

export type RoomCategoriesFieldProps = {
  categoryOptions: CatalogTaxonomyCategoryOption[];
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  onChange: (categoryIds: string[]) => void;
  onRetry: () => void;
  selectedCategoryIds: string[];
};

export function RoomCategoriesField({
  categoryOptions,
  errorMessage,
  isError,
  isLoading,
  onChange,
  onRetry,
  selectedCategoryIds,
}: RoomCategoriesFieldProps) {
  const { t } = useI18n();
  const hasReachedLimit =
    selectedCategoryIds.length >= ROOM_CATEGORIES_MAX_COUNT;

  const toggleCategory = (categoryId: string) => {
    onChange(
      selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId],
    );
  };

  return (
    <fieldset className="space-y-2">
      <legend className="app-text-label flex items-center justify-between gap-3 text-ink">
        <span>{t('rooms.settings.labels.categories')}</span>
        <span className="app-text-caption shrink-0 text-ink-3">
          {selectedCategoryIds.length}/{ROOM_CATEGORIES_MAX_COUNT}
        </span>
      </legend>

      {isLoading ? (
        <p className="app-text-metadata m-0 text-ink-3" role="status">
          {t('rooms.settings.categories.loading')}
        </p>
      ) : null}

      {isError ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="app-text-metadata m-0 text-red-600" role="alert">
            {t('rooms.settings.categories.error')}
          </p>
          <Button onClick={onRetry} size="sm" type="button" variant="ghost">
            {t('rooms.settings.categories.retry')}
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && categoryOptions.length === 0 ? (
        <p className="app-text-metadata m-0 text-ink-3">
          {t('rooms.settings.categories.empty')}
        </p>
      ) : null}

      {categoryOptions.length > 0 ? (
        <div
          aria-label={t('rooms.settings.labels.categories')}
          className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border border-rule/60 p-3 dark:border-night-fg/30"
          role="group"
        >
          {categoryOptions.map((option) => {
            const isSelected = selectedCategoryIds.includes(option.id);

            return (
              <FilterSelectableOption
                appearance="removable-chip"
                disabled={isLoading || (!isSelected && hasReachedLimit)}
                isSelected={isSelected}
                key={option.id}
                label={option.displayName}
                onToggle={() => toggleCategory(option.id)}
              />
            );
          })}
        </div>
      ) : null}

      {errorMessage ? (
        <p className="app-text-metadata m-0 text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </fieldset>
  );
}
