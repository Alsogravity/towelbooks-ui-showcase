import {
  DEFAULT_APP_LOCALE,
  type AppLocale,
  type TranslationValues,
} from './locales';
import { messagesByLocale, type MessageKey } from './messages';

export type TranslationSegment = {
  emphasis: boolean;
  key?: string;
  text: string;
};

const placeholderPattern = /\{(\w+)\}/g;

export function buildTranslationSegments(
  template: string,
  values: TranslationValues | undefined,
  emphasisKeys: readonly string[],
): TranslationSegment[] {
  const emphasisSet = new Set(emphasisKeys);
  const segments: TranslationSegment[] = [];
  let lastIndex = 0;

  for (const match of template.matchAll(placeholderPattern)) {
    const matchIndex = match.index ?? 0;

    if (matchIndex > lastIndex) {
      segments.push({
        emphasis: false,
        text: template.slice(lastIndex, matchIndex),
      });
    }

    const key = match[1]!;
    segments.push({
      emphasis: emphasisSet.has(key),
      key,
      text: values?.[key] !== undefined ? String(values[key]) : '',
    });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < template.length) {
    segments.push({
      emphasis: false,
      text: template.slice(lastIndex),
    });
  }

  return segments;
}

function resolveMessageTemplate(
  locale: AppLocale,
  key: string,
  fallback?: string,
): string {
  return (
    messagesByLocale[locale][key as MessageKey] ??
    messagesByLocale[DEFAULT_APP_LOCALE][key as MessageKey] ??
    fallback ??
    key
  );
}

export function buildLocalizedSegments(
  locale: AppLocale,
  key: string,
  values: TranslationValues,
  emphasisKeys: readonly string[],
  fallback?: string,
): TranslationSegment[] {
  const template = resolveMessageTemplate(locale, key, fallback);

  return buildTranslationSegments(template, values, emphasisKeys);
}
