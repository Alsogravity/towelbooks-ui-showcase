(function () {
  var globalScope = typeof globalThis === 'object' ? globalThis : null;

  if (
    !globalScope ||
    !globalScope.document ||
    !globalScope.document.documentElement
  ) {
    return;
  }

  var localeStorageKey = 'towelbooks-locale';
  var themePreferenceStorageKey = 'towelbooks-theme-preference';

  function isCanonicalAppLocale(value) {
    return value === 'pt-BR' || value === 'en-US';
  }

  function resolveBrowserLocale(value) {
    if (!value) {
      return null;
    }

    var normalizedValue = value.toLowerCase();

    if (normalizedValue === 'pt' || normalizedValue.indexOf('pt-') === 0) {
      return 'pt-BR';
    }

    if (normalizedValue === 'en' || normalizedValue.indexOf('en-') === 0) {
      return 'en-US';
    }

    return null;
  }

  function getBrowserLocales(navigation) {
    if (!navigation) {
      return [];
    }

    var browserLocales = Array.isArray(navigation.languages)
      ? navigation.languages.slice()
      : [];

    if (navigation.language) {
      browserLocales.push(navigation.language);
    }

    return browserLocales;
  }

  function readStorageValue(storage, key) {
    if (!storage || typeof storage.getItem !== 'function') {
      return null;
    }

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  var storedLocale = readStorageValue(
    globalScope.localStorage,
    localeStorageKey,
  );
  var preferredLocale = isCanonicalAppLocale(storedLocale)
    ? storedLocale
    : null;

  if (!preferredLocale) {
    var browserLocales = getBrowserLocales(globalScope.navigator);

    for (var index = 0; index < browserLocales.length; index += 1) {
      preferredLocale = resolveBrowserLocale(browserLocales[index]);

      if (preferredLocale) {
        break;
      }
    }
  }

  if (preferredLocale) {
    globalScope.document.documentElement.lang = preferredLocale;
  }

  var storedThemePreference = readStorageValue(
    globalScope.localStorage,
    themePreferenceStorageKey,
  );
  var prefersDark =
    storedThemePreference === 'dark' ||
    (storedThemePreference !== 'light' &&
      typeof globalScope.matchMedia === 'function' &&
      globalScope.matchMedia('(prefers-color-scheme: dark)').matches);

  if (prefersDark) {
    globalScope.document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
