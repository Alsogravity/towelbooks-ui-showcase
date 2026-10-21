import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  CATALOG_COVER_ASPECT_CLASS,
  CATALOG_COVER_NATURAL_CONTAINER_CLASS_NAME,
  CATALOG_COVER_NATURAL_IMAGE_SIZE_CLASS_NAME,
} from './catalogCoverLayout';
import {
  isProbablyValidCatalogCoverDimensions,
  resolveCatalogCoverCandidates,
  type CatalogCoverSource,
  type CatalogCoverVariant,
} from './coverImages';

import type { CatalogCoverDelivery } from './catalogCoverDelivery';

export type CatalogCoverImageFit = 'cover' | 'natural';

type CatalogCoverImageProps = {
  alt: string;
  className: string;
  coverDelivery?: CatalogCoverDelivery;
  fallback: ReactNode;
  fit?: CatalogCoverImageFit;
  sources: CatalogCoverSource[];
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

const CATALOG_COVER_LOAD_TIMEOUT_MS = 8_000;
const EMPTY_REJECTED_URLS = new Set<string>();

type CandidateLifecycle = {
  key: string;
};

type CandidateRejectionState = {
  lifecycle: CandidateLifecycle;
  rejectedUrls: Set<string>;
};

type CandidateLoadState = {
  lifecycle: CandidateLifecycle;
  url: string;
};

export function CatalogCoverImage({
  alt,
  className,
  coverDelivery,
  fallback,
  fit = 'cover',
  sources,
}: CatalogCoverImageProps) {
  const preferredVariant: CatalogCoverVariant =
    coverDelivery?.preferredVariant ?? 'detail';
  const candidateEntries = useMemo(() => {
    const seen = new Set<string>();

    return sources
      .flatMap((source) =>
        resolveCatalogCoverCandidates(source, preferredVariant),
      )
      .filter((candidate) => {
        if (seen.has(candidate.url)) {
          return false;
        }

        seen.add(candidate.url);
        return true;
      });
  }, [preferredVariant, sources]);
  const candidateUrls = candidateEntries.map((candidate) => candidate.url);
  const candidateUrlsKey = candidateEntries
    .map(
      ({ coverGeometry: geometry, url }) =>
        `${url}:${geometry ? `${geometry.width}x${geometry.height}` : 'unknown'}`,
    )
    .join('\u0000');
  // Sanitized candidate inputs define the lifecycle, so a genuinely new source
  // set gets fresh failure and loaded state even if a URL later reappears.
  const candidateLifecycle = useMemo<CandidateLifecycle>(
    () => ({ key: candidateUrlsKey }),
    [candidateUrlsKey],
  );
  const [rejectionState, setRejectionState] = useState<CandidateRejectionState>(
    () => ({
      lifecycle: candidateLifecycle,
      rejectedUrls: new Set(),
    }),
  );
  const [loadedState, setLoadedState] = useState<CandidateLoadState | null>(
    null,
  );
  const activeRejectedUrls =
    rejectionState.lifecycle === candidateLifecycle
      ? rejectionState.rejectedUrls
      : EMPTY_REJECTED_URLS;
  const currentCandidate =
    candidateEntries.find(
      (candidate) => !activeRejectedUrls.has(candidate.url),
    ) ?? null;
  const currentUrl = currentCandidate?.url ?? null;
  const currentGeometry = currentCandidate?.coverGeometry ?? null;
  const loadedUrl =
    loadedState?.lifecycle === candidateLifecycle ? loadedState.url : null;
  const isLoaded = loadedUrl === currentUrl;
  const hasActiveCandidate = currentUrl !== null;
  const isMountedRef = useRef(true);
  const candidateLifecycleRef = useRef(candidateLifecycle);
  const currentUrlRef = useRef(currentUrl);

  const rejectCandidate = useCallback(
    (url: string, lifecycle: CandidateLifecycle) => {
      if (
        !isMountedRef.current ||
        candidateLifecycleRef.current !== lifecycle ||
        currentUrlRef.current !== url
      ) {
        return;
      }

      setRejectionState((current) => {
        if (current.lifecycle !== lifecycle) {
          return {
            lifecycle,
            rejectedUrls: new Set([url]),
          };
        }

        if (current.rejectedUrls.has(url)) {
          return current;
        }

        const rejectedUrls = new Set(current.rejectedUrls);
        rejectedUrls.add(url);
        return { lifecycle, rejectedUrls };
      });
      setLoadedState((current) =>
        current?.lifecycle === lifecycle && current.url === url
          ? null
          : current,
      );
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    candidateLifecycleRef.current = candidateLifecycle;
    currentUrlRef.current = currentUrl;
  }, [candidateLifecycle, currentUrl]);

  useEffect(() => {
    if (!hasActiveCandidate || isLoaded || candidateUrls.length === 0) {
      return;
    }

    const timeoutUrl = currentUrl;
    const timeoutLifecycle = candidateLifecycle;
    const timeoutId = window.setTimeout(() => {
      if (
        candidateLifecycleRef.current !== timeoutLifecycle ||
        currentUrlRef.current !== timeoutUrl
      ) {
        return;
      }

      rejectCandidate(timeoutUrl, timeoutLifecycle);
    }, CATALOG_COVER_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    candidateUrls.length,
    candidateLifecycle,
    currentUrl,
    hasActiveCandidate,
    isLoaded,
    rejectCandidate,
  ]);

  const handleLoad = useCallback(
    (image: HTMLImageElement, url: string, lifecycle: CandidateLifecycle) => {
      if (
        !isMountedRef.current ||
        candidateLifecycleRef.current !== lifecycle ||
        currentUrlRef.current !== url
      ) {
        return;
      }

      const resolvedUrl = image.currentSrc || image.src;

      if (resolvedUrl !== url) {
        return;
      }

      if (
        !isProbablyValidCatalogCoverDimensions(
          image.naturalWidth,
          image.naturalHeight,
        )
      ) {
        rejectCandidate(url, lifecycle);
        return;
      }

      setLoadedState((current) => {
        if (
          !isMountedRef.current ||
          candidateLifecycleRef.current !== lifecycle ||
          currentUrlRef.current !== url
        ) {
          return current;
        }

        return { lifecycle, url };
      });
    },
    [rejectCandidate],
  );

  if (currentUrl === null) {
    return <>{fallback}</>;
  }

  if (fit === 'natural') {
    return (
      <div className={CATALOG_COVER_NATURAL_CONTAINER_CLASS_NAME}>
        {!isLoaded ? (
          <div
            aria-hidden="true"
            className={classNames(
              !currentGeometry && CATALOG_COVER_ASPECT_CLASS,
              'w-full app-shimmer',
            )}
            style={
              currentGeometry
                ? {
                    aspectRatio: `${currentGeometry.width} / ${currentGeometry.height}`,
                  }
                : undefined
            }
          />
        ) : null}
        <img
          alt={alt}
          className={classNames(
            'transition-opacity duration-300 ease-out',
            isLoaded
              ? classNames(
                  CATALOG_COVER_NATURAL_IMAGE_SIZE_CLASS_NAME,
                  className,
                  'relative opacity-100',
                )
              : 'absolute inset-0 h-full w-full object-contain opacity-0',
          )}
          key={currentUrl}
          decoding={coverDelivery?.decoding}
          fetchPriority={coverDelivery?.fetchPriority}
          loading={coverDelivery?.loading}
          onError={() => {
            rejectCandidate(currentUrl, candidateLifecycle);
          }}
          onLoad={(event) => {
            handleLoad(event.currentTarget, currentUrl, candidateLifecycle);
          }}
          src={currentUrl}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded ? (
        <div aria-hidden="true" className="absolute inset-0">
          <div className="h-full w-full app-shimmer" />
        </div>
      ) : null}
      <img
        alt={alt}
        className={classNames(
          className,
          'transition-opacity duration-300 ease-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
        key={currentUrl}
        decoding={coverDelivery?.decoding}
        fetchPriority={coverDelivery?.fetchPriority}
        loading={coverDelivery?.loading}
        onError={() => {
          rejectCandidate(currentUrl, candidateLifecycle);
        }}
        onLoad={(event) => {
          handleLoad(event.currentTarget, currentUrl, candidateLifecycle);
        }}
        src={currentUrl}
      />
    </div>
  );
}
