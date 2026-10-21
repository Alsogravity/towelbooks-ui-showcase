import type { Locale } from '../i18n';
export type Localized = Record<Locale, string>;
export type Category = 'fiction' | 'essays' | 'poetry';
export type Book = {
  id: string;
  title: string;
  author: string;
  pages: number;
  category: Category;
  year: number;
  synopsis: Localized;
  theme: number;
};
export const books: Book[] = [
  {
    id: 'atlas',
    title: 'Atlas das pequenas distâncias',
    author: 'Clara Valença',
    pages: 248,
    category: 'fiction',
    year: 2024,
    theme: 0,
    synopsis: {
      'pt-BR':
        'Ao voltar à cidade em que cresceu, uma cartógrafa encontra um mapa feito de lembranças. Entre ruas que mudaram de nome e encontros inesperados, ela aprende que nem toda distância pode ser medida. Uma história fictícia sobre pertencimento, memória e os caminhos de volta.',
      'en-US':
        'Returning to her hometown, a cartographer discovers a map made of memories. Between renamed streets and unexpected encounters, she learns that not every distance can be measured. A fictional story about belonging, memory, and finding a way back.',
    },
  },
  {
    id: 'silencio',
    title: 'O silêncio entre as folhas',
    author: 'Tomás Avelar',
    pages: 192,
    category: 'essays',
    year: 2023,
    theme: 5,
    synopsis: {
      'pt-BR':
        'Ensaios fictícios sobre o tempo de uma leitura: a pausa, a releitura, a frase que acompanha o dia. Um convite a escutar o que acontece entre um livro e seu leitor.',
      'en-US':
        'Fictional essays about the time inside a reading: the pause, the rereading, the sentence that stays with your day. An invitation to listen to what happens between a book and its reader.',
    },
  },
  {
    id: 'mar',
    title: 'Enquanto o mar respira',
    author: 'Lia Monteiro',
    pages: 136,
    category: 'poetry',
    year: 2025,
    theme: 2,
    synopsis: {
      'pt-BR':
        'Poemas fictícios que acompanham as marés de uma pequena vila. O cotidiano encontra o extraordinário nas imagens da casa, do vento e da água.',
      'en-US':
        'Fictional poems following the tides of a small village. Everyday life meets the extraordinary through images of home, wind, and water.',
    },
  },
  {
    id: 'jardim',
    title: 'Um jardim no fim do mundo',
    author: 'Helena Prado',
    pages: 304,
    category: 'fiction',
    year: 2022,
    theme: 1,
    synopsis: {
      'pt-BR':
        'Duas vizinhas transformam um terreno esquecido em um jardim comunitário. Uma narrativa fictícia sobre cultivar relações e encontrar novos começos.',
      'en-US':
        'Two neighbors turn an abandoned lot into a community garden. A fictional narrative about cultivating relationships and finding new beginnings.',
    },
  },
  {
    id: 'luz',
    title: 'A geometria da luz',
    author: 'Davi Nascimento',
    pages: 224,
    category: 'essays',
    year: 2024,
    theme: 3,
    synopsis: {
      'pt-BR':
        'Uma coleção fictícia de observações sobre cidades, arte e o olhar. Pequenas investigações sobre aquilo que percebemos quando desaceleramos.',
      'en-US':
        'A fictional collection of observations about cities, art, and seeing. Small investigations into what we notice when we slow down.',
    },
  },
  {
    id: 'casa',
    title: 'A casa dos dias longos',
    author: 'Cecília Reis',
    pages: 280,
    category: 'fiction',
    year: 2025,
    theme: 4,
    synopsis: {
      'pt-BR':
        'Três gerações compartilham uma casa durante um verão. Nesta história fictícia, cartas antigas e refeições demoradas revelam novas maneiras de estar junto.',
      'en-US':
        'Three generations share a house for a summer. In this fictional story, old letters and long meals reveal new ways of being together.',
    },
  },
];
export const rooms = [
  {
    id: 'margens',
    name: 'À margem do dia',
    description: {
      'pt-BR':
        'Uma leitura lenta, uma boa conversa. Ficção e afeto depois do expediente.',
      'en-US':
        'A slow read, a good conversation. Fiction and connection after the workday.',
    },
    bookId: 'atlas',
    members: 18,
    theme: 'forest',
  },
  {
    id: 'entrelinhas',
    name: 'Entrelinhas',
    description: {
      'pt-BR': 'Ensaios, perguntas e um café que nunca esfria.',
      'en-US': 'Essays, questions, and a coffee that never gets cold.',
    },
    bookId: 'silencio',
    members: 12,
    theme: 'gold',
  },
  {
    id: 'verso',
    name: 'Um verso por vez',
    description: {
      'pt-BR': 'Poesia para ler em voz alta e guardar no bolso.',
      'en-US': 'Poetry to read aloud and keep in your pocket.',
    },
    bookId: 'mar',
    members: 24,
    theme: 'brick',
  },
] as const;
export const collections = [
  {
    id: 'devagar',
    title: { 'pt-BR': 'Para ler sem pressa', 'en-US': 'For unhurried reading' },
    description: {
      'pt-BR': 'Livros que pedem um pouco mais de tempo.',
      'en-US': 'Books that ask for a little more time.',
    },
    bookIds: ['silencio', 'mar', 'luz'],
  },
  {
    id: 'encontros',
    title: {
      'pt-BR': 'Histórias de encontros',
      'en-US': 'Stories of connection',
    },
    description: {
      'pt-BR': 'Pessoas, lugares e o que fica entre eles.',
      'en-US': 'People, places, and what stays between them.',
    },
    bookIds: ['atlas', 'jardim', 'casa'],
  },
] as const;
export type LibraryItem = { bookId: string; page: number; note: string };
export type Reflection = { id: number; roomId: string; body: string };
export function initialLibrary(): LibraryItem[] {
  return [
    { bookId: 'atlas', page: 86, note: '' },
    { bookId: 'silencio', page: 54, note: '' },
    { bookId: 'mar', page: 136, note: '' },
    { bookId: 'jardim', page: 0, note: '' },
  ];
}
export function findBook(id: string | undefined) {
  return books.find((book) => book.id === id);
}
export function filterBooks(list: Book[], query: string, category: string) {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  const term = normalize(query.trim());
  return list.filter(
    (book) =>
      (category === 'all' || book.category === category) &&
      normalize(`${book.title} ${book.author}`).includes(term),
  );
}
export function updateReading(
  library: LibraryItem[],
  book: Book,
  page: number,
  note: string,
): LibraryItem[] {
  if (!Number.isInteger(page) || page < 0 || page > book.pages)
    throw new RangeError('Invalid page');
  return library.map((item) =>
    item.bookId === book.id ? { ...item, page, note } : item,
  );
}
