import {
  demoUser,
  library,
  makeItems,
  sessions,
  collectionSeeds,
  roomSeeds,
} from './fixtures';
export { catalog, candidates, date, uuid } from './fixtures';
export const state = {
  user: structuredClone(demoUser),
  library: structuredClone(library),
  items: makeItems(),
  sessions: structuredClone(sessions),
  collections: structuredClone(collectionSeeds),
  rooms: structuredClone(roomSeeds),
};
