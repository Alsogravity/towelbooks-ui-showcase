import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '@towelbooks/ui';
import { Page, Section } from '../components/Page';
import { BookCover } from '../entities/BookPreview';
import { findBook } from '../demo/data';
import { useDemo } from '../demo/DemoContext';
import { useI18n } from '../i18n';
import { ReadingEditor } from '../features/ReadingEditor';
import { NotFoundPage } from './NotFoundPage';
export function BookDetailPage() {
  const { bookId } = useParams();
  const book = findBook(bookId);
  const { ui, locale } = useI18n();
  const { library, setLibrary } = useDemo();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<'about' | 'notes' | 'sessions'>('about');
  if (!book) return <NotFoundPage />;
  const item = library.find((item) => item.bookId === book.id);
  return (
    <Page
      title={book.title}
      description={book.author}
      action={<Link to="/demo/catalog">← {ui('catalog')}</Link>}
    >
      <div className="book-detail">
        <aside className="book-detail-cover">
          <BookCover book={book} />
          {item ? (
            <>
              <p className="app-text-metadata text-ink-3">{ui('added')}</p>
              <Button onClick={() => setEditing(true)}>{ui('edit')}</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setLibrary((items) =>
                    items.filter((value) => value.bookId !== book.id),
                  )
                }
              >
                {ui('remove')}
              </Button>
            </>
          ) : (
            <Button
              onClick={() =>
                setLibrary((items) => [
                  ...items,
                  { bookId: book.id, page: 0, note: '' },
                ])
              }
            >
              {ui('add')}
            </Button>
          )}
        </aside>
        <div className="min-w-0">
          <nav className="detail-tabs" aria-label={ui('details')}>
            {(['about', 'notes', 'sessions'] as const).map((key) => (
              <Button
                variant={tab === key ? 'primary' : 'ghost'}
                size="sm"
                key={key}
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
              >
                {ui(key)}
              </Button>
            ))}
          </nav>
          {tab === 'about' ? (
            <>
              <Section title={ui('about')}>
                <p className="synopsis">{book.synopsis[locale]}</p>
              </Section>
              <Section title={ui('details')}>
                <dl className="detail-list">
                  <div>
                    <dt>{ui('totalPages')}</dt>
                    <dd>{book.pages}</dd>
                  </div>
                  <div>
                    <dt>{ui('language')}</dt>
                    <dd>Português</dd>
                  </div>
                  <div>
                    <dt>{ui('edition')}</dt>
                    <dd>{book.year}</dd>
                  </div>
                </dl>
              </Section>
            </>
          ) : tab === 'notes' ? (
            <Section title={ui('notes')}>
              <p className="synopsis">{item?.note || ui('emptyBody')}</p>
              {item && (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  {ui('edit')}
                </Button>
              )}
            </Section>
          ) : (
            <Section title={ui('sessions')}>
              {item && item.page > 0 ? (
                <div className="session-row">
                  <span>
                    {ui('page')} {item.page} / {book.pages}
                  </span>
                  <strong>{Math.round((item.page / book.pages) * 100)}%</strong>
                </div>
              ) : (
                <p>{ui('emptyBody')}</p>
              )}
            </Section>
          )}
          {item && (
            <Section title={ui('progress')}>
              <progress
                className="detail-progress"
                max={book.pages}
                value={item.page}
                aria-label={ui('progress')}
              />
              <p className="app-text-metadata text-ink-3">
                {item.page} / {book.pages} ·{' '}
                {Math.round((item.page / book.pages) * 100)}%
              </p>
            </Section>
          )}
        </div>
      </div>
      {editing && item && (
        <ReadingEditor
          book={book}
          item={item}
          onClose={() => setEditing(false)}
        />
      )}
    </Page>
  );
}
