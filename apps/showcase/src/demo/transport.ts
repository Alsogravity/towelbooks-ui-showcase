import { ZodError } from 'zod';
import { DemoProblem } from './problem';
import { handleRequest } from './requests';
export { state } from './state';
export const demoFetch: typeof fetch = async (input, init) => {
  const url = new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
  );
  if (url.origin !== 'https://demo.invalid')
    throw new Error('External requests are unavailable in the demo.');
  const body: unknown =
    typeof init?.body === 'string' ? JSON.parse(init.body) : null;
  const path = url.pathname.replace(/^\/v1/, '');
  const method = init?.method ?? 'GET';
  if (
    (path === '/me' && method === 'DELETE') ||
    path.includes('/auth/') ||
    path.includes('/password') ||
    path.includes('upload') ||
    path.includes('/privacy/export') ||
    path.includes('/account-deletion') ||
    path.startsWith('/admin/')
  ) {
    return Response.json(
      {
        type: 'about:blank',
        title: 'Unavailable in this portfolio demo',
        status: 403,
        code: 'FORBIDDEN',
      },
      { status: 403 },
    );
  }
  try {
    const result = handleRequest(path, method, url.searchParams, body);
    if (result === undefined) return new Response(null, { status: 204 });
    return Response.json(result);
  } catch (error) {
    const status =
      error instanceof DemoProblem
        ? error.status
        : error instanceof ZodError
          ? 422
          : 403;
    const code =
      error instanceof DemoProblem
        ? error.code
        : error instanceof ZodError
          ? 'VALIDATION_FAILED'
          : 'FORBIDDEN';
    return Response.json(
      {
        type: 'about:blank',
        title: 'Unavailable in this portfolio demo',
        status,
        code,
      },
      { status },
    );
  }
};
