import limits from './limits.json' with { type: 'json' };

export const EMAIL_MAX_LENGTH = limits.EMAIL_MAX_LENGTH;
export const PASSWORD_MAX_LENGTH = limits.PASSWORD_MAX_LENGTH;
export const DISPLAY_NAME_MAX_LENGTH = limits.DISPLAY_NAME_MAX_LENGTH;
export const USERNAME_MIN_LENGTH = limits.USERNAME_MIN_LENGTH;
export const USERNAME_MAX_LENGTH = limits.USERNAME_MAX_LENGTH;
export const BIO_MAX_LENGTH = limits.BIO_MAX_LENGTH;
export const BIO_MAX_LINES = limits.BIO_MAX_LINES;
export const ROOM_NAME_MAX_LENGTH = limits.ROOM_NAME_MAX_LENGTH;
export const ROOM_DESCRIPTION_MAX_LENGTH = limits.ROOM_DESCRIPTION_MAX_LENGTH;
export const ROOM_DESCRIPTION_MAX_LINES = limits.ROOM_DESCRIPTION_MAX_LINES;
export const ROOM_CATEGORIES_MAX_COUNT = limits.ROOM_CATEGORIES_MAX_COUNT;
export const ROOMS_PER_USER_MAX = limits.ROOMS_PER_USER_MAX;
export const ROOM_MEMBERS_PER_ROOM_MAX = limits.ROOM_MEMBERS_PER_ROOM_MAX;
export const ROOM_MAX_MEMBERS_DEFAULT = limits.ROOM_MAX_MEMBERS_DEFAULT;
export const ROOM_MAX_MEMBERS_ABSOLUTE_MAX =
  limits.ROOM_MAX_MEMBERS_ABSOLUTE_MAX;
export const INVITED_EMAIL_MAX_LENGTH = limits.INVITED_EMAIL_MAX_LENGTH;
export const READING_TITLE_MAX_LENGTH = limits.READING_TITLE_MAX_LENGTH;
export const READING_ISBN_MAX_LENGTH = 32;
export const READING_AUTHOR_MAX_LENGTH = limits.READING_AUTHOR_MAX_LENGTH;
export const SOURCE_URL_MAX_LENGTH = limits.SOURCE_URL_MAX_LENGTH;
export const EXTERNAL_LINK_TITLE_MAX_LENGTH =
  limits.EXTERNAL_LINK_TITLE_MAX_LENGTH;
export const EXTERNAL_LINKS_MAX_COUNT = limits.EXTERNAL_LINKS_MAX_COUNT;
export const READING_DESCRIPTION_MAX_LENGTH =
  limits.READING_DESCRIPTION_MAX_LENGTH;
export const COMMENT_BODY_MAX_LENGTH = limits.NOTE_BODY_MAX_LENGTH;
export const COMMENT_CITATION_MAX_LENGTH = limits.NOTE_CITATION_MAX_LENGTH;
export const COMMENT_MAX_DEPTH = limits.COMMENT_MAX_DEPTH;
export const DISCUSSION_TITLE_MAX_LENGTH = limits.DISCUSSION_TITLE_MAX_LENGTH;
export const DISCUSSION_BODY_MAX_LENGTH = limits.DISCUSSION_BODY_MAX_LENGTH;
export const POLL_TITLE_MAX_LENGTH = limits.POLL_TITLE_MAX_LENGTH;
export const POLL_DESCRIPTION_MAX_LENGTH = limits.POLL_DESCRIPTION_MAX_LENGTH;
export const POLL_QUESTIONS_MAX_COUNT = limits.POLL_QUESTIONS_MAX_COUNT;
export const POLL_QUESTION_TITLE_MAX_LENGTH =
  limits.POLL_QUESTION_TITLE_MAX_LENGTH;
export const POLL_OPTIONS_MAX_COUNT = limits.POLL_OPTIONS_MAX_COUNT;
export const POLL_OPTION_LABEL_MAX_LENGTH = limits.POLL_OPTION_LABEL_MAX_LENGTH;
export const ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH =
  limits.ROOM_ANNOUNCEMENT_TITLE_MAX_LENGTH;
export const ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH =
  limits.ROOM_ANNOUNCEMENT_BODY_MAX_LENGTH;
export const ROOM_MEETING_TITLE_MAX_LENGTH =
  limits.ROOM_MEETING_TITLE_MAX_LENGTH;
export const ROOM_MEETING_DESCRIPTION_MAX_LENGTH =
  limits.ROOM_MEETING_DESCRIPTION_MAX_LENGTH;
export const ROOM_MEETING_LOCATION_TEXT_MAX_LENGTH =
  limits.ROOM_MEETING_LOCATION_TEXT_MAX_LENGTH;
export const ROOM_MEETING_TIMEZONE_MAX_LENGTH =
  limits.ROOM_MEETING_TIMEZONE_MAX_LENGTH;
export const RATING_NOTE_MAX_LENGTH = limits.RATING_NOTE_MAX_LENGTH;
export const COLLECTION_DESCRIPTION_MAX_LENGTH =
  limits.COLLECTION_DESCRIPTION_MAX_LENGTH;
export const CUSTOM_COLLECTIONS_PER_USER_MAX =
  limits.CUSTOM_COLLECTIONS_PER_USER_MAX;
export const COLLECTION_ITEMS_PER_COLLECTION_MAX =
  limits.COLLECTION_ITEMS_PER_COLLECTION_MAX;
export const CATALOG_REVIEW_TITLE_MAX_LENGTH =
  limits.CATALOG_REVIEW_TITLE_MAX_LENGTH;
export const CATALOG_REVIEW_BODY_MAX_LENGTH =
  limits.CATALOG_REVIEW_BODY_MAX_LENGTH;
export const CATALOG_REVIEW_EXCERPT_MAX_LENGTH =
  limits.CATALOG_REVIEW_EXCERPT_MAX_LENGTH;

export const RESERVED_USERNAME_VALUES = [
  '404',
  'account-deletion',
  'acknowledgements',
  'admin',
  'api',
  'assets',
  'catalog',
  'catalog-reviews',
  'collections',
  'cookies',
  'forgot-password',
  'invite-email-refusal',
  'invites',
  'legal',
  'legal-updates',
  'libraries',
  'login',
  'my-library',
  'oauth',
  'pricing',
  'privacy',
  'register',
  'reset-password',
  'rooms',
  'settings',
  'terms',
  'verify-email',
] as const;

const reservedUsernamesSet = new Set<string>(RESERVED_USERNAME_VALUES);

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isReservedUsername(value: string): boolean {
  return reservedUsernamesSet.has(normalizeUsername(value));
}
