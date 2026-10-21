import type { Collection, PublicCollection } from '@towelbooks/schemas';
import { Link } from 'react-router';

import { Card, Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import {
  COLLECTION_ACCENT_CLASS_BY_KEY,
  CollectionPresentationIcon,
  getCollectionDescription,
  getCollectionName,
} from './collectionPresentation';

type CollectionSummaryRowProps = {
  collection: Collection | PublicCollection;
};

export function CollectionSummaryRow({
  collection,
}: CollectionSummaryRowProps) {
  const { formatNumber, t } = useI18n();
  const name = getCollectionName(collection, t);
  const description =
    collection.description ?? getCollectionDescription(collection, t);
  const accent = COLLECTION_ACCENT_CLASS_BY_KEY[collection.accentKey];
  const itemLabel =
    collection.itemCount === 0
      ? t('collections.itemCount.empty')
      : t('collections.itemCount', {
          values: {
            count: formatNumber(collection.itemCount),
            label:
              collection.itemCount === 1
                ? t('collections.itemCount.book', { fallback: 'book' })
                : t('collections.itemCount.books', { fallback: 'books' }),
          },
        });

  const renderSummaryContent = () => (
    <>
      <div
        className={`flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border ${accent.border} ${accent.surface} sm:size-20`}
      >
        {collection.coverUrl ? (
          <img
            alt={t('collections.detail.collectionCoverAlt')}
            className="h-full w-full object-cover"
            loading="lazy"
            src={collection.coverUrl}
          />
        ) : (
          <CollectionPresentationIcon
            accentKey={collection.accentKey}
            iconKey={collection.iconKey}
            size={30}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <h2 className="app-text-card-title m-0 min-w-0 line-clamp-2 text-ink">
            {name}
          </h2>
        </div>
        <p className="app-text-metadata mt-1 truncate text-ink-3">
          {itemLabel}
        </p>
        <p className="app-text-body mt-2 line-clamp-2 text-ink-2">
          {description ?? t('collections.noDescription')}
        </p>
      </div>
      <Icon
        aria-hidden="true"
        className="shrink-0 self-center text-ink-4"
        name="chevron-right"
        size={20}
      />
    </>
  );

  const cardClassName = `relative isolate flex min-w-0 items-start gap-4 overflow-hidden p-[18px] shadow-2 transition-all sm:gap-5 ${collection.systemKey ? accent.border : ''}`;

  return (
    <li>
      <Link
        aria-label={name}
        className="group block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
        to={`/collections/${collection.id}`}
      >
        <Card interactive variant="base" className={cardClassName}>
          {renderSummaryContent()}
        </Card>
      </Link>
    </li>
  );
}
