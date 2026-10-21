import { describe, expect, it } from 'vitest';
import { books, filterBooks, initialLibrary, updateReading } from './data';
describe('demo reading interactions', () => {
  it('finds titles and authors without requiring accents or matching case', () => {
    expect(
      filterBooks(books, 'distancias', 'all').map((book) => book.id),
    ).toEqual(['atlas']);
    expect(
      filterBooks(books, ' TOMAS ', 'essays').map((book) => book.id),
    ).toEqual(['silencio']);
    expect(filterBooks(books, 'Tomas', 'poetry')).toEqual([]);
  });
  it('updates one reading without changing the original fixture or other items', () => {
    const library = initialLibrary();
    const updated = updateReading(library, books[0]!, 120, 'A new note');
    expect(updated.find((item) => item.bookId === 'atlas')).toEqual({
      bookId: 'atlas',
      page: 120,
      note: 'A new note',
    });
    expect(updated.find((item) => item.bookId === 'silencio')).toEqual(
      library.find((item) => item.bookId === 'silencio'),
    );
    expect(initialLibrary().find((item) => item.bookId === 'atlas')?.page).toBe(
      86,
    );
  });
  it.each([-1, 249, 3.5, NaN, Infinity])(
    'rejects page values outside a real reading boundary: %s',
    (page) => {
      expect(() =>
        updateReading(initialLibrary(), books[0]!, page, ''),
      ).toThrow(RangeError);
    },
  );
  it('accepts the not-started and completed reading boundaries', () => {
    expect(updateReading(initialLibrary(), books[0]!, 0, '')[0]?.page).toBe(0);
    expect(updateReading(initialLibrary(), books[0]!, 248, '')[0]?.page).toBe(
      248,
    );
  });
});
