import { Component, type ErrorInfo, type ReactNode } from 'react';

import { UnexpectedErrorState } from '../components/feedback';
import { getApiProblemRequestId } from '../features/errors';
import { logUnexpectedError } from '../features/errors';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../i18n';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

function ErrorFallback({ error }: { error: Error | null }) {
  usePageTitle({ key: 'page.error.title', fallback: 'Something went wrong' });
  const { t } = useI18n();

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <UnexpectedErrorState
        className="max-w-md"
        requestId={getApiProblemRequestId(error)}
        title={{
          key: 'errorBoundary.heading',
          fallback: 'Something went wrong',
        }}
        body={{
          key: 'errorBoundary.body',
          fallback:
            'TowelBooks encountered an unexpected error. Return to the library and try again.',
        }}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              className="inline-flex rounded-md border border-ink px-5 py-2 text-sm font-medium text-ink hover:bg-paper-2"
              onClick={() => window.location.reload()}
              type="button"
            >
              {t('errors.action.retry')}
            </button>
            <a
              href="/"
              className="inline-flex rounded-md bg-ink px-5 py-2 text-sm font-medium text-vellum no-underline hover:bg-ink-2"
            >
              {t('errors.page.returnHome')}
            </a>
          </div>
        }
      />
    </main>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logUnexpectedError({
      context: {
        componentStack: errorInfo.componentStack,
      },
      error,
      source: 'react.error-boundary',
    });
  }

  override render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
