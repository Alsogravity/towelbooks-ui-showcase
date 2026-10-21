import { Link } from 'react-router';
import { TypographicCatalogWorkCover } from './reading/ui/TypographicCatalogWorkCover';
import { useI18n } from '../i18n';
import type { Book } from '../demo/data';
export function BookCover({
  book,
  compact = false,
}: {
  book: Book;
  compact?: boolean;
}) {
  return (
    <TypographicCatalogWorkCover
      title={book.title}
      author={book.author}
      theme={book.theme}
      size="fluid"
      className={compact ? 'w-full max-w-20' : 'w-full'}
    />
  );
}
export function BookPreview({ book, page }: { book: Book; page?: number }) {
  const { ui } = useI18n();
  const href =
    page === undefined
      ? `/demo/catalog/${book.id}`
      : `/demo/library/${book.id}`;
  return (
    <article className="book-preview">
      <Link to={href} className="book-cover-link" aria-label={book.title}>
        <BookCover book={book} />
      </Link>
      <h3 className="app-text-row-title">
        <Link to={href}>{book.title}</Link>
      </h3>
      <p className="app-text-metadata text-ink-3">{book.author}</p>
      {page !== undefined && (
        <div className="reading-progress">
          <label className="app-text-caption" htmlFor={`progress-${book.id}`}>
            {ui('progress')}{' '}
            <span>{Math.round((page / book.pages) * 100)}%</span>
          </label>
          <progress id={`progress-${book.id}`} max={book.pages} value={page} />
        </div>
      )}
    </article>
  );
}
