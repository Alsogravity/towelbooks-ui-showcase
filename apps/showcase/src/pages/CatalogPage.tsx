import { Page } from '../components/Page';
import { books } from '../demo/data';
import { useDemo } from '../demo/DemoContext';
import { BrowseBooks } from '../features/BrowseBooks';
import { useI18n } from '../i18n';
export function CatalogPage({ library = false }: { library?: boolean }) {
  const { ui } = useI18n();
  const { library: items } = useDemo();
  const selected = library
    ? books.filter((book) => items.some((item) => item.bookId === book.id))
    : books;
  const pages = library
    ? Object.fromEntries(items.map((item) => [item.bookId, item.page]))
    : undefined;
  return (
    <Page
      title={ui(library ? 'library' : 'catalog')}
      description={ui(library ? 'libraryBody' : 'catalogBody')}
    >
      <BrowseBooks books={selected} pages={pages} />
    </Page>
  );
}
