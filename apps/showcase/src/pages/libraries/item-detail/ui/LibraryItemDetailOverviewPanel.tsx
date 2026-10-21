import {
  formatCatalogLanguageLabel,
  type LibraryItemDetail,
  type LibraryItemDetailEdition,
} from '@towelbooks/schemas';
import { useState } from 'react';

import { Button, Card } from '../../../../components/primitives';
import { useI18n } from '../../../../i18n';
import { LibrarySection } from '../../ui/LibrarySection';
import { LibraryItemOwnershipSection } from '../../ui/LibraryItemOwnershipSection';
import { LibraryItemPersonalNoteEditor } from './LibraryItemPersonalNoteEditor';
import { formatPublicationCalendarDate } from '../../../../lib/datetime';

interface LibraryItemDetailOverviewPanelProps {
  canManage: boolean;
  item: LibraryItemDetail;
  isSavingNote: boolean;
  libraryId: string;
  note: string;
  onSaveNote: (note: string) => Promise<unknown>;
}

export function LibraryItemDetailOverviewPanel({
  canManage,
  item,
  isSavingNote,
  libraryId,
  note,
  onSaveNote,
}: LibraryItemDetailOverviewPanelProps) {
  const { formatNumber, locale, t } = useI18n();
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const representativeEdition = findRepresentativeEdition(item);
  const detailFields = [
    representativeEdition?.publisher
      ? {
          label: t('myLibrary.items.details.publisher'),
          value: representativeEdition.publisher,
        }
      : null,
    representativeEdition?.publishedDate
      ? {
          label: t('myLibrary.items.details.published'),
          value: formatPublicationCalendarDate(
            representativeEdition.publishedDate,
            locale,
          ),
        }
      : null,
    representativeEdition?.language
      ? {
          label: t('myLibrary.items.details.language'),
          value: formatCatalogLanguageLabel(
            representativeEdition.language,
            locale,
          ),
        }
      : null,
    representativeEdition?.pageCount !== null &&
    representativeEdition?.pageCount !== undefined
      ? {
          label: t('myLibrary.items.details.pages'),
          value: formatNumber(representativeEdition.pageCount),
        }
      : null,
    representativeEdition?.isbn13
      ? {
          label: t('myLibrary.items.details.isbn13'),
          value: representativeEdition.isbn13,
        }
      : null,
    representativeEdition?.isbn10
      ? {
          label: t('myLibrary.items.details.isbn10'),
          value: representativeEdition.isbn10,
        }
      : null,
    representativeEdition?.asin
      ? {
          label: t('myLibrary.items.details.asin'),
          value: representativeEdition.asin,
        }
      : null,
    representativeEdition?.editionNumber
      ? {
          label: t('myLibrary.items.details.edition'),
          value: representativeEdition.editionNumber,
        }
      : null,
    representativeEdition?.volume
      ? {
          label: t('myLibrary.items.details.volume'),
          value: representativeEdition.volume,
        }
      : null,
    representativeEdition?.seriesOrCollection
      ? {
          label: t('myLibrary.items.details.series'),
          value: representativeEdition.seriesOrCollection,
        }
      : null,
  ].filter(
    (field): field is { label: string; value: string | null } =>
      field !== null && field.value !== null,
  );

  return (
    <div className="space-y-10">
      <LibrarySection
        icon="book-open"
        title={t('myLibrary.items.readerDetails.title')}
      >
        <div className="space-y-6">
          {item.work.display.synopsis ? (
            <p className="app-text-body whitespace-pre-wrap break-words text-ink">
              {item.work.display.synopsis}
            </p>
          ) : null}

          {item.work.contributors.length > 0 ? (
            <dl className="space-y-1">
              <dt className="app-text-label text-ink-3">
                {t('myLibrary.items.details.contributors')}
              </dt>
              <dd className="app-text-body break-words text-ink">
                {item.work.contributors.join(', ')}
              </dd>
            </dl>
          ) : null}

          {item.work.categories.length > 0 ? (
            <div className="space-y-2">
              <h3 className="app-text-label text-ink-3">
                {t('myLibrary.items.details.categories')}
              </h3>
              <ul className="flex min-w-0 flex-wrap gap-2">
                {item.work.categories.map((category) => (
                  <li
                    className="max-w-full break-words rounded-full border border-rule/50 bg-paper-2 px-2.5 py-1 app-text-caption text-ink-2"
                    key={category.slug}
                  >
                    {category.displayName}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detailFields.length > 0 ? (
            <dl
              className={[
                'grid min-w-0 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2',
                canManage ? '' : 'hidden sm:grid',
              ].join(' ')}
            >
              {detailFields.map((field) => (
                <div className="min-w-0 space-y-1" key={field.label}>
                  <dt className="app-text-label text-ink-3">{field.label}</dt>
                  <dd className="app-text-body break-words text-ink">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {!canManage && detailFields.length > 0 ? (
            <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 border-t border-rule/30 pt-4 sm:hidden">
              {detailFields.slice(0, 3).map((field) => (
                <span
                  className="min-w-0 break-words app-text-caption text-ink-2"
                  key={`mobile-${field.label}`}
                >
                  <span className="text-ink-3">{field.label}: </span>
                  {field.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </LibrarySection>

      {canManage ? (
        <LibrarySection
          icon="notepad-text"
          title={t('myLibrary.items.detailsSection')}
        >
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="app-text-card-title text-ink">
                {t('myLibrary.items.personalNote.label')}
              </h3>
              <Button
                aria-label={t('myLibrary.items.personalNote.edit')}
                icon="pencil-line"
                iconSize={20}
                size="sm"
                variant="ghost"
                onClick={() => setIsNoteEditorOpen(true)}
              />
            </div>
            <p
              className={[
                'app-text-body whitespace-pre-wrap break-words',
                note.trim() ? 'text-ink' : 'text-ink-3',
              ].join(' ')}
            >
              {note.trim() || t('myLibrary.items.personalNote.empty')}
            </p>
          </Card>
        </LibrarySection>
      ) : null}

      {canManage && isNoteEditorOpen ? (
        <LibraryItemPersonalNoteEditor
          initialNote={note}
          isSaving={isSavingNote}
          onClose={() => setIsNoteEditorOpen(false)}
          onSubmit={onSaveNote}
        />
      ) : null}

      {canManage && item.work.kind === 'book' ? (
        <LibraryItemOwnershipSection item={item} libraryId={libraryId} />
      ) : null}
    </div>
  );
}

function findRepresentativeEdition(
  item: LibraryItemDetail,
): LibraryItemDetailEdition | null {
  const selectedId = item.work.display.catalogEditionId;
  return (
    item.work.catalogEditions.find((edition) => edition.id === selectedId) ??
    item.work.catalogEditions[0] ??
    null
  );
}
