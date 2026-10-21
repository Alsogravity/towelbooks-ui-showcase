import { z } from 'zod';

import {
  EXTERNAL_LINK_TITLE_MAX_LENGTH,
  EXTERNAL_LINKS_MAX_COUNT,
  SOURCE_URL_MAX_LENGTH,
} from './limits.js';

export const EXTERNAL_LINK_URL_INVALID_MESSAGE = 'Invalid URL.';
export const EXTERNAL_LINK_PROTOCOL_NOT_ALLOWED_MESSAGE =
  'Protocol not allowed.';
export const EXTERNAL_LINK_URL_TOO_LONG_MESSAGE = `URL must be at most ${SOURCE_URL_MAX_LENGTH} characters.`;
export const EXTERNAL_LINK_TITLE_REQUIRED_MESSAGE = 'Title is required.';
export const EXTERNAL_LINK_TITLE_TOO_LONG_MESSAGE = `Title must be at most ${EXTERNAL_LINK_TITLE_MAX_LENGTH} characters.`;
export const EXTERNAL_LINKS_LIMIT_MESSAGE = `You can add up to ${EXTERNAL_LINKS_MAX_COUNT} links.`;

export function normalizeExternalLinkUrl(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return '';
  }

  const withProtocol = /^www\./i.test(trimmedValue)
    ? `https://${trimmedValue}`
    : trimmedValue;

  try {
    const parsedUrl = new URL(withProtocol);
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();

    if (parsedUrl.pathname === '/' && !parsedUrl.search && !parsedUrl.hash) {
      return `${parsedUrl.protocol}//${parsedUrl.host}`;
    }

    return parsedUrl.href;
  } catch {
    return withProtocol;
  }
}

export function isValidExternalLinkUrl(value: string): boolean {
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

function externalLinkUrlValidationMessage(value: string): string {
  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol !== 'https:') {
      return EXTERNAL_LINK_PROTOCOL_NOT_ALLOWED_MESSAGE;
    }
  } catch {
    return EXTERNAL_LINK_URL_INVALID_MESSAGE;
  }

  return EXTERNAL_LINK_URL_INVALID_MESSAGE;
}

export const externalLinkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(EXTERNAL_LINK_TITLE_MAX_LENGTH),
  url: z.string().min(1).max(SOURCE_URL_MAX_LENGTH),
  position: z.number().int().nonnegative(),
});
export type ExternalLink = z.infer<typeof externalLinkSchema>;

const externalLinkInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, EXTERNAL_LINK_TITLE_REQUIRED_MESSAGE)
    .max(EXTERNAL_LINK_TITLE_MAX_LENGTH, EXTERNAL_LINK_TITLE_TOO_LONG_MESSAGE),
  url: z.preprocess(
    (value) =>
      typeof value === 'string' ? normalizeExternalLinkUrl(value) : value,
    z
      .string()
      .min(1, EXTERNAL_LINK_URL_INVALID_MESSAGE)
      .max(SOURCE_URL_MAX_LENGTH, EXTERNAL_LINK_URL_TOO_LONG_MESSAGE)
      .superRefine((value, context) => {
        if (!isValidExternalLinkUrl(value)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: externalLinkUrlValidationMessage(value),
          });
        }
      }),
  ),
});
export type ExternalLinkInput = z.infer<typeof externalLinkInputSchema>;

export const replaceExternalLinksRequestSchema = z.object({
  links: z
    .array(externalLinkInputSchema)
    .max(EXTERNAL_LINKS_MAX_COUNT, EXTERNAL_LINKS_LIMIT_MESSAGE),
});
export type ReplaceExternalLinksRequest = z.infer<
  typeof replaceExternalLinksRequestSchema
>;

export const replaceExternalLinksResponseSchema = z.object({
  links: z.array(externalLinkSchema).max(EXTERNAL_LINKS_MAX_COUNT),
});
export type ReplaceExternalLinksResponse = z.infer<
  typeof replaceExternalLinksResponseSchema
>;
