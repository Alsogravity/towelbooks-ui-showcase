import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Outlet, useLocation } from 'react-router';

import { useI18n } from '../i18n';
import {
  applyDocumentMetadata,
  resolveDocumentMetadata,
  type DocumentMetadataOverride,
} from '../lib/documentMetadata';

type DocumentMetadataRegistry = {
  register: (override: DocumentMetadataOverride) => () => void;
  setPathname: (pathname: string) => void;
};

const noop = () => undefined;
const noopPathname = () => undefined;

// A no-op default keeps `useDocumentMetadata` safe when a component is rendered
// in isolation (e.g. unit tests) without the provider.
const DocumentMetadataContext = createContext<DocumentMetadataRegistry>({
  register: () => noop,
  setPathname: noopPathname,
});

/**
 * Owns document metadata (description, Open Graph, Twitter) as a registry of
 * route-declared overrides layered over brand defaults. Routes that declare
 * nothing fall back to the defaults; when an overriding route unmounts its
 * entry is removed and the defaults are re-applied — so metadata never leaks
 * from one route onto the next.
 */
export function DocumentMetadataProvider({ children }: PropsWithChildren) {
  const { locale, t } = useI18n();
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  );
  const [overrides, setOverrides] = useState<
    readonly DocumentMetadataOverride[]
  >([]);

  const register = useCallback((override: DocumentMetadataOverride) => {
    setOverrides((current) => [...current, override]);

    return () => {
      setOverrides((current) => current.filter((entry) => entry !== override));
    };
  }, []);

  useEffect(() => {
    const merged = overrides.reduce<DocumentMetadataOverride>(
      (accumulator, override) => ({ ...accumulator, ...override }),
      {},
    );

    applyDocumentMetadata(resolveDocumentMetadata(merged, t, locale, pathname));
  }, [locale, overrides, pathname, t]);

  const value = useMemo<DocumentMetadataRegistry>(
    () => ({ register, setPathname }),
    [register, setPathname],
  );

  return (
    <DocumentMetadataContext.Provider value={value}>
      {children}
    </DocumentMetadataContext.Provider>
  );
}

/**
 * Keeps the provider's document metadata in sync with client-side route
 * transitions. The provider itself intentionally wraps RouterProvider, so a
 * small pathless route boundary bridges React Router's location context.
 */
export function DocumentMetadataRouteSync() {
  const { pathname } = useLocation();
  const { setPathname } = useContext(DocumentMetadataContext);

  useEffect(() => {
    setPathname(pathname);
  }, [pathname, setPathname]);

  return <Outlet />;
}

/**
 * Declare the active route's document metadata. Omitted fields inherit the
 * brand defaults. The override is keyed by its serialized content so it is
 * registered once and only re-applied when the declared values change.
 */
export function useDocumentMetadata(override: DocumentMetadataOverride) {
  const { register } = useContext(DocumentMetadataContext);
  const serializedOverride = JSON.stringify(override);

  useEffect(() => {
    return register(JSON.parse(serializedOverride) as DocumentMetadataOverride);
  }, [register, serializedOverride]);
}
