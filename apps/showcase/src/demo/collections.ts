import {
  collectionSchema,
  createCollectionRequestSchema,
} from '@towelbooks/schemas';
import { state, date, uuid, catalog } from './state';
import {
  collectionSummary,
  collectionData,
  identity,
  paginate,
  projection,
  record,
} from './helpers';
let nextId = 2000;
export function collectionsRequest(
  path: string,
  method: string,
  query: URLSearchParams,
  body: unknown,
): { handled: boolean; value?: unknown } {
  if (path === '/me/collections') {
    if (method === 'GET')
      return { handled: true, value: paginate(state.collections, query) };
    const input = createCollectionRequestSchema.parse(body);
    const collection = collectionSchema.parse({
      id: uuid(nextId++),
      ownerUserId: state.user.id,
      systemKey: null,
      name: input.name,
      description: input.description ?? null,
      accentKey: input.accentKey ?? 'neutral',
      iconKey: input.iconKey ?? 'books',
      coverUrl: null,
      itemCount: 0,
      archivedAt: null,
      createdAt: date,
      updatedAt: date,
    });
    state.collections.push(collection);
    collectionData.set(collection.id, []);
    return { handled: true, value: collection };
  }
  const match = path.match(
    /^\/(?:me\/)?collections\/([^/]+)(?:\/items(?:\/([^/]+))?)?$/,
  );
  if (!match) return { handled: false };
  const [, id, itemId] = match;
  const owner = path.startsWith('/me/');
  const items = collectionData.get(id!) ?? [];
  const collection = state.collections.find((value) => value.id === id);
  if (!collection) throw new Error('Collection not found');
  if (!path.includes('/items')) {
    if (method === 'DELETE') {
      state.collections = state.collections.filter((value) => value.id !== id);
      collectionData.delete(id!);
      return { handled: true };
    }
    if (method === 'PATCH') {
      Object.assign(collection, record(body), { updatedAt: date });
      return { handled: true, value: collection };
    }
    return {
      handled: true,
      value: { ...collectionSummary(id!), owner: identity() },
    };
  }
  if (itemId === 'lookup')
    return {
      handled: true,
      value: {
        item:
          items.find(
            (value) => value.catalogWorkId === query.get('catalogWorkId'),
          ) ?? null,
      },
    };
  if (method === 'GET') {
    return {
      handled: true,
      value: paginate(
        owner
          ? items
          : items.map(
              ({
                note: _note,
                priority: _priority,
                removedAt: _removed,
                ...value
              }) => value,
            ),
        query,
      ),
    };
  }
  if (method === 'DELETE') {
    collectionData.set(
      id!,
      items.filter((value) => value.id !== itemId),
    );
    collection.itemCount = collectionData.get(id!)!.length;
    return { handled: true };
  }
  if (method === 'PATCH') {
    const item = items.find((value) => value.id === itemId);
    Object.assign(item ?? {}, record(body));
    return { handled: true, value: item };
  }
  const input = record(body),
    work = catalog.find((value) => value.id === input.catalogWorkId);
  if (!work) throw new Error('Book not found');
  const item = {
    id: uuid(nextId++),
    collectionId: id!,
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
  items.push(item);
  collectionData.set(id!, items);
  collection.itemCount = items.length;
  return { handled: true, value: item };
}
