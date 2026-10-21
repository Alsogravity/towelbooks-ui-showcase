import { isRouteErrorResponse, useRouteError } from 'react-router';

import { Icon } from '../components/primitives';
import {
  ApiProblemPageState,
  getApiProblemRequestId,
  logUnexpectedError,
} from '../features/errors';
import { usePageTitle } from '../hooks/usePageTitle';
import { resolveLocalizedText, useI18n } from '../i18n';

function RouteErrorAction() {
  const { t } = useI18n();

  return (
    <a
      href="/"
      className="vui-button vui-button--primary vui-button--lg no-underline"
    >
      <span className="vui-button__label">{t('errors.page.returnHome')}</span>
    </a>
  );
}

function RouteRetryAction() {
  const { t } = useI18n();

  return (
    <button
      className="vui-button vui-button--secondary vui-button--lg"
      onClick={() => window.location.reload()}
      type="button"
    >
      <span className="vui-button__label">{t('errors.action.retry')}</span>
    </button>
  );
}

function RouteErrorActions() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <RouteRetryAction />
      <RouteErrorAction />
    </div>
  );
}

function RouteUnexpectedErrorState({
  requestId,
}: {
  requestId?: string | null;
}) {
  const { t } = useI18n();
  const reference =
    requestId && requestId !== 'unknown'
      ? requestId
      : t('errors.requestId.unavailable');

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
      <div className="flex flex-col items-center justify-center gap-3 text-ink sm:flex-row">
        <Icon
          className="text-brick"
          name="book-x"
          size={36}
          strokeWidth={1.8}
        />
        <h2 className="app-text-entity-title text-ink">
          {resolveLocalizedText(
            {
              key: 'errors.unexpected.title',
              fallback: 'Something went wrong',
            },
            t,
          )}
        </h2>
      </div>
      <p className="app-text-body mt-6 max-w-xl text-ink-3">
        {resolveLocalizedText(
          {
            key: 'errors.unexpected.body',
            fallback:
              'Try again in a moment. If the problem continues, contact support with the request ID below.',
          },
          t,
        )}
      </p>
      <p className="app-text-supporting-copy mt-5 max-w-xl text-ink-3">
        {t('errors.requestId.label')}{' '}
        <span className="font-mono text-ink">{reference}</span>
      </p>
      <div className="mt-8">
        <RouteErrorActions />
      </div>
    </section>
  );
}

export function RouteErrorBoundary() {
  usePageTitle({ key: 'page.error.title', fallback: 'Something went wrong' });

  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 403 || error.status === 404) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
          <ApiProblemPageState
            action={<RouteErrorAction />}
            className="max-w-md"
            error={{ response: { status: error.status } }}
          />
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
        <RouteUnexpectedErrorState requestId={getApiProblemRequestId(error)} />
      </main>
    );
  }

  if (error instanceof Error) {
    logUnexpectedError({
      error,
      source: 'react-router.error-element',
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <RouteUnexpectedErrorState requestId={getApiProblemRequestId(error)} />
    </main>
  );
}
