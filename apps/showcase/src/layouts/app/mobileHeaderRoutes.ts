import { matchPath } from 'react-router';

export interface MobileSearchRouteConfig {
  queryParam: string;
  resetParams: string[];
}

export interface MobileHeaderRouteConfig {
  primaryAction:
    'create-room' | 'open-notifications' | 'search' | 'share-room' | 'none';
  search: MobileSearchRouteConfig | null;
  trailingAction: 'create-book' | 'create-room' | 'open-room-settings' | 'none';
}

interface MobileHeaderRouteMatcher {
  config: MobileHeaderRouteConfig;
  matches: (pathname: string) => boolean;
}

const catalogMobileSearchConfig: MobileSearchRouteConfig = {
  queryParam: 'q',
  resetParams: ['page'],
};

const roomsMobileSearchConfig: MobileSearchRouteConfig = {
  queryParam: 'q',
  resetParams: ['page'],
};

const defaultMobileHeaderRouteConfig: MobileHeaderRouteConfig = {
  primaryAction: 'none',
  search: null,
  trailingAction: 'none',
};

const mobileHeaderRoutes: MobileHeaderRouteMatcher[] = [
  {
    config: {
      primaryAction: 'open-notifications',
      search: null,
      trailingAction: 'none',
    },
    matches: (pathname) =>
      matchPath({ path: '/', end: true }, pathname) !== null,
  },
  {
    config: {
      primaryAction: 'search',
      search: roomsMobileSearchConfig,
      trailingAction: 'create-room',
    },
    matches: (pathname) =>
      matchPath({ path: '/rooms', end: true }, pathname) !== null,
  },
  {
    config: {
      primaryAction: 'share-room',
      search: null,
      trailingAction: 'open-room-settings',
    },
    matches: (pathname) =>
      matchPath({ path: '/rooms/:roomId', end: true }, pathname) !== null,
  },
  {
    config: {
      primaryAction: 'search',
      search: catalogMobileSearchConfig,
      trailingAction: 'create-book',
    },
    matches: (pathname) =>
      matchPath({ path: '/catalog', end: true }, pathname) !== null,
  },
];

export function getMobileHeaderRouteConfig(pathname: string) {
  return (
    mobileHeaderRoutes.find((routeConfig) => routeConfig.matches(pathname))
      ?.config ?? defaultMobileHeaderRouteConfig
  );
}

export function getMobileSearchQuery(
  config: MobileSearchRouteConfig | null,
  searchParams: URLSearchParams,
) {
  if (config === null) {
    return '';
  }

  return searchParams.get(config.queryParam)?.trim() ?? '';
}

export function buildMobileSearchParams(
  config: MobileSearchRouteConfig,
  previousParams: URLSearchParams,
  query: string,
) {
  const nextParams = new URLSearchParams(previousParams);

  if (query.length > 0) {
    nextParams.set(config.queryParam, query);
  } else {
    nextParams.delete(config.queryParam);
  }

  for (const param of config.resetParams) {
    nextParams.delete(param);
  }

  return nextParams;
}
