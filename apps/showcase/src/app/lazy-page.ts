import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export type PreloadableLazyPage = LazyExoticComponent<ComponentType> & {
  preload: () => Promise<void>;
};

/**
 * Lazy-load a named page export for route-level code splitting.
 * Pages use named exports; React.lazy expects a default export.
 */
export function lazyNamedPage<TModule extends Record<string, unknown>>(
  factory: () => Promise<TModule>,
  exportName: keyof TModule & string,
): PreloadableLazyPage {
  let loadPromise: Promise<{ default: ComponentType }> | undefined;

  async function loadModule(): Promise<TModule> {
    try {
      return await factory();
    } catch {
      // A transient chunk request failure should not strand the current route.
      // Keep the retry bounded so a permanently missing deployment chunk fails
      // into the route error boundary instead of looping forever.
      return factory();
    }
  }

  const load = () => {
    if (!loadPromise) {
      loadPromise = loadModule().then((mod) => {
        const Component = mod[exportName];
        if (typeof Component !== 'function') {
          throw new Error(`lazyNamedPage: missing export "${exportName}"`);
        }

        return { default: Component as ComponentType };
      });
    }

    return loadPromise;
  };

  const LazyPage = lazy(load);

  return Object.assign(LazyPage, {
    preload: async () => {
      await load();
    },
  });
}
