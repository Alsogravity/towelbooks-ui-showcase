import { z } from 'zod';

export const APP_LOCALES = ['pt-BR', 'en-US'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const appLocaleSchema = z.enum(APP_LOCALES);

export const DEFAULT_APP_LOCALE: AppLocale = 'pt-BR';
