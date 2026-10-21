import { state, catalog, candidates, date, uuid } from './state';
import { collectionsRequest } from './collections';
import { librariesRequest } from './libraries';
import { roomsRequest } from './rooms';
import {
  paginate,
  cursorEmpty,
  record,
  collectionSummary,
  identity,
  libraryItemSummary,
} from './helpers';
export function handleRequest(
  path: string,
  method: string,
  query: URLSearchParams,
  body: unknown,
): unknown {
  if (path === '/me') {
    if (method === 'PATCH') Object.assign(state.user, record(body));
    return state.user;
  }
  if (path === '/me/home')
    return { forYou: candidates.slice(0, 3), discover: candidates.slice(3) };
  if (path === '/me/insights')
    return {
      booksFinishedThisYear: state.sessions.filter(
        (value) => value.status === 'read',
      ).length,
      booksInProgress: state.sessions.filter(
        (value) => value.status === 'reading',
      ).length,
      totalInLibrary: state.items.length,
    };
  if (path === '/me/continue-reading')
    return {
      items: state.sessions
        .filter((session) => session.status === 'reading')
        .map((session) => {
          const item = state.items.find(
            (value) => value.id === session.libraryItemId,
          )!;
          return {
            catalogWorkId: item.catalogWorkId,
            kind: 'book',
            title: item.work.display.title,
            author: item.work.contributors[0],
            coverUrl: null,
            coverThumbnailUrl: null,
            progress: {
              currentPage: session.currentPage,
              pageCount: session.totalPages,
              percent: Math.round(
                (session.currentPage! / session.totalPages!) * 100,
              ),
            },
            source: {
              type: 'library',
              libraryId: state.library.id,
              libraryItemId: item.id,
            },
            lastActivityAt: date,
          };
        }),
    };
  if (path === '/catalog/taxonomy')
    return {
      categories: [
        {
          id: uuid(900),
          slug: 'fiction',
          displayName: 'Ficção',
          displayNameLocale: 'pt-BR',
          parentSlug: null,
        },
      ],
    };
  if (path === '/catalog/search') {
    const text = (query.get('query') ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
    return paginate(
      candidates.filter((item) =>
        `${item.display.title} ${item.contributors.join(' ')}`
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase()
          .includes(text),
      ),
      query,
    );
  }
  if (path.startsWith('/catalog/items/'))
    return catalog.find((item) => item.id === path.split('/').at(-1));
  if (path === '/notifications/unread-count') return { count: 0 };
  if (path.endsWith('/summary'))
    return { unseenCount: 0, pendingCount: 0, preview: [], snapshotAt: date };
  if (path === '/me/in-app-messages') return { items: [] };
  if (path === '/notifications') return { ...cursorEmpty, unreadCount: 0 };
  if (path === '/notifications/preferences') return { items: [] };
  if (path === '/me/room-activities') return cursorEmpty;
  if (path === '/me/reading-category-preferences')
    return {
      categories: [
        {
          id: uuid(900),
          slug: 'fiction',
          displayName: 'Ficção',
          displayNameLocale: 'pt-BR',
        },
      ],
    };
  if (path === '/me/privacy-preferences')
    return {
      marketingEmailsOptIn: false,
      productAnalyticsOptIn: false,
      profileVisibility: 'public',
      doNotSellOrShare: true,
      limitSensitivePersonalDataUse: true,
      updatedAt: date,
    };
  if (path.endsWith('/seen') || path.endsWith('/acknowledge'))
    return { updatedCount: 0 };
  if (path === '/me/member-invites' || path === '/me/follow-requests')
    return cursorEmpty;
  if (path.startsWith('/profiles/')) {
    const suffix = path.split('/').slice(3).join('/');
    if (!suffix)
      return {
        access: {
          visibility: 'public',
          canViewContent: true,
          relationship: 'self',
          followStatus: 'none',
          followedByStatus: 'none',
        },
        defaultLibraryId: state.library.id,
        profile: {
          ...identity(),
          id: state.user.id,
          bannerPresetId: state.user.bannerPresetId,
          bannerImage: null,
          locale: state.user.locale,
          links: [],
        },
        stats: {
          booksReadCount: 1,
          roomsCount: 3,
          followersCount: 24,
          followingCount: 18,
          libraryBooksCount: state.items.length,
          ratingsCount: 0,
          catalogReviewsCount: 0,
        },
        viewer: { isSelf: true },
      };
    if (suffix === 'collections')
      return paginate(
        state.collections.map((value) => collectionSummary(value.id)),
        query,
      );
    if (suffix === 'rooms') return { items: state.rooms };
    if (suffix === 'books-read')
      return {
        items: state.items
          .filter((item) => item.readingSummary.completedCount > 0)
          .map(libraryItemSummary),
      };
    if (suffix === 'ratings' || suffix === 'catalog-reviews')
      return { items: [] };
    return cursorEmpty;
  }
  if (path.startsWith('/ratings/'))
    return path.endsWith('/me') ? { item: null } : paginate([], query);
  if (path.startsWith('/catalog-reviews') || path.includes('/catalog-reviews'))
    return path.endsWith('/me') ? { item: null } : paginate([], query);
  if (path.startsWith('/comments') || path.startsWith('/reactions'))
    return cursorEmpty;
  for (const handler of [collectionsRequest, librariesRequest, roomsRequest]) {
    const result = handler(path, method, query, body);
    if (result.handled) return result.value;
  }
  throw new Error(`Demo endpoint not implemented: ${method} ${path}`);
}
