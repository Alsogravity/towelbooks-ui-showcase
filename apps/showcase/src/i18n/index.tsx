import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { landingMessages as enLanding } from './messages/en-US/landing';
import { landingMessages as ptLanding } from './messages/pt-BR/landing';
import { pricingMessages as enPricing } from './messages/en-US/pricing';
import { pricingMessages as ptPricing } from './messages/pt-BR/pricing';
import { copy, type CopyKey } from './copy';
export type Locale = 'pt-BR' | 'en-US';
type TranslateOptions = {
  fallback?: string;
  values?: Record<string, string | number>;
};
const messages: Record<Locale, Record<string, string>> = {
  'pt-BR': { ...ptLanding, ...ptPricing },
  'en-US': { ...enLanding, ...enPricing },
};
function useLocaleState() {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, options?: TranslateOptions) => {
        let text = messages[locale][key] ?? options?.fallback ?? key;
        for (const [name, value] of Object.entries(options?.values ?? {}))
          text = text.replaceAll(`{${name}}`, String(value));
        return text;
      },
      ui: (key: CopyKey) => copy[locale][key],
      formatNumber: (value: number) =>
        new Intl.NumberFormat(locale).format(value),
    }),
    [locale],
  );
}
const I18nContext = createContext<ReturnType<typeof useLocaleState> | null>(
  null,
);
export function I18nProvider({ children }: { children: ReactNode }) {
  const value = useLocaleState();
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('I18nProvider required');
  return value;
}
