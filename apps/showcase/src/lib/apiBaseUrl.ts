const DEV_PROXY_BASE_URL = '/v1';
const DEFAULT_API_BASE_URL = 'http://localhost:4000/v1';
const LOOPBACK_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
]);
const PRODUCTION_API_HOSTNAMES = new Set([
  'api.towelbooks.com',
  'api-staging.towelbooks.com',
]);
const HOSTED_DEPLOY_ENVIRONMENTS = new Set([
  'preview',
  'production',
  'staging',
]);

type ApiBaseUrlEnv = {
  DEV?: boolean;
  PROD?: boolean;
  VITE_API_URL?: string;
  VITE_DEPLOY_ENV?: string;
};

function normalizePathname(pathname: string): string {
  const normalizedPathname = pathname.replace(/\/+$/, '');

  return normalizedPathname.length > 0 ? normalizedPathname : '/';
}

function shouldUseDevProxy(configuredBaseUrl: string): boolean {
  try {
    const parsedUrl = new URL(configuredBaseUrl);

    return (
      LOOPBACK_HOSTNAMES.has(parsedUrl.hostname) &&
      normalizePathname(parsedUrl.pathname) === '/v1'
    );
  } catch {
    return false;
  }
}

export function isAllowedProductionApiBaseUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === 'https:' &&
      PRODUCTION_API_HOSTNAMES.has(parsedUrl.hostname) &&
      parsedUrl.port === '' &&
      parsedUrl.username === '' &&
      parsedUrl.password === '' &&
      parsedUrl.search === '' &&
      parsedUrl.hash === '' &&
      normalizePathname(parsedUrl.pathname) === '/v1'
    );
  } catch {
    return false;
  }
}

export function resolveApiBaseUrl(env: ApiBaseUrlEnv): string {
  const configuredBaseUrl = env.VITE_API_URL?.trim();
  const isProductionBuild = env.PROD === true || env.DEV === false;

  if (isProductionBuild) {
    if (
      !configuredBaseUrl ||
      !isAllowedProductionApiBaseUrl(configuredBaseUrl)
    ) {
      throw new Error(
        'Production web builds require VITE_API_URL to be an approved HTTPS TowelBooks API /v1 endpoint.',
      );
    }

    const parsedUrl = new URL(configuredBaseUrl);
    return `${parsedUrl.origin}/v1`;
  }

  if (!configuredBaseUrl) {
    if (
      env.VITE_DEPLOY_ENV &&
      HOSTED_DEPLOY_ENVIRONMENTS.has(env.VITE_DEPLOY_ENV.trim())
    ) {
      throw new Error(
        'VITE_API_URL must be configured for hosted web deployments.',
      );
    }

    return env.DEV ? DEV_PROXY_BASE_URL : DEFAULT_API_BASE_URL;
  }

  if (env.DEV && shouldUseDevProxy(configuredBaseUrl)) {
    return DEV_PROXY_BASE_URL;
  }

  return configuredBaseUrl;
}
