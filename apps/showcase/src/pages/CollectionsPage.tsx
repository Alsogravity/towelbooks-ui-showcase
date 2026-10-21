import { Link, useParams } from 'react-router';
import { Page } from '../components/Page';
import { BookCover, BookPreview } from '../entities/BookPreview';
import { collections, findBook } from '../demo/data';
import { useI18n } from '../i18n';
import { NotFoundPage } from './NotFoundPage';
export function CollectionsPage() {
  const { collectionId } = useParams();
  const { ui, locale } = useI18n();
  const selected = collections.find((value) => value.id === collectionId);
  if (collectionId && !selected) return <NotFoundPage />;
  return (
    <Page
      title={selected ? selected.title[locale] : ui('collections')}
      description={
        selected ? selected.description[locale] : ui('collectionBody')
      }
    >
      {selected ? (
        <div className="book-grid">
          {selected.bookIds.map((id) => {
            const book = findBook(id);
            return book && <BookPreview key={id} book={book} />;
          })}
        </div>
      ) : (
        <div className="collection-list">
          {collections.map((collection) => (
            <article key={collection.id} className="collection-row">
              <Link
                className="collection-covers"
                to={`/demo/collections/${collection.id}`}
                aria-label={collection.title[locale]}
              >
                {collection.bookIds.map((id) => {
                  const book = findBook(id);
                  return book && <BookCover key={id} book={book} compact />;
                })}
              </Link>
              <div>
                <h2 className="app-text-entity-title">
                  <Link to={`/demo/collections/${collection.id}`}>
                    {collection.title[locale]}
                  </Link>
                </h2>
                <p className="app-text-body-sm text-ink-3">
                  {collection.description[locale]}
                </p>
                <p className="app-text-metadata text-ink-3">
                  {collection.bookIds.length} {ui('inCollection')}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
