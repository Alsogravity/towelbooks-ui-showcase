import { SOURCE_URL_MAX_LENGTH } from './limits.js';

export const SOURCE_URL_INVALID_MESSAGE =
  'Enter a complete website address, like https://example.com or www.example.com.';
export const SOURCE_URL_TOO_LONG_MESSAGE = `Source URL must be at most ${SOURCE_URL_MAX_LENGTH} characters.`;

export function normalizeSourceUrlInput(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return '';
  }

  if (/^www\./i.test(trimmedValue)) {
    return `https://${trimmedValue}`;
  }

  return trimmedValue;
}

export function normalizeOptionalSourceUrlInput(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = normalizeSourceUrlInput(value);

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

export function normalizeNullableSourceUrlInput(
  value: string | null | undefined,
): string | null | undefined {
  if (value === null) {
    return null;
  }

  return normalizeOptionalSourceUrlInput(value);
}

export function isValidSourceUrlInput(value: string): boolean {
  try {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    const hostnameParts = parsedUrl.hostname.split('.');

    return (
      parsedUrl.hostname.includes('.') &&
      hostnameParts.every((part) => part.trim().length > 0)
    );
  } catch {
    return false;
  }
}
