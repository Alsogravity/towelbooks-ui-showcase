import { Link } from 'react-router';
import { Page, Section } from '../components/Page';
import { BookPreview } from '../entities/BookPreview';
import { books, rooms, findBook } from '../demo/data';
import { useDemo } from '../demo/DemoContext';
import { useI18n } from '../i18n';
import { RoomPreview } from '../entities/RoomPreview';
export function DashboardPage() {
  const { ui } = useI18n();
  const { library, memberships } = useDemo();
  const active = library.filter(
    (item) => item.page > 0 && item.page < (findBook(item.bookId)?.pages ?? 0),
  );
  return (
    <Page title={ui('greeting')} description={ui('greetingBody')}>
      <Section
        title={ui('continue')}
        action={
          <Link to="/demo/library" aria-label={ui('library')}>
            <span className="hidden sm:inline">{ui('library')} </span>→
          </Link>
        }
      >
        <div className="continue-grid">
          {active.map((item) => {
            const book = findBook(item.bookId);
            return book ? (
              <BookPreview key={book.id} book={book} page={item.page} />
            ) : null;
          })}
        </div>
      </Section>
      <Section title={ui('week')}>
        <dl className="insights">
          {[
            [
              String(library.reduce((sum, item) => sum + item.page, 0)),
              ui('pages'),
            ],
            ['240', ui('minutes')],
            [
              String(
                library.filter(
                  (item) => item.page === findBook(item.bookId)?.pages,
                ).length,
              ),
              ui('books'),
            ],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="app-text-stat-label">{label}</dt>
              <dd className="app-text-stat-value">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title={ui('discover')}>
        <div className="book-grid">
          {books.slice(2, 6).map((book) => (
            <BookPreview key={book.id} book={book} />
          ))}
        </div>
      </Section>
      <Section title={ui('readingRooms')}>
        <div className="room-grid">
          {rooms.slice(0, 2).map((room) => (
            <RoomPreview
              key={room.id}
              room={room}
              isMember={memberships.includes(room.id)}
            />
          ))}
        </div>
      </Section>
    </Page>
  );
}
