import type { CollectionItem, PublicCollectionItem } from '@towelbooks/schemas';

import { Button } from '../../components/primitives';
import { CatalogWorkCandidateRow } from '../../entities/reading/ui';
import { useI18n } from '../../i18n';

type CollectionItemRowProps = {
  isOwner: boolean;
  isWishlist: boolean;
  item: CollectionItem | PublicCollectionItem;
  onEdit?: (item: CollectionItem, trigger: HTMLButtonElement) => void;
  onRemove?: (
    item: CollectionItem | PublicCollectionItem,
    trigger: HTMLButtonElement,
  ) => void;
};

function isOwnerItem(
  item: CollectionItem | PublicCollectionItem,
): item is CollectionItem {
  return 'note' in item;
}

export function CollectionItemRow({
  isOwner,
  isWishlist,
  item,
  onEdit,
  onRemove,
}: CollectionItemRowProps) {
  const { t } = useI18n();
  const author =
    item.work.contributors.join(', ') ||
    t('collections.detail.unknownContributor');
  const ownerItem = isOwnerItem(item);
  const editionLabel = item.catalogEdition
    ? t('collections.detail.edition', {
        values: { title: item.catalogEdition.title },
      })
    : t('collections.detail.noEdition');

  const itemActions =
    isOwner && ownerItem ? (
      <div className="flex flex-wrap justify-end gap-2">
        {isWishlist && onEdit ? (
          <Button
            onClick={(event) => onEdit(item, event.currentTarget)}
            prependIcon="pencil-line"
            size="sm"
            type="button"
            variant="secondary"
          >
            {t('collections.action.editItem')}
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            onClick={(event) => onRemove(item, event.currentTarget)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {t('collections.action.removeItem')}
          </Button>
        ) : null}
      </div>
    ) : null;

  const itemMetadata =
    isWishlist && ownerItem ? (
      <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 text-right">
        <span>
          {t('collections.detail.priority', {
            values: {
              priority: t(
                `collections.detail.priority.${item.priority ?? 'medium'}`,
              ),
            },
          })}
        </span>
        <span>{editionLabel}</span>
        {item.note ? (
          <span>
            {t('collections.detail.note', { values: { note: item.note } })}
          </span>
        ) : null}
      </div>
    ) : null;

  return (
    <CatalogWorkCandidateRow
      actions={itemActions}
      author={author}
      bottomRight={itemMetadata}
      coverAuthor={item.work.contributors[0] ?? ''}
      coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
      coverGeometry={item.work.display.coverGeometry}
      coverThumbnailUrl={item.work.display.coverThumbnailUrl}
      coverUrl={item.work.display.coverUrl}
      href={`/catalog/${item.catalogWorkId}`}
      themeSeed={item.catalogWorkId}
      title={item.work.display.title}
    />
  );
}
