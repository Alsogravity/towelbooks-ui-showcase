import type { CatalogItem, LibraryItemDetail } from '@towelbooks/schemas';
import { state, date, catalog, uuid } from './state';
export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function paginate(items: unknown[], query: URLSearchParams) {
  const page = Math.max(1, Number(query.get('page') ?? 1)),
    pageSize = Math.max(1, Number(query.get('pageSize') ?? 24));
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: items.length,
  };
}
export const cursorEmpty = {
  items: [],
  pageInfo: { nextCursor: null, hasNextPage: false },
};
export function projection(work: CatalogItem) {
  return {
    id: work.id,
    kind: work.kind,
    display: work.display,
    contributors: work.contributors,
    categories: work.categories.map(
      ({ isPrimary: _primary, ...category }) => category,
    ),
  };
}
export function identity() {
  const { avatar, bio, displayName, username } = state.user;
  return { avatar, bio, displayName, username };
}
export function collectionSummary(id: string) {
  const collection = state.collections.find((value) => value.id === id);
  if (!collection) throw new Error('Collection not found');
  const { ownerUserId: _owner, archivedAt: _archive, ...summary } = collection;
  return summary;
}
export function collectionEntries(id: string) {
  const ids = id.endsWith('500')
    ? [4, 5]
    : id.endsWith('501')
      ? [0, 2]
      : [0, 1, 2];
  return ids.map((index, i) => {
    const work = catalog[index]!;
    return {
      id: uuid(800 + index + i),
      collectionId: id,
      catalogWorkId: work.id,
      catalogEditionId: work.catalogEditions[0]!.id,
      catalogEdition: work.catalogEditions[0],
      createdAt: date,
      updatedAt: date,
      work: projection(work),
      note: null,
      priority: null,
      removedAt: null,
    };
  });
}
export const collectionData = new Map(
  state.collections.map((value) => [value.id, collectionEntries(value.id)]),
);

export function libraryItemSummary(item: LibraryItemDetail) {
  const { catalogEditions: _editions, ...work } = item.work;
  return { ...item, work };
}
