import {
  buildAvatar,
  catalogItemSchema,
  librarySchema,
  libraryItemDetailSchema,
  libraryItemReadingSessionSchema,
  meResponseSchema,
  collectionSchema,
  roomListItemSchema,
  readingSchema,
} from '@towelbooks/schemas';
export const date = '2026-10-20T12:00:00.000Z';
export const uuid = (value: number) =>
  `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`;
export const avatar = buildAvatar({
  displayName: 'Peter Parker',
  username: 'peter_parker',
  avatarBackground: '#581810',
  avatarImageUrl: null,
});
export const demoUser = meResponseSchema.parse({
  id: uuid(1),
  email: 'peter.parker@example.invalid',
  displayName: 'Peter Parker',
  username: 'peter_parker',
  bio: 'Leituras lentas, margens anotadas e conversas depois do último capítulo.',
  locale: null,
  localeMode: 'auto',
  lastResolvedLocale: 'pt-BR',
  bannerPresetId: 'gradient-paper-warm',
  bannerImage: null,
  defaultLibraryId: uuid(2),
  avatar,
  links: [],
  authMethods: { google: false, password: true },
  legalDocumentsUnavailable: false,
  requiredLegalAcceptances: [],
  status: 'active',
});
const titles = [
  ['Atlas das pequenas distâncias', 'Clara Valença', 248],
  ['O silêncio entre as folhas', 'Tomás Avelar', 192],
  ['Enquanto o mar respira', 'Lia Monteiro', 136],
  ['Um jardim no fim do mundo', 'Helena Prado', 304],
  ['A geometria da luz', 'Davi Nascimento', 224],
  ['A casa dos dias longos', 'Cecília Reis', 280],
] as const;
export const catalog = titles.map(([title, author, pages], index) => {
  const editionId = uuid(200 + index);
  const display = {
    title,
    subtitle: null,
    synopsis:
      'Uma obra fictícia para explorar a interface original do TowelBooks. Entre memórias, encontros e caminhos inesperados, esta história convida a uma leitura sem pressa.',
    language: 'pt-BR',
    catalogEditionId: editionId,
    coverCatalogEditionId: null,
    coverUrl: null,
    coverThumbnailUrl: null,
    coverGeometry: null,
  };
  return catalogItemSchema.parse({
    id: uuid(100 + index),
    kind: 'book',
    display,
    createdAt: date,
    updatedAt: date,
    averageRating: 4.2,
    contributors: [author],
    categories: [
      {
        slug: 'fiction',
        displayName: 'Ficção',
        displayNameLocale: 'pt-BR',
        isPrimary: true,
      },
    ],
    tags: [],
    catalogEditions: [
      {
        id: editionId,
        asin: null,
        purchaseLink: null,
        title,
        subtitle: null,
        synopsis: display.synopsis,
        language: 'pt-BR',
        publisher: 'Edições de demonstração',
        imprint: null,
        isbn10: null,
        isbn13: null,
        editionNumber: '1',
        publishedDate: '2024-01-01T00:00:00.000Z',
        seriesOrCollection: null,
        pageCount: pages,
        volume: null,
        verificationStatus: 'unverified',
        coverUrl: null,
        coverThumbnailUrl: null,
        source: 'manual',
        sourceId: null,
        sourceUrl: null,
        contributors: [author],
      },
    ],
  });
});
export const candidates = catalog.map((work) => ({
  candidateType: 'local' as const,
  catalogWorkId: work.id,
  display: work.display,
  source: 'manual' as const,
  sourceId: null,
  kind: work.kind,
  contributors: work.contributors,
  coverUrl: null,
  coverThumbnailUrl: null,
  coverGeometry: null,
  publishedDate: date,
  isbn10: null,
  isbn13: null,
  publisher: work.catalogEditions[0]!.publisher,
  pageCount: work.catalogEditions[0]!.pageCount,
  averageRating: 4.2,
  categories: work.categories,
  tags: [],
}));
export const library = librarySchema.parse({
  id: uuid(2),
  ownerUserId: demoUser.id,
  roomId: null,
  type: 'personal',
  name: '',
  description: null,
  coverUrl: null,
  visibility: 'shared',
  isDefault: true,
  createdAt: date,
  updatedAt: date,
  archivedAt: null,
});
export const sessions = catalog.slice(0, 4).map((work, index) =>
  libraryItemReadingSessionSchema.parse({
    id: uuid(400 + index),
    libraryItemId: uuid(300 + index),
    catalogEditionId: work.catalogEditions[0]!.id,
    libraryItemOwnershipId: null,
    status: index === 2 ? 'read' : index === 3 ? 'not_started' : 'reading',
    currentPage: [86, 54, 136, 0][index],
    totalPages: work.catalogEditions[0]!.pageCount,
    startedAt: index === 3 ? null : '2026-10-01',
    finishedAt: index === 2 ? '2026-10-18' : null,
    title: null,
    version: 1,
    createdAt: date,
    updatedAt: date,
  }),
);
export function detailEditions(work: (typeof catalog)[number]) {
  return work.catalogEditions.map(
    ({
      purchaseLink: _purchase,
      verificationStatus: _verification,
      coverUrl: _cover,
      coverThumbnailUrl: _thumbnail,
      sourceUrl: _source,
      ...edition
    }) => edition,
  );
}
export function makeItems() {
  return catalog.slice(0, 4).map((work, index) => {
    const session = sessions[index]!;
    return libraryItemDetailSchema.parse({
      id: uuid(300 + index),
      libraryId: library.id,
      catalogWorkId: work.id,
      addedByUserId: demoUser.id,
      viewerRating: null,
      personalNote: null,
      createdAt: date,
      updatedAt: date,
      removedAt: null,
      work: {
        id: work.id,
        kind: work.kind,
        display: work.display,
        contributors: work.contributors,
        categories: work.categories.map(
          ({ isPrimary: _primary, ...category }) => category,
        ),
        catalogEditions: detailEditions(work),
      },
      ownerships: [],
      readingSummary: {
        sessionsCount: 1,
        completedCount: session.status === 'read' ? 1 : 0,
        statusCounts: {
          not_started: 0,
          reading: 0,
          paused: 0,
          read: 0,
          abandoned: 0,
          [session.status]: 1,
        },
        mostRecentlyUpdatedSession: {
          id: session.id,
          catalogEditionId: session.catalogEditionId,
          status: session.status,
          currentPage: session.currentPage,
          totalPages: session.totalPages,
          startedAt: session.startedAt,
          finishedAt: session.finishedAt,
          updatedAt: session.updatedAt,
        },
      },
    });
  });
}
export const collectionSeeds = [
  collectionSchema.parse({
    id: uuid(500),
    ownerUserId: demoUser.id,
    systemKey: 'wishlist',
    name: null,
    description: null,
    accentKey: 'amber',
    iconKey: 'saved',
    coverUrl: null,
    itemCount: 2,
    archivedAt: null,
    createdAt: date,
    updatedAt: date,
  }),
  collectionSchema.parse({
    id: uuid(501),
    ownerUserId: demoUser.id,
    systemKey: 'favorites',
    name: null,
    description: null,
    accentKey: 'rose',
    iconKey: 'love',
    coverUrl: null,
    itemCount: 2,
    archivedAt: null,
    createdAt: date,
    updatedAt: date,
  }),
  collectionSchema.parse({
    id: uuid(502),
    ownerUserId: demoUser.id,
    systemKey: null,
    name: 'Para ler sem pressa',
    description: 'Leituras que pedem um pouco mais de tempo.',
    accentKey: 'neutral',
    iconKey: 'books',
    coverUrl: null,
    itemCount: 3,
    archivedAt: null,
    createdAt: date,
    updatedAt: date,
  }),
];
export const roomSeeds = [
  'À margem do dia',
  'Entrelinhas',
  'Um verso por vez',
].map((name, index) => {
  const work = catalog[index]!;
  const id = uuid(600 + index);
  const currentReading = readingSchema.parse({
    id: uuid(700 + index),
    roomId: id,
    description: 'Uma leitura compartilhada, capítulo por capítulo.',
    status: 'active',
    createdByUserId: demoUser.id,
    createdAt: date,
    updatedAt: date,
    catalogWorkId: work.id,
    work: {
      id: work.id,
      kind: work.kind,
      display: work.display,
      contributors: work.contributors,
      categories: work.categories.map(
        ({ isPrimary: _primary, ...category }) => category,
      ),
    },
    catalogEdition: work.catalogEditions[0],
  });
  return roomListItemSchema.parse({
    id,
    slug: `sala-${index + 1}`,
    name,
    description:
      'Um espaço para compartilhar leituras, ideias e boas conversas.',
    visibility: 'public',
    joinPolicy: 'open',
    maxMembers: 100,
    avatar: buildAvatar({
      displayName: name,
      username: `sala-${index + 1}`,
      avatarBackground: null,
      avatarImageUrl: null,
    }),
    bannerImage: null,
    bannerPresetId: 'gradient-paper-warm',
    createdByUserId: demoUser.id,
    createdAt: date,
    archivedAt: null,
    owner: { displayName: demoUser.displayName, avatar },
    links: [],
    categories: [],
    memberCount: 18 + index * 3,
    readingsCount: 1,
    currentReading,
    userRole: 'owner',
    lastActivityAt: date,
  });
});
