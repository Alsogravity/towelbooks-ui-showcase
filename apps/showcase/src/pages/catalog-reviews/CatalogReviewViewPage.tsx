import { useQuery } from '@tanstack/react-query';
import { ApiRequestError } from '@towelbooks/sdk';
import { Link, useLocation, useParams } from 'react-router';

import { LoadingState } from '../../components/feedback';
import {
  PageContainer,
  PageHeader,
  PageShell,
  PageStateShell,
} from '../../components/layout';
import { Button, ButtonLink } from '../../components/primitives';
import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { useAuth } from '../../features/auth/AuthContext';
import {
  buildCatalogReviewBackHref,
  buildCatalogReviewLocationState,
  catalogReviewOriginFromLocationState,
} from '../../features/catalog-reviews/catalogReviewNavigation';
import { CommentsSection } from '../../features/comments/comments-panel/CommentsSection';
import { ApiProblemPageState } from '../../features/errors';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { UserAvatar } from '../../entities/user/ui';
import { buildCatalogReviewExcerpt } from '@towelbooks/schemas';
import { sdk } from '../../lib/sdk';
import {
  INDEXABLE_ROBOTS_DIRECTIVE,
  NON_INDEXABLE_ROBOTS_DIRECTIVE,
} from '../../lib/documentMetadata';
import { NotFoundPage } from '../NotFoundPage';

export function CatalogReviewViewPage() {
  const { catalogReviewId } = useParams<{ catalogReviewId: string }>();

  if (!catalogReviewId) {
    return <NotFoundPage />;
  }

  return <CatalogReviewViewRoute catalogReviewId={catalogReviewId} />;
}

function CatalogReviewViewRoute({
  catalogReviewId,
}: {
  catalogReviewId: string;
}) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { formatDate, t } = useI18n();
  const location = useLocation();
  const origin = catalogReviewOriginFromLocationState(location.state);
  const reflectionQuery = useQuery({
    enabled: !isAuthLoading,
    queryKey: [
      'catalog-reviews',
      catalogReviewId,
      'read',
      isAuthenticated ? 'viewer-aware' : 'public',
    ],
    queryFn: () => sdk.catalogReviews.get(catalogReviewId),
  });

  usePageTitle(
    reflectionQuery.data?.title ?? { key: 'catalog.catalogReviewView.title' },
  );
  useDocumentMetadata({
    canonicalPath: `/catalog-reviews/${encodeURIComponent(catalogReviewId)}`,
    description: reflectionQuery.data
      ? {
          key: 'catalog.catalogReviewView.metaDescription',
          values: {
            author:
              reflectionQuery.data.author.displayName?.trim() ||
              `@${reflectionQuery.data.author.username}`,
            excerpt:
              buildCatalogReviewExcerpt(reflectionQuery.data.body) ??
              t('catalog.catalogReviewView.metaFallback'),
            title: reflectionQuery.data.title,
          },
        }
      : { key: 'catalog.catalogReviewView.metaFallback' },
    robots:
      reflectionQuery.data && !isAuthenticated
        ? INDEXABLE_ROBOTS_DIRECTIVE
        : NON_INDEXABLE_ROBOTS_DIRECTIVE,
    shareTitle: reflectionQuery.data
      ? {
          key: 'catalog.catalogReviewView.metaTitle',
          values: { title: reflectionQuery.data.title },
        }
      : { key: 'catalog.catalogReviewView.title' },
  });

  if (isAuthLoading || reflectionQuery.isLoading) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState label={t('catalog.catalogReviewView.loading')} />
      </PageStateShell>
    );
  }

  if (reflectionQuery.error) {
    if (
      reflectionQuery.error instanceof ApiRequestError &&
      reflectionQuery.error.status === 404
    ) {
      return <NotFoundPage />;
    }

    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={reflectionQuery.error}
          title={{ key: 'catalog.catalogReviewView.error.loadTitle' }}
          body={{ key: 'catalog.catalogReviewView.error.loadBody' }}
          fallbackAction={
            <Button
              variant="secondary"
              onClick={() => void reflectionQuery.refetch()}
            >
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink
              to={
                origin?.kind === 'profile-reviews'
                  ? buildCatalogReviewBackHref('', origin)
                  : '/catalog-reviews'
              }
              variant="secondary"
            >
              {origin?.kind === 'profile-reviews'
                ? t('catalog.catalogReviewNavigation.backToProfileReviews')
                : t('catalog.catalogReviewNavigation.backToDiscovery')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  if (!reflectionQuery.data) {
    return <NotFoundPage />;
  }

  const reflection = reflectionQuery.data;
  const backHref = buildCatalogReviewBackHref(reflection.catalogWorkId, origin);
  const backLabel =
    origin?.kind === 'catalog-review-discovery'
      ? t('catalog.catalogReviewNavigation.backToDiscovery')
      : origin?.kind === 'profile-reviews'
        ? t('catalog.catalogReviewNavigation.backToProfileReviews')
        : origin
          ? t('catalog.catalogReviewNavigation.backToLibraryItem')
          : t('catalog.catalogReviewNavigation.backToReviews');
  const reviewHref = `/catalog-reviews/${encodeURIComponent(catalogReviewId)}`;
  const editHref = `${reviewHref}/edit`;
  const isAuthor = user?.id === reflection.authorUserId;
  const authorName =
    reflection.author.displayName?.trim() || `@${reflection.author.username}`;

  return (
    <PageShell background="paper" minHeight>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-vellum to-paper opacity-50" />
      <PageContainer size="comfortable" className="space-y-8 pb-24">
        <PageHeader
          backHref={backHref}
          backLabel={backLabel}
          title={reflection.title}
        />

        {isAuthor ? (
          <div className="flex justify-end">
            <ButtonLink
              state={buildCatalogReviewLocationState(origin)}
              to={editHref}
              variant="secondary"
            >
              {t('catalog.catalogReviewView.edit')}
            </ButtonLink>
          </div>
        ) : null}

        <article className="mx-auto max-w-3xl space-y-8">
          <header className="space-y-5">
            <div className="space-y-2">
              <p className="app-text-metadata uppercase tracking-[0.16em] text-ink-4">
                {t('catalog.catalogReviewView.eyebrow')}
              </p>
              <h2 className="text-h1 break-words font-semibold text-ink lg:hidden">
                {reflection.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-3">
              <Link
                aria-label={t('catalog.catalogReviewView.authorLink', {
                  values: { username: reflection.author.username },
                })}
                className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
                to={`/${encodeURIComponent(reflection.author.username)}`}
              >
                <UserAvatar
                  avatar={reflection.author.avatar}
                  displayName={authorName}
                  size="sm"
                />
                <span className="text-brick hover:underline">{authorName}</span>
                <span className="text-ink-4">
                  @{reflection.author.username}
                </span>
              </Link>
              <span aria-hidden>·</span>
              <time dateTime={reflection.publishedAt}>
                {t('catalog.catalogReviewView.publishedOn', {
                  values: { date: formatDate(reflection.publishedAt) },
                })}
              </time>
            </div>
          </header>

          <div className="space-y-4 border-y border-rule/70 py-5 text-sm text-ink-3">
            <Link
              className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1 rounded-sm text-brick underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2"
              to={`/catalog/${encodeURIComponent(reflection.catalogWorkId)}`}
            >
              <span className="font-semibold">{reflection.target.title}</span>
              {reflection.target.subtitle ? (
                <span>· {reflection.target.subtitle}</span>
              ) : null}
            </Link>
            {reflection.catalogEditionId ? (
              <p>{t('catalog.catalogReviewView.editionSpecific')}</p>
            ) : null}
          </div>

          <div
            className="text-xl leading-relaxed text-ink-2 dropcap whitespace-pre-wrap"
            data-testid="catalog-review-body"
          >
            {reflection.body.trim()}
          </div>
        </article>

        <CommentsSection
          copy={{
            composerBodyLabel: {
              key: 'catalog.catalogReviewView.comments.composerBodyLabel',
            },
            composerPlaceholder: {
              key: 'catalog.catalogReviewView.comments.composerPlaceholder',
            },
            composerSubmit: {
              key: 'catalog.catalogReviewView.comments.composerSubmit',
            },
            composerSubmitting: {
              key: 'catalog.catalogReviewView.comments.composerSubmitting',
            },
            emptyBody: {
              key: 'catalog.catalogReviewView.comments.emptyBody',
            },
            emptyTitle: {
              key: 'catalog.catalogReviewView.comments.emptyTitle',
            },
            loginAction: {
              key: 'catalog.catalogReviewView.comments.loginAction',
            },
            loginBody: {
              key: 'catalog.catalogReviewView.comments.loginBody',
            },
            title: {
              key: 'catalog.catalogReviewView.comments.title',
            },
          }}
          headingId={`catalog-review-comments-title-${catalogReviewId}`}
          queryKeyPrefix={['catalog-reviews', catalogReviewId, 'comments']}
          targetId={catalogReviewId}
          targetType="catalog_review"
        />
      </PageContainer>
    </PageShell>
  );
}
