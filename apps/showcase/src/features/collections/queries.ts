import { useQuery, type QueryClient } from '@tanstack/react-query';

import { sdk } from '../../lib/sdk';

export const COLLECTIONS_PAGE_SIZE = 100;
export const COLLECTION_ITEMS_PAGE_SIZE = 20;
export const PROFILE_COLLECTIONS_PREVIEW_LIMIT = 6;

const ANONYMOUS_VIEWER_SCOPE = 'anonymous';

export const collectionQueryKeys = {
  all: ['collections'] as const,
  ownerLists: ['collections', 'owner', 'lists'] as const,
  ownerList: (userId: string) =>
    [...collectionQueryKeys.ownerLists, userId] as const,
  profileLists: ['collections', 'profile', 'lists'] as const,
  profileList: (username: string, viewerUserId: string, limit: number) =>
    [
      ...collectionQueryKeys.profileLists,
      username,
      viewerUserId,
      limit,
    ] as const,
  details: ['collections', 'details'] as const,
  detail: (collectionId: string, viewerUserId: string) =>
    [...collectionQueryKeys.details, collectionId, viewerUserId] as const,
  collection: (collectionId: string) =>
    ['collections', 'collection', collectionId] as const,
  items: (
    collectionId: string,
    viewerUserId: string,
    access: 'owner' | 'public',
    page: number,
  ) =>
    [
      ...collectionQueryKeys.collection(collectionId),
      'items',
      viewerUserId,
      access,
      page,
    ] as const,
  lookups: (collectionId: string, viewerUserId: string) =>
    [
      ...collectionQueryKeys.collection(collectionId),
      'lookups',
      viewerUserId,
    ] as const,
};

export function useOwnerCollections(userId: string | null) {
  return useQuery({
    enabled: userId !== null,
    queryKey: userId
      ? collectionQueryKeys.ownerList(userId)
      : [...collectionQueryKeys.ownerLists, 'anonymous'],
    queryFn: () =>
      sdk.collections.list({ page: 1, pageSize: COLLECTIONS_PAGE_SIZE }),
  });
}

export function useProfileCollections({
  enabled = true,
  limit = PROFILE_COLLECTIONS_PREVIEW_LIMIT,
  username,
  viewerUserId,
}: {
  enabled?: boolean;
  limit?: number;
  username: string;
  viewerUserId: string | null;
}) {
  const viewerScope = viewerUserId ?? ANONYMOUS_VIEWER_SCOPE;

  return useQuery({
    enabled,
    queryKey: collectionQueryKeys.profileList(username, viewerScope, limit),
    queryFn: () =>
      sdk.collections.listProfileCollections(username, {
        page: 1,
        pageSize: limit,
      }),
  });
}

export function useCollectionDetail(
  collectionId: string | undefined,
  viewerUserId: string | null,
) {
  const viewerScope = viewerUserId ?? ANONYMOUS_VIEWER_SCOPE;

  return useQuery({
    enabled: Boolean(collectionId),
    queryKey: collectionId
      ? collectionQueryKeys.detail(collectionId, viewerScope)
      : [...collectionQueryKeys.details, 'unavailable'],
    queryFn: () => sdk.collections.get(collectionId!),
  });
}

export function useCollectionItems({
  access,
  collectionId,
  enabled = true,
  page,
  viewerUserId,
}: {
  access: 'owner' | 'public';
  collectionId: string | undefined;
  enabled?: boolean;
  page: number;
  viewerUserId: string | null;
}) {
  const viewerScope = viewerUserId ?? ANONYMOUS_VIEWER_SCOPE;
  const canRead = access === 'public' || viewerUserId !== null;

  return useQuery({
    enabled: Boolean(enabled && collectionId && canRead),
    queryKey: collectionId
      ? collectionQueryKeys.items(collectionId, viewerScope, access, page)
      : [
          ...collectionQueryKeys.items(
            'unavailable',
            'unavailable',
            access,
            page,
          ),
        ],
    queryFn: () =>
      access === 'owner'
        ? sdk.collections.listItems(collectionId!, {
            page,
            pageSize: COLLECTION_ITEMS_PAGE_SIZE,
          })
        : sdk.collections.listPublicItems(collectionId!, {
            page,
            pageSize: COLLECTION_ITEMS_PAGE_SIZE,
          }),
  });
}

export async function invalidateCollectionList(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: collectionQueryKeys.ownerLists,
    }),
    queryClient.invalidateQueries({
      queryKey: collectionQueryKeys.profileLists,
    }),
  ]);
}

export async function invalidateCollectionDetail(
  queryClient: QueryClient,
  collectionId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: collectionQueryKeys.details,
    predicate: (query) => query.queryKey.includes(collectionId),
  });
}

export async function invalidateCollectionSurface(
  queryClient: QueryClient,
  collectionId: string,
): Promise<void> {
  await Promise.all([
    invalidateCollectionList(queryClient),
    invalidateCollectionDetail(queryClient, collectionId),
    queryClient.invalidateQueries({
      queryKey: collectionQueryKeys.collection(collectionId),
    }),
  ]);
}
