import type { AppLocale } from '@towelbooks/schemas';

let accessToken: string | null = null;
let requestLocale: AppLocale | null = null;

export const authStore = {
  getToken(): string | null {
    return accessToken;
  },
  setToken(token: string | null): void {
    accessToken = token;
    if (token === null) {
      requestLocale = null;
    }
  },
  getLocale(): AppLocale | null {
    return requestLocale;
  },
  setLocale(locale: AppLocale): void {
    requestLocale = locale;
  },
};
