import { normalizeIdentifierFormatting } from './identifier-formatting.js';

export type ParsedCanonicalIsbn =
  { kind: 'isbn10'; value: string } | { kind: 'isbn13'; value: string };

function stripIsbnFormatting(input: string): string {
  return normalizeIdentifierFormatting(input).replace(/-/g, '').toUpperCase();
}

function isValidIsbn10CheckDigit(isbn10: string): boolean {
  if (isbn10.length !== 10) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 10; index += 1) {
    const character = isbn10[index];
    const value =
      character === 'X' && index === 9
        ? 10
        : Number.parseInt(character ?? '', 10);

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      (character !== 'X' && value > 9)
    ) {
      return false;
    }

    sum += value * (10 - index);
  }

  return sum % 11 === 0;
}

function isValidIsbn13CheckDigit(isbn13: string): boolean {
  if (!/^\d{13}$/.test(isbn13)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 13; index += 1) {
    const digit = Number.parseInt(isbn13[index] ?? '', 10);
    sum += digit * (index % 2 === 0 ? 1 : 3);
  }

  return sum % 10 === 0;
}

/**
 * Parses user/provider ISBN input into canonical digits. Removes permitted
 * separators (spaces and hyphens) and invisible Unicode formatting characters,
 * uppercases the ISBN-10 check digit, rejects every other character, and
 * enforces exact length plus checksum validity. The parser never converts
 * between ISBN-10 and ISBN-13; consumers that need ISBN-13 must call
 * `convertIsbn10ToIsbn13`.
 */
export function parseCanonicalIsbn(input: string): ParsedCanonicalIsbn | null {
  const normalized = stripIsbnFormatting(input);

  if (normalized.length === 0) {
    return null;
  }

  if (/^\d{9}[\dX]$/.test(normalized)) {
    if (!isValidIsbn10CheckDigit(normalized)) {
      return null;
    }

    return {
      kind: 'isbn10',
      value: normalized,
    };
  }

  if (/^\d{13}$/.test(normalized)) {
    if (!isValidIsbn13CheckDigit(normalized)) {
      return null;
    }

    return {
      kind: 'isbn13',
      value: normalized,
    };
  }

  return null;
}

/**
 * Explicit ISBN-10 → ISBN-13 conversion for consumers that need a single
 * ISBN-13 identity. Expects canonical ISBN-10 digits (10 chars, uppercase X).
 */
export function convertIsbn10ToIsbn13(isbn10: string): string {
  const core = `978${isbn10.slice(0, 9)}`;
  let sum = 0;

  for (let index = 0; index < 12; index += 1) {
    const digit = Number.parseInt(core[index] ?? '', 10);
    sum += digit * (index % 2 === 0 ? 1 : 3);
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return `${core}${checkDigit}`;
}

/**
 * Normalizes any valid canonical ISBN into its common ISBN-13 identity:
 * ISBN-13 values pass through unchanged, ISBN-10 values are converted to
 * their 978- ISBN-13 twin, and invalid input yields null. Useful for
 * matching across forms — a 979-prefixed ISBN-13 has no ISBN-10 twin.
 */
export function canonicalIsbn13(input: string): string | null {
  const parsed = parseCanonicalIsbn(input);

  if (!parsed) {
    return null;
  }

  return parsed.kind === 'isbn10'
    ? convertIsbn10ToIsbn13(parsed.value)
    : parsed.value;
}

export type IsbnIdentityVariants = {
  isbn10: string | null;
  isbn13: string;
};

/**
 * Resolves the exact ISBN values that may identify one local edition. ISBN-10
 * and 978-prefixed ISBN-13 values are returned together; 979-prefixed ISBN-13
 * values have no ISBN-10 twin and therefore return only their submitted form.
 */
export function isbnIdentityVariants(
  input: string,
): IsbnIdentityVariants | null {
  const parsed = parseCanonicalIsbn(input);

  if (!parsed) {
    return null;
  }

  const isbn13 = canonicalIsbn13(parsed.value);

  if (!isbn13) {
    return null;
  }

  return {
    isbn10:
      parsed.kind === 'isbn10' ? parsed.value : convertIsbn13ToIsbn10(isbn13),
    isbn13,
  };
}

function convertIsbn13ToIsbn10(isbn13: string): string | null {
  if (!isbn13.startsWith('978')) {
    return null;
  }

  const core = isbn13.slice(3, 12);
  let sum = 0;

  for (let index = 0; index < core.length; index += 1) {
    sum += Number.parseInt(core[index] ?? '', 10) * (10 - index);
  }

  const checkDigit = (11 - (sum % 11)) % 11;

  return `${core}${checkDigit === 10 ? 'X' : checkDigit}`;
}
