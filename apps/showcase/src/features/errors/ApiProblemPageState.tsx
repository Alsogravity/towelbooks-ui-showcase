import { getApiProblemPageKind } from './handleApiProblem';
import { ErrorState } from '../../components/feedback';

import type { LocalizedText } from '../../i18n';
import type { ReactNode } from 'react';

type ApiProblemPageStateProps = {
  action?: ReactNode;
  body?: LocalizedText;
  className?: string;
  error: unknown;
  fallbackAction?: ReactNode;
  title?: LocalizedText;
};

export function ApiProblemPageState({
  action,
  body = {
    key: 'errors.unexpected.body',
    fallback: 'Try again in a moment.',
  },
  className,
  error,
  fallbackAction,
  title = {
    key: 'errors.unexpected.title',
    fallback: 'Something went wrong',
  },
}: ApiProblemPageStateProps) {
  const pageKind = getApiProblemPageKind(error);

  if (pageKind === 'forbidden') {
    return (
      <ErrorState
        action={action}
        className={className}
        icon="lock"
        title={{
          key: 'errors.page.forbidden.title',
          fallback: 'Access denied',
        }}
        body={{
          key: 'errors.page.forbidden.body',
          fallback: 'You do not have permission to open this page.',
        }}
      />
    );
  }

  if (pageKind === 'not-found') {
    return (
      <ErrorState
        action={action}
        className={className}
        icon="search"
        title={{
          key: 'errors.page.notFound.title',
          fallback: 'Page not found',
        }}
        body={{
          key: 'errors.page.notFound.body',
          fallback:
            'The resource you are looking for is unavailable or no longer exists.',
        }}
      />
    );
  }

  return (
    <ErrorState
      action={fallbackAction ?? action}
      body={body}
      className={className}
      icon="book-x"
      title={title}
    />
  );
}
