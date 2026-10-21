import { Card } from '../../../components/primitives';
import { CatalogLibraryCandidateAction } from './CatalogLibraryCandidateAction';
import {
  CatalogWorkPicker,
  type CatalogWorkPickerResult,
} from '../../../features/catalog/CatalogWorkPicker';
import { useI18n } from '../../../i18n';

type LibrarySearchSectionProps = {
  initialQuery?: string;
  libraryId: string;
  onAddCatalogWork?: (query: string) => void;
};

export function LibrarySearchSection({
  initialQuery,
  libraryId,
  onAddCatalogWork,
}: LibrarySearchSectionProps) {
  const { t } = useI18n();

  return (
    <CatalogWorkPicker
      initialQuery={initialQuery}
      inputId="catalog-search-input"
      kind="book"
      noResultsContent={
        <Card className="border-dashed bg-paper-2/30 py-8 text-center">
          <p className="supporting-copy text-ink-3">
            {t('myLibrary.search.noResultsBody')}
          </p>
        </Card>
      }
      onAddCatalogWork={onAddCatalogWork}
      queryLabel={t('myLibrary.search.queryLabel')}
      queryPlaceholder={t('myLibrary.search.queryPlaceholder')}
      renderActions={(result: CatalogWorkPickerResult) => (
        <CatalogLibraryCandidateAction {...result} libraryId={libraryId} />
      )}
      searchAction={t('myLibrary.search.submit')}
      searchingAction={t('myLibrary.search.submitting')}
    />
  );
}
