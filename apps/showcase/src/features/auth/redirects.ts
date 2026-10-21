const loginRedirectParam = 'redirect';

function encodeRedirectParamValue(value: string): string {
  return encodeURIComponent(value).replace(/%2F/g, '/');
}

function normalizeInternalRedirect(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedValue)) {
    return null;
  }

  if (trimmedValue.startsWith('//') || trimmedValue.startsWith('\\')) {
    return null;
  }

  const normalizedValue = trimmedValue.startsWith('/')
    ? trimmedValue
    : `/${trimmedValue}`;

  if (normalizedValue.startsWith('//') || normalizedValue.startsWith('/\\')) {
    return null;
  }

  return normalizedValue;
}

export function buildLoginRedirectPath(returnTo: string): string {
  const normalizedReturnTo = normalizeInternalRedirect(returnTo);

  if (
    normalizedReturnTo === null ||
    normalizedReturnTo === '/' ||
    normalizedReturnTo === '/login'
  ) {
    return '/login';
  }

  return `/login?${loginRedirectParam}=${encodeRedirectParamValue(normalizedReturnTo)}`;
}

type LoginLocationState = {
  from?:
    | string
    | {
        hash?: string;
        pathname?: string;
        search?: string;
      };
};

function resolveReturnToFromState(state: unknown): string | null {
  const from = (state as LoginLocationState | null)?.from;

  if (typeof from === 'string') {
    return normalizeInternalRedirect(from);
  }

  if (from && typeof from === 'object') {
    const pathname = typeof from.pathname === 'string' ? from.pathname : '/';
    const search = typeof from.search === 'string' ? from.search : '';
    const hash = typeof from.hash === 'string' ? from.hash : '';
    const candidate = `${pathname}${search}${hash}`;

    return normalizeInternalRedirect(candidate);
  }

  return null;
}

export function resolvePostLoginRedirect(input: {
  search: string;
  state: unknown;
}): string {
  const searchParams = new URLSearchParams(input.search);
  const redirectParam = searchParams.get(loginRedirectParam);

  if (redirectParam) {
    const normalizedRedirect = normalizeInternalRedirect(redirectParam);

    if (normalizedRedirect) {
      return normalizedRedirect;
    }
  }

  return resolveReturnToFromState(input.state) ?? '/';
}
