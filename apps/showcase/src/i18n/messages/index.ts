import { ptBRMessages } from './pt-BR';

import type { AppLocale } from '../locales';

export { ptBRMessages };

export type MessageKey = keyof typeof ptBRMessages;

type MessageCatalog = Record<MessageKey, string>;

/**
 * Runtime catalogs. `pt-BR` (default product locale) is eager; `en-US` loads on
 * demand via {@link ensureLocaleMessages} so cold starts do not pay for both.
 */
const loadedCatalogs: Partial<Record<AppLocale, MessageCatalog>> = {
  'pt-BR': ptBRMessages,
};

const catalogLoadPromises: Partial<Record<AppLocale, Promise<void>>> = {};

/**
 * Translate helpers read from here. Until `en-US` loads, it aliases `pt-BR` so
 * lookups never see undefined catalogs.
 */
export const messagesByLocale: Record<AppLocale, MessageCatalog> = {
  'pt-BR': ptBRMessages,
  'en-US': ptBRMessages,
};

export function isLocaleCatalogLoaded(locale: AppLocale): boolean {
  return loadedCatalogs[locale] != null;
}

export function ensureLocaleMessages(locale: AppLocale): Promise<void> {
  if (loadedCatalogs[locale]) {
    return Promise.resolve();
  }

  const existingLoad = catalogLoadPromises[locale];
  if (existingLoad) {
    return existingLoad;
  }

  if (locale !== 'en-US') {
    return Promise.resolve();
  }

  let trackedLoad: Promise<void>;
  trackedLoad = import('./en-US')
    .then(({ enMessages }) => {
      loadedCatalogs['en-US'] = enMessages;
      messagesByLocale['en-US'] = enMessages;
    })
    .finally(() => {
      if (catalogLoadPromises[locale] === trackedLoad) {
        delete catalogLoadPromises[locale];
      }
    });
  catalogLoadPromises[locale] = trackedLoad;

  return trackedLoad;
}

/** Test helper: load English without importing it into the app shell graph. */
export async function loadEnMessages(): Promise<MessageCatalog> {
  await ensureLocaleMessages('en-US');
  return messagesByLocale['en-US'];
}

/** Sync register for test helpers (e.g. `renderWithLocale({ locale: 'en-US' })`). */
export function registerLocaleMessagesForTests(
  locale: AppLocale,
  catalog: MessageCatalog,
): void {
  loadedCatalogs[locale] = catalog;
  messagesByLocale[locale] = catalog;
}
