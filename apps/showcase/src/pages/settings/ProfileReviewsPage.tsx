import { useQuery } from '@tanstack/react-query';
import { ApiRequestError } from '@towelbooks/sdk';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';

import { getProfilePath, getProfileReviewsPath } from '../../app/profileRoutes';
import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { LoadingState, EmptyState } from '../../components/feedback';
import {
  PageContainer,
  PageHeader,
  PageShell,
  PageStateShell,
} from '../../components/layout';
import { Button, ButtonLink, Alert } from '../../components/primitives';
import { ProfileCatalogReviewCard } from '../../components/profile/stats/panels/ProfileCatalogReviewCard';
import { buildLoginRedirectPath } from '../../features/auth/redirects';
import { useAuth } from '../../features/auth/AuthContext';
import {
  PROFILE_CATALOG_REVIEWS_PAGE_LIMIT,
  useProfileCatalogReviews,
} from '../../features/profile/useProfileCatalogReviews';
import { ApiProblemPageState } from '../../features/errors';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import {
  INDEXABLE_ROBOTS_DIRECTIVE,
  NON_INDEXABLE_ROBOTS_DIRECTIVE,
} from '../../lib/documentMetadata';
import { NotFoundPage } from '../NotFoundPage';

export function ProfileReviewsPage() {
  const { username: routeUsername } = useParams<{ username: string }>();

  if (!routeUsername) {
    return <NotFoundPage />;
  }

  return <ProfileReviewsRoute routeUsername={routeUsername} />;
}

function ProfileReviewsRoute({ routeUsername }: { routeUsername: string }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const profileQuery = useQuery({
    enabled: !isAuthLoading,
    queryKey: ['profiles', routeUsername],
    queryFn: () => sdk.users.getProfile(routeUsername),
  });
  const profile = profileQuery.data?.profile;
  const canViewContent = profileQuery.data?.access.canViewContent ?? false;
  const profileReviewsPath = getProfileReviewsPath(routeUsername);
  const pageUsername = profile?.username ?? routeUsername;
  const pageTitle = useMemo(
    () =>
      t('profile.reviews.title', {
        values: { username: `@${pageUsername}` },
      }),
    [pageUsername, t],
  );
  const pageDescription = t('profile.reviews.description', {
    values: { username: `@${pageUsername}` },
  });

  usePageTitle(pageTitle);
  useDocumentMetadata({
    canonicalPath: profileReviewsPath,
    description: {
      key: canViewContent
        ? 'profile.reviews.metaDescription'
        : 'profile.reviews.metaFallback',
      values: { username: `@${pageUsername}` },
    },
    robots:
      !profileQuery.isFetching &&
      profileQuery.data?.access.visibility === 'public' &&
      canViewContent
        ? INDEXABLE_ROBOTS_DIRECTIVE
        : NON_INDEXABLE_ROBOTS_DIRECTIVE,
    shareTitle: pageTitle,
  });

  const reviewsQuery = useProfileCatalogReviews({
    enabled: canViewContent,
    limit: PROFILE_CATALOG_REVIEWS_PAGE_LIMIT,
    username: pageUsername,
  });
  const reviews = reviewsQuery.items;
  const isReviewContentLoading =
    reviewsQuery.isLoading ||
    (reviewsQuery.isFetching && !reviewsQuery.isFetchingNextPage);
  const backToProfilePath = getProfilePath({ username: pageUsername });
  const backToProfileLabel = t('profile.reviews.backToProfile');

  if (isAuthLoading || profileQuery.isFetching) {
    return (
      <PageStateShell containerSize="comfortable">
        <LoadingState label={t('profile.reviews.loading')} />
      </PageStateShell>
    );
  }

  if (profileQuery.error) {
    if (
      profileQuery.error instanceof ApiRequestError &&
      profileQuery.error.status === 404
    ) {
      return <NotFoundPage />;
    }

    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={profileQuery.error}
          title={{ key: 'profile.page.error.loadTitle' }}
          body={{ key: 'profile.page.error.loadBody' }}
          fallbackAction={
            <Button
              variant="secondary"
              onClick={() => void profileQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/" variant="secondary">
              {t('errors.page.backToLibrary')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  if (!profileQuery.data || !profile) {
    return <NotFoundPage />;
  }

  if (!canViewContent) {
    return (
      <PageStateShell containerSize="narrow">
        <div className="space-y-4 text-center">
          <h1 className="app-text-section-title text-ink">
            {t('profile.locked.title')}
          </h1>
          <p className="app-text-body text-ink-2">{t('profile.locked.body')}</p>
          {!isAuthenticated ? (
            <ButtonLink
              to={buildLoginRedirectPath(
                `${location.pathname}${location.search}${location.hash}`,
              )}
              variant="secondary"
            >
              {t('profile.locked.loginAction')}
            </ButtonLink>
          ) : null}
        </div>
      </PageStateShell>
    );
  }

  if (isReviewContentLoading) {
    return (
      <ProfileReviewsContentLoading
        backToProfileLabel={backToProfileLabel}
        backToProfilePath={backToProfilePath}
        pageDescription={pageDescription}
        pageTitle={pageTitle}
      />
    );
  }

  if (reviewsQuery.error && reviews.length === 0) {
    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={reviewsQuery.error}
          title={{ key: 'profile.reviews.error.loadTitle' }}
          body={{ key: 'profile.reviews.error.loadBody' }}
          fallbackAction={
            <Button
              variant="secondary"
              onClick={() => void reviewsQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to={backToProfilePath} variant="secondary">
              {backToProfileLabel}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  return (
    <PageShell background="paper" minHeight>
      <PageContainer size="comfortable" className="flex min-w-0 flex-col gap-8">
        <PageHeader
          backHref={backToProfilePath}
          backLabel={backToProfileLabel}
          description={pageDescription}
          title={pageTitle}
        />
        <header className="space-y-3 lg:hidden">
          <ButtonLink
            aria-label={backToProfileLabel}
            to={backToProfilePath}
            variant="ghost"
            prependIcon="chevron-left"
          >
            {backToProfileLabel}
          </ButtonLink>
          <div className="space-y-2">
            <h1 className="app-text-page-title text-ink">{pageTitle}</h1>
            <p className="app-text-page-description text-ink-2">
              {pageDescription}
            </p>
          </div>
        </header>

        {reviews.length === 0 ? (
          <EmptyState
            body={{ key: 'profile.reviews.emptyBody' }}
            icon="feather"
            title={{ key: 'profile.reviews.emptyTitle' }}
          />
        ) : (
          <div className="space-y-4" aria-live="polite">
            {reviews.map((review) => (
              <ProfileCatalogReviewCard
                key={review.id}
                item={review}
                profileUsername={pageUsername}
              />
            ))}

            {reviewsQuery.isFetchNextPageError ? (
              <Alert variant="error">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{t('profile.reviews.error.loadMore')}</span>
                  <Button
                    variant="secondary"
                    onClick={() => void reviewsQuery.fetchNextPage()}
                  >
                    {t('errors.action.retry')}
                  </Button>
                </div>
              </Alert>
            ) : null}

            {reviewsQuery.hasNextPage ? (
              <div className="flex justify-center pt-4">
                <Button
                  isLoading={reviewsQuery.isFetchingNextPage}
                  loadingLabel={t('profile.reviews.loadingMore')}
                  variant="secondary"
                  onClick={() => void reviewsQuery.fetchNextPage()}
                >
                  {t('profile.reviews.loadMore')}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </PageContainer>
    </PageShell>
  );
}

function ProfileReviewsContentLoading({
  backToProfileLabel,
  backToProfilePath,
  pageDescription,
  pageTitle,
}: {
  backToProfileLabel: string;
  backToProfilePath: string;
  pageDescription: string;
  pageTitle: string;
}) {
  const { t } = useI18n();

  return (
    <PageShell background="paper" minHeight>
      <PageContainer size="comfortable" className="flex min-w-0 flex-col gap-8">
        <PageHeader
          backHref={backToProfilePath}
          backLabel={backToProfileLabel}
          description={pageDescription}
          title={pageTitle}
        />
        <header className="space-y-3 lg:hidden">
          <ButtonLink
            aria-label={backToProfileLabel}
            to={backToProfilePath}
            variant="ghost"
            prependIcon="chevron-left"
          >
            {backToProfileLabel}
          </ButtonLink>
          <div className="space-y-2">
            <h1 className="app-text-page-title text-ink">{pageTitle}</h1>
            <p className="app-text-page-description text-ink-2">
              {pageDescription}
            </p>
          </div>
        </header>
        <LoadingState label={t('profile.reviews.loading')} />
      </PageContainer>
    </PageShell>
  );
}
