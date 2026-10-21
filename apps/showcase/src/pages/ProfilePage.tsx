import { Avatar } from '@towelbooks/ui';
import { Page, Section } from '../components/Page';
import { useI18n } from '../i18n';
import { useDemo } from '../demo/DemoContext';
import { books } from '../demo/data';
import { BookPreview } from '../entities/BookPreview';
export function ProfilePage() {
  const { ui } = useI18n();
  const { library } = useDemo();
  return (
    <Page title={ui('profile')}>
      <header className="profile-header">
        <Avatar initial="M" size="lg" />
        <div>
          <h2 className="app-text-entity-title">Marina Costa</h2>
          <p className="app-text-metadata text-ink-3">@marina.demo</p>
        </div>
      </header>
      <p className="synopsis">{ui('bio')}</p>
      <dl className="insights">
        <div>
          <dt>{ui('bookCount')}</dt>
          <dd className="app-text-stat-value">{library.length}</dd>
        </div>
        <div>
          <dt>{ui('following')}</dt>
          <dd className="app-text-stat-value">24</dd>
        </div>
        <div>
          <dt>{ui('followers')}</dt>
          <dd className="app-text-stat-value">38</dd>
        </div>
      </dl>
      <Section title={ui('library')}>
        <div className="book-grid">
          {books
            .filter((book) => library.some((item) => item.bookId === book.id))
            .map((book) => (
              <BookPreview key={book.id} book={book} />
            ))}
        </div>
      </Section>
    </Page>
  );
}
