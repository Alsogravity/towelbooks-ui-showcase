import {
  COLLECTION_ACCENT_KEYS,
  COLLECTION_ICON_KEYS,
  type CollectionAccentKey,
  type CollectionIconKey,
  type Collection,
  type PublicCollection,
} from '@towelbooks/schemas';

import { Icon, type IconName } from '../../components/primitives';
import type { Translate } from '../../i18n';

export const COLLECTION_ICON_NAME_BY_KEY = {
  reading: 'book-open',
  books: 'library',
  saved: 'bookmark',
  love: 'heart',
} as const satisfies Record<CollectionIconKey, IconName>;

const COLLECTION_ICON_LABEL_KEY_BY_KEY = {
  reading: 'collections.presentation.icon.reading',
  books: 'collections.presentation.icon.books',
  saved: 'collections.presentation.icon.saved',
  love: 'collections.presentation.icon.love',
} as const satisfies Record<CollectionIconKey, string>;

const COLLECTION_ACCENT_LABEL_KEY_BY_KEY = {
  neutral: 'collections.presentation.accent.neutral',
  amber: 'collections.presentation.accent.amber',
  rose: 'collections.presentation.accent.rose',
} as const satisfies Record<CollectionAccentKey, string>;

export const COLLECTION_ACCENT_CLASS_BY_KEY = {
  neutral: {
    border: 'border-rule',
    icon: 'text-ink-3',
    surface: 'bg-vellum/50',
  },
  amber: {
    border: 'border-gold-soft/70',
    icon: 'text-gold',
    surface: 'bg-gold-soft/20',
  },
  rose: {
    border: 'border-brick-soft/70',
    icon: 'text-brick',
    surface: 'bg-brick-soft/20',
  },
} as const satisfies Record<
  CollectionAccentKey,
  { border: string; icon: string; surface: string }
>;

export const COLLECTION_ICON_KEYS_FOR_PICKER = COLLECTION_ICON_KEYS;
export const COLLECTION_ACCENT_KEYS_FOR_PICKER = COLLECTION_ACCENT_KEYS;

type CollectionSummary = Pick<
  Collection | PublicCollection,
  'accentKey' | 'iconKey' | 'name' | 'systemKey'
>;

export function getCollectionName(
  collection: CollectionSummary,
  t: Translate,
): string {
  if (collection.systemKey === 'wishlist') {
    return t('collections.system.wishlist');
  }
  if (collection.systemKey === 'favorites') {
    return t('collections.system.favorites');
  }
  return collection.name?.trim() || t('collections.custom.unnamed');
}

export function getCollectionDescription(
  collection: CollectionSummary,
  t: Translate,
): string | null {
  if (collection.systemKey === 'wishlist') {
    return t('collections.system.description.wishlist');
  }
  if (collection.systemKey === 'favorites') {
    return t('collections.system.description.favorites');
  }
  return null;
}

export function getCollectionIconLabel(
  iconKey: CollectionIconKey,
  t: Translate,
): string {
  return t(COLLECTION_ICON_LABEL_KEY_BY_KEY[iconKey]);
}

export function getCollectionAccentLabel(
  accentKey: CollectionAccentKey,
  t: Translate,
): string {
  return t(COLLECTION_ACCENT_LABEL_KEY_BY_KEY[accentKey]);
}

export function CollectionPresentationIcon({
  accentKey,
  iconKey,
  size = 24,
}: {
  accentKey: CollectionAccentKey;
  iconKey: CollectionIconKey;
  size?: number;
}) {
  return (
    <Icon
      aria-hidden="true"
      className={COLLECTION_ACCENT_CLASS_BY_KEY[accentKey].icon}
      name={COLLECTION_ICON_NAME_BY_KEY[iconKey]}
      size={size}
      strokeWidth={1.7}
    />
  );
}
