import { Navigate, matchRoutes, type RouteObject } from 'react-router';
import type { ReactElement } from 'react';

import { lazyNamedPage } from './lazy-page';
import { AppRootIndexRoute } from './root-index-route';
import { preloadRootIndexRoute } from './root-index-route';

const MyLibraryPage = lazyNamedPage(
  () => import('../pages/libraries/MyLibraryPage'),
  'MyLibraryPage',
);
const LibraryDetailPage = lazyNamedPage(
  () => import('../pages/libraries/LibraryDetailPage'),
  'LibraryDetailPage',
);
const LibraryItemDetailPage = lazyNamedPage(
  () => import('../pages/libraries/LibraryItemDetailPage'),
  'LibraryItemDetailPage',
);
const CollectionsPage = lazyNamedPage(
  () => import('../pages/collections/CollectionsPage'),
  'CollectionsPage',
);
const CollectionDetailPage = lazyNamedPage(
  () => import('../pages/collections/CollectionDetailPage'),
  'CollectionDetailPage',
);
const RoomListPage = lazyNamedPage(
  () => import('../pages/rooms/list/RoomListPage'),
  'RoomListPage',
);
const CreateRoomPage = lazyNamedPage(
  () => import('../pages/rooms/create/CreateRoomPage'),
  'CreateRoomPage',
);
const ReadingDetailPage = lazyNamedPage(
  () => import('../pages/rooms/reading/ReadingDetailPage'),
  'ReadingDetailPage',
);
const AcceptInvitePage = lazyNamedPage(
  () => import('../pages/rooms/invites/AcceptInvitePage'),
  'AcceptInvitePage',
);
const CatalogPage = lazyNamedPage(
  () => import('../pages/catalog/CatalogPage'),
  'CatalogPage',
);
const CatalogContributionPage = lazyNamedPage(
  () => import('../pages/catalog/contribute/CatalogContributionPage'),
  'CatalogContributionPage',
);
const CatalogEditPage = lazyNamedPage(
  () => import('../pages/catalog/edit/CatalogEditPage'),
  'CatalogEditPage',
);
const CatalogWorkDetailPage = lazyNamedPage(
  () => import('../pages/catalog/detail/CatalogWorkDetailPage'),
  'CatalogWorkDetailPage',
);
const CatalogReviewEditorPage = lazyNamedPage(
  () => import('../pages/catalog-reviews/CatalogReviewEditorPage'),
  'CatalogReviewEditorPage',
);
const CatalogReviewDiscoveryPage = lazyNamedPage(
  () => import('../pages/catalog-reviews/CatalogReviewDiscoveryPage'),
  'CatalogReviewDiscoveryPage',
);
const CatalogReviewViewPage = lazyNamedPage(
  () => import('../pages/catalog-reviews/CatalogReviewViewPage'),
  'CatalogReviewViewPage',
);
const ProfileSettingsPage = lazyNamedPage(
  () => import('../pages/settings/ProfileSettingsPage'),
  'ProfileSettingsPage',
);
const LegalUpdatesPage = lazyNamedPage(
  () => import('../pages/legal-updates/LegalUpdatesPage'),
  'LegalUpdatesPage',
);

export const libraryPreviewChildren: RouteObject[] = [
  {
    element: <LibraryDetailPage />,
    path: 'libraries/:libraryId',
  },
  {
    element: <LibraryItemDetailPage />,
    path: 'libraries/:libraryId/items/:libraryItemId',
  },
];

export const catalogReviewReadChildren: RouteObject[] = [
  {
    element: <CatalogReviewDiscoveryPage />,
    path: 'catalog-reviews',
  },
  {
    element: <CatalogReviewViewPage />,
    path: 'catalog-reviews/:catalogReviewId',
  },
];

export const collectionReadChildren: RouteObject[] = [
  {
    element: <CollectionDetailPage />,
    path: 'collections/:collectionId',
  },
];

export const appLayoutChildren: RouteObject[] = [
  {
    element: <AppRootIndexRoute />,
    index: true,
  },
  {
    element: <MyLibraryPage />,
    path: 'my-library',
  },
  {
    element: <CollectionsPage />,
    path: 'collections',
  },
  {
    element: <Navigate to=".." replace relative="path" />,
    path: 'libraries/:libraryId/edit',
  },
  {
    element: <RoomListPage />,
    path: 'rooms',
  },
  {
    element: <CreateRoomPage />,
    path: 'rooms/create',
  },
  {
    element: <ReadingDetailPage />,
    path: 'rooms/:roomId/readings/:readingId',
  },
  {
    element: <AcceptInvitePage />,
    path: 'invites/accept',
  },
  {
    element: <CatalogPage />,
    path: 'catalog',
  },
  {
    element: <CatalogContributionPage />,
    path: 'catalog/new',
  },
  {
    element: <CatalogContributionPage />,
    path: 'catalog/new/:identifier',
  },
  {
    element: <CatalogEditPage />,
    path: 'catalog/edit/:id',
  },
  {
    element: <CatalogWorkDetailPage />,
    path: 'catalog/:catalogWorkId',
  },
  {
    element: <CatalogReviewEditorPage />,
    path: 'catalog/:catalogWorkId/catalog-reviews/new',
  },
  {
    element: <CatalogReviewEditorPage />,
    path: 'catalog-reviews/:catalogReviewId/edit',
  },
  {
    element: <ProfileSettingsPage />,
    path: 'settings/profile',
  },
  {
    element: <LegalUpdatesPage />,
    path: 'legal-updates',
  },
];

function getRoutePreloader(
  element: RouteObject['element'],
): (() => Promise<void>) | undefined {
  if (!element || typeof element !== 'object' || !('type' in element)) {
    return undefined;
  }

  const routeElement = element as ReactElement;
  const routeType = routeElement.type;

  if (!routeType || typeof routeType !== 'object') {
    return undefined;
  }

  const preload = (routeType as { preload?: unknown }).preload;
  return typeof preload === 'function'
    ? (preload as () => Promise<void>)
    : undefined;
}

/** Starts the matched protected page chunk before AppLayout finishes loading. */
export function preloadAppShellRoute(pathname: string): Promise<void> {
  const routeMatch = matchRoutes(appLayoutChildren, pathname, '/')?.at(-1);

  if (!routeMatch) {
    return Promise.resolve();
  }

  if (routeMatch.route.index) {
    return preloadRootIndexRoute();
  }

  return getRoutePreloader(routeMatch.route.element)?.() ?? Promise.resolve();
}
