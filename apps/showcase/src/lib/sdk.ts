import { createTowelBooksClient } from '@towelbooks/sdk';
import { demoFetch } from '../demo/transport';
import { getInitialLocale } from '../i18n';
export const sdk = createTowelBooksClient({
  baseUrl: 'https://demo.invalid/v1',
  fetchImpl: demoFetch,
  getLocale: getInitialLocale,
});
