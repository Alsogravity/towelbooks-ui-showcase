import { DemoProblem } from './problem';
import {
  libraryItemDetailSchema,
  libraryItemReadingSessionSchema,
  libraryItemReadingNoteSchema,
} from '@towelbooks/schemas';
import { state, date, uuid, catalog } from './state';
import { detailEditions } from './fixtures';
import { paginate, record, projection, libraryItemSummary } from './helpers';
let nextId = 3000;
const notes: ReturnType<typeof libraryItemReadingNoteSchema.parse>[] = [];
function refreshSummary(itemId: string) {
  const item = state.items.find((value) => value.id === itemId);
  if (!item) return;
  const sessions = state.sessions.filter(
    (value) => value.libraryItemId === itemId,
  );
  item.readingSummary = {
    sessionsCount: sessions.length,
    completedCount: sessions.filter((value) => value.status === 'read').length,
    statusCounts: {
      not_started: 0,
      reading: 0,
      paused: 0,
      read: 0,
      abandoned: 0,
    },
    mostRecentlyUpdatedSession: sessions.at(-1) ?? null,
  };
  for (const session of sessions)
    item.readingSummary.statusCounts[session.status]++;
}
export function librariesRequest(
  path: string,
  method: string,
  query: URLSearchParams,
  body: unknown,
): { handled: boolean; value?: unknown } {
  if (path === '/libraries/my-library')
    return { handled: true, value: state.library };
  if (path === '/libraries/my-library/items/lookup')
    return {
      handled: true,
      value: {
        item:
          state.items
            .filter(
              (value) => value.catalogWorkId === query.get('catalogWorkId'),
            )
            .map(libraryItemSummary)[0] ?? null,
      },
    };
  if (path === '/libraries')
    return { handled: true, value: paginate([state.library], query) };
  const match = path.match(/^\/libraries\/([^/]+)(?:\/(.*))?$/);
  if (!match) return { handled: false };
  const [, libraryId, rest] = match;
  if (libraryId !== state.library.id) throw new Error('Library not found');
  if (!rest) {
    if (method === 'PATCH') Object.assign(state.library, record(body));
    return {
      handled: true,
      value: {
        ...state.library,
        owner: { id: state.user.id, username: state.user.username },
      },
    };
  }
  if (rest === 'items/facets')
    return {
      handled: true,
      value: {
        total: state.items.length,
        kinds: { book: state.items.length, manga: 0, comic: 0 },
        statuses: {
          not_started: 1,
          reading: 2,
          paused: 0,
          read: 1,
          abandoned: 0,
        },
      },
    };
  if (rest === 'items') {
    if (method === 'GET') {
      const search = (query.get('search') ?? '').toLocaleLowerCase();
      return {
        handled: true,
        value: paginate(
          state.items
            .filter((value) =>
              `${value.work.display.title} ${value.work.contributors.join(' ')}`
                .toLocaleLowerCase()
                .includes(search),
            )
            .map(libraryItemSummary),
          query,
        ),
      };
    }
    const input = record(body),
      work = catalog.find((value) => value.id === input.catalogWorkId);
    if (!work) throw new Error('Book not found');
    const item = libraryItemDetailSchema.parse({
      id: uuid(nextId++),
      libraryId,
      catalogWorkId: work.id,
      addedByUserId: state.user.id,
      viewerRating: null,
      personalNote: null,
      createdAt: date,
      updatedAt: date,
      removedAt: null,
      work: { ...projection(work), catalogEditions: detailEditions(work) },
      ownerships: [],
      readingSummary: {
        sessionsCount: 0,
        completedCount: 0,
        statusCounts: {
          not_started: 0,
          reading: 0,
          paused: 0,
          read: 0,
          abandoned: 0,
        },
        mostRecentlyUpdatedSession: null,
      },
    });
    state.items.push(item);
    return { handled: true, value: libraryItemSummary(item) };
  }
  const segments = rest.split('/'),
    item = state.items.find((value) => value.id === segments[1]);
  if (!item) throw new Error('Library item not found');
  if (segments.length === 2) {
    if (method === 'DELETE') {
      state.items = state.items.filter((value) => value.id !== item.id);
      return { handled: true };
    }
    if (method === 'PATCH') Object.assign(item, record(body));
    return {
      handled: true,
      value: method === 'PATCH' ? libraryItemSummary(item) : item,
    };
  }
  if (segments[2] === 'reading-sessions') {
    const session = state.sessions.find((value) => value.id === segments[3]);
    if (segments[4] === 'notes') {
      if (method === 'GET')
        return {
          handled: true,
          value: paginate(
            notes.filter((value) => value.readingSessionId === session?.id),
            query,
          ),
        };
      if (method === 'DELETE') {
        const index = notes.findIndex((value) => value.id === segments[5]);
        if (index >= 0) notes.splice(index, 1);
        return { handled: true };
      }
      const value = libraryItemReadingNoteSchema.parse({
        pageStart: null,
        pageEnd: null,
        ...notes.find((value) => value.id === segments[5]),
        ...record(body),
        id: segments[5] ?? uuid(nextId++),
        readingSessionId: session?.id,
        createdAt: date,
        updatedAt: date,
      });
      const index = notes.findIndex((item) => item.id === value.id);
      if (index >= 0) notes[index] = value;
      else notes.push(value);
      return { handled: true, value };
    }
    if (method === 'GET')
      return {
        handled: true,
        value: segments[3]
          ? session
          : state.sessions.filter((value) => value.libraryItemId === item.id),
      };
    if (method === 'DELETE') {
      state.sessions = state.sessions.filter(
        (value) => value.id !== session?.id,
      );
      refreshSummary(item.id);
      return { handled: true };
    }
    const input = record(body);
    if (session && input.version !== session.version)
      throw new DemoProblem(409, 'CONFLICT');
    const currentPage = input.currentPage ?? session?.currentPage ?? 0;
    const totalPages = input.totalPages ?? session?.totalPages;
    if (
      typeof currentPage === 'number' &&
      typeof totalPages === 'number' &&
      currentPage > totalPages
    )
      throw new DemoProblem(422, 'VALIDATION_FAILED');
    const value = libraryItemReadingSessionSchema.parse({
      ...session,
      ...input,
      id: session?.id ?? uuid(nextId++),
      libraryItemId: item.id,
      catalogEditionId:
        input.catalogEditionId ??
        session?.catalogEditionId ??
        item.work.catalogEditions[0]?.id ??
        null,
      libraryItemOwnershipId: input.libraryItemOwnershipId ?? null,
      title: input.title ?? null,
      currentPage: input.currentPage ?? session?.currentPage ?? 0,
      totalPages:
        input.totalPages ??
        session?.totalPages ??
        item.work.catalogEditions[0]?.pageCount ??
        null,
      startedAt: input.startedAt ?? null,
      finishedAt: input.finishedAt ?? null,
      status: input.status ?? session?.status ?? 'not_started',
      version: (session?.version ?? 0) + 1,
      createdAt: session?.createdAt ?? date,
      updatedAt: date,
    });
    if (session) Object.assign(session, value);
    else state.sessions.push(value);
    refreshSummary(item.id);
    return { handled: true, value };
  }
  return { handled: false };
}
