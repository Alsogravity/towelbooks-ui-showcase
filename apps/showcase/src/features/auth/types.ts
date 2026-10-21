import type { AppLocale } from '../../i18n';
import type { Avatar } from '@towelbooks/schemas';

export type LocaleMode = 'auto' | 'manual';

export type AuthUser = {
  avatar: Avatar;
  authMethods: {
    google: boolean;
    password: boolean;
  };
  bannerPresetId: string | null;
  bio?: string | null;
  defaultLibraryId: string | null;
  id: string;
  email: string;
  displayName: string | null;
  locale: AppLocale | null;
  localeMode: LocaleMode;
  lastResolvedLocale: AppLocale | null;
  username: string;
};

export type AuthState = {
  bootstrapStatus: 'loading' | 'resolved' | 'unavailable';
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** From login/refresh; drives the legal gate without waiting on /me. */
  hasPendingLegalAcceptances: boolean;
};
