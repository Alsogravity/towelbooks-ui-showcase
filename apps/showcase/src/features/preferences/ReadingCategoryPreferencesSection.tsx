import {
  READING_CATEGORY_PREFERENCE_COUNT,
  type CatalogTaxonomyCategoryOption,
} from '@towelbooks/schemas';
import { AppSubsection } from '../../components/application';
import { ErrorState, LoadingState } from '../../components/feedback';
import { FilterSelectableOption } from '../../components/filters';
import { Alert, Button } from '../../components/primitives';
import { useI18n } from '../../i18n';

export interface ReadingCategoryPreferencesSectionProps {
  categories: CatalogTaxonomyCategoryOption[];
  hasLoadError: boolean;
  isLoading: boolean;
  isSaving: boolean;
  saveFailed: boolean;
  selectedCategoryIds: readonly string[];
  onRetry: () => void;
  onToggleCategory: (categoryId: string) => void;
}

export function ReadingCategoryPreferencesSection({
  categories,
  hasLoadError,
  isLoading,
  isSaving,
  saveFailed,
  selectedCategoryIds,
  onRetry,
  onToggleCategory,
}: ReadingCategoryPreferencesSectionProps) {
  const { t } = useI18n();

  return (
    <AppSubsection
      title={t('settings.preferences.readingCategories.title')}
      titleAccessory={
        <span
          className="app-text-metadata text-ink-2"
          role="status"
          aria-live="polite"
        >
          {selectedCategoryIds.length}/{READING_CATEGORY_PREFERENCE_COUNT}
        </span>
      }
    >
      <div className="space-y-5">
        {isLoading ? (
          <LoadingState
            label={{
              key: 'settings.preferences.readingCategories.loading',
            }}
          />
        ) : hasLoadError ? (
          <ErrorState
            title={{
              key: 'settings.preferences.readingCategories.error.loadTitle',
            }}
            body={{
              key: 'settings.preferences.readingCategories.error.loadBody',
            }}
            action={
              <Button variant="secondary" onClick={onRetry}>
                {t('errors.action.retry')}
              </Button>
            }
          />
        ) : categories.length === 0 ? (
          <Alert variant="info">
            <p className="app-text-body text-ink">
              {t('settings.preferences.readingCategories.empty.title')}
            </p>
            <p className="app-text-supporting-copy mt-1 text-ink-2">
              {t('settings.preferences.readingCategories.empty.body')}
            </p>
          </Alert>
        ) : (
          <>
            <ul
              aria-label={t('settings.preferences.readingCategories.options')}
              className="m-0 flex max-h-48 list-none flex-wrap gap-2 overflow-y-auto rounded-md border border-rule/60 p-3 dark:border-night-fg/30"
              role="list"
            >
              {categories.map((category) => (
                <li key={category.id}>
                  <CategoryOption
                    category={category}
                    isSelected={selectedCategoryIds.includes(category.id)}
                    isSaving={isSaving}
                    onToggle={() => onToggleCategory(category.id)}
                    selectionIsFull={
                      selectedCategoryIds.length >=
                      READING_CATEGORY_PREFERENCE_COUNT
                    }
                  />
                </li>
              ))}
            </ul>

            {saveFailed ? (
              <Alert variant="error">
                {t('settings.preferences.readingCategories.error.save')}
              </Alert>
            ) : null}
          </>
        )}
      </div>
    </AppSubsection>
  );
}

function CategoryOption({
  category,
  isSelected,
  isSaving,
  onToggle,
  selectionIsFull,
}: {
  category: CatalogTaxonomyCategoryOption;
  isSelected: boolean;
  isSaving: boolean;
  onToggle: () => void;
  selectionIsFull: boolean;
}) {
  return (
    <FilterSelectableOption
      appearance="removable-chip"
      disabled={isSaving || (!isSelected && selectionIsFull)}
      isSelected={isSelected}
      label={category.displayName}
      onToggle={onToggle}
    />
  );
}
