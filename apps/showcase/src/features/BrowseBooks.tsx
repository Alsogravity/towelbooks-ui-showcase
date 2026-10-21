import { useState } from 'react';
import { Button, Icon, Input } from '@towelbooks/ui';
import { BookPreview } from '../entities/BookPreview';
import { filterBooks, type Book } from '../demo/data';
import { useI18n } from '../i18n';
export function BrowseBooks({
  books,
  pages,
}: {
  books: Book[];
  pages?: Record<string, number>;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const { ui } = useI18n();
  const result = filterBooks(books, query, category);
  return (
    <>
      <div className="browse-toolbar">
        <label className="search-field">
          <Icon name="search" size={19} />
          <Input
            aria-label={ui('search')}
            placeholder={ui('search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="filter-list" role="group" aria-label={ui('catalog')}>
          {(['all', 'fiction', 'essays', 'poetry'] as const).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={category === key ? 'primary' : 'ghost'}
              aria-pressed={category === key}
              onClick={() => setCategory(key)}
            >
              {ui(key)}
            </Button>
          ))}
        </div>
      </div>
      {result.length ? (
        <div className="book-grid">
          {result.map((book) => (
            <BookPreview key={book.id} book={book} page={pages?.[book.id]} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="book-open" size={36} />
          <p>{ui('searchEmpty')}</p>
          <Button
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            variant="secondary"
          >
            {ui('clear')}
          </Button>
        </div>
      )}
    </>
  );
}
