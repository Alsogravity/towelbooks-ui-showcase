import type { QueryClient } from '@tanstack/react-query';
import type { LibraryItemsQuery } from '@towelbooks/schemas';

type LibrariesQueryClient = Pick<QueryClient, 'invalidateQueries'>;
export type LibraryItemReadingAccess = 'owner' | 'viewer';

export const LIBRARIES_QUERY_KEY = ['libraries'] as const;
export const MY_LIBRARY_QUERY_KEY = [
  ...LIBRARIES_QUERY_KEY,
  'my-library',
] as const;

export function libraryQueryKey(libraryId: string) {
  return [...LIBRARIES_QUERY_KEY, libraryId] as const;
}

export function libraryItemsQueryKey(libraryId: string) {
  return [...libraryQueryKey(libraryId), 'items'] as const;
}

export function libraryItemsListQueryKey(
  libraryId: string,
  query: LibraryItemsQuery,
  locale: string,
) {
  return [...libraryItemsQueryKey(libraryId), 'list', query, locale] as const;
}

export function libraryItemsFacetsQueryKey(libraryId: string) {
  return [...libraryItemsQueryKey(libraryId), 'facets'] as const;
}

export function libraryItemQueryKey(
  libraryId: string,
  libraryItemId: string,
  locale: string,
  access: LibraryItemReadingAccess,
) {
  return [
    ...libraryItemsQueryKey(libraryId),
    libraryItemId,
    locale,
    access,
  ] as const;
}

export function libraryItemReadingSessionsQueryKey(
  libraryId: string,
  libraryItemId: string,
  access: LibraryItemReadingAccess,
) {
  return [
    ...libraryItemsQueryKey(libraryId),
    libraryItemId,
    'reading-sessions',
    access,
  ] as const;
}

export function libraryItemReadingSessionQueryKey(
  libraryId: string,
  libraryItemId: string,
  sessionId: string,
  access: LibraryItemReadingAccess,
) {
  return [
    ...libraryItemReadingSessionsQueryKey(libraryId, libraryItemId, access),
    sessionId,
  ] as const;
}

export function libraryItemReadingNotesQueryKey(
  libraryId: string,
  libraryItemId: string,
  sessionId: string,
) {
  return [
    ...libraryItemReadingSessionsQueryKey(libraryId, libraryItemId, 'owner'),
    sessionId,
    'notes',
  ] as const;
}

export async function invalidateLibraryItemReadingNotesSurface(
  queryClient: LibrariesQueryClient,
  libraryId: string,
  libraryItemId: string,
  sessionId: string,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: libraryItemReadingNotesQueryKey(
      libraryId,
      libraryItemId,
      sessionId,
    ),
  });
}

export async function invalidateLibraryItemReadingSessionSurface(
  queryClient: LibrariesQueryClient,
  libraryId: string,
  libraryItemId: string,
  access: LibraryItemReadingAccess,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      exact: true,
      queryKey: libraryItemReadingSessionsQueryKey(
        libraryId,
        libraryItemId,
        access,
      ),
    }),
    queryClient.invalidateQueries({
      queryKey: [...libraryItemsQueryKey(libraryId), libraryItemId],
    }),
    queryClient.invalidateQueries({
      queryKey: libraryItemsQueryKey(libraryId),
    }),
  ]);
}

export async function invalidateLibrarySurface(
  queryClient: LibrariesQueryClient,
  libraryId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: LIBRARIES_QUERY_KEY }),
    queryClient.invalidateQueries({
      exact: true,
      queryKey: libraryQueryKey(libraryId),
    }),
    queryClient.invalidateQueries({
      queryKey: libraryItemsQueryKey(libraryId),
    }),
  ]);
}

export function invalidateLibraryRatingSurface(
  queryClient: LibrariesQueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: LIBRARIES_QUERY_KEY });
}
