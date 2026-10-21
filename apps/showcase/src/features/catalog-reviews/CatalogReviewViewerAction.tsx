import { Button, ButtonLink, Tag } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { useIsBelowSmViewport } from '../../layouts/app/shellViewport';

import type { CatalogReviewOrigin } from './catalogReviewNavigation';
import type { IconName } from '@towelbooks/ui';
import type { ReactNode } from 'react';

type CatalogReviewViewerActionLayout = 'inline' | 'sectionHeader';

export interface CatalogReviewViewerActionProps {
  catalogWorkId: string;
  hasViewerReviewError: boolean;
  isAuthenticated: boolean;
  isViewerCatalogReviewPending: boolean;
  layout?: CatalogReviewViewerActionLayout;
  origin?: CatalogReviewOrigin | null;
  showPublishedAction?: boolean;
  viewerCatalogReview: { id: string; status: 'draft' | 'published' } | null;
}

function ActionFrame({
  children,
  layout,
}: {
  children: ReactNode;
  layout: CatalogReviewViewerActionLayout;
}) {
  return layout === 'sectionHeader' ? (
    <>{children}</>
  ) : (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {children}
    </div>
  );
}

export function CatalogReviewViewerAction({
  catalogWorkId,
  hasViewerReviewError,
  isAuthenticated,
  isViewerCatalogReviewPending,
  layout = 'inline',
  origin = null,
  showPublishedAction = false,
  viewerCatalogReview,
}: CatalogReviewViewerActionProps) {
  const { t } = useI18n();
  const isBelowSmViewport = useIsBelowSmViewport();
  const locationState = origin ? { origin } : undefined;
  const isSectionHeader = layout === 'sectionHeader';

  function renderButtonLink({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: IconName;
    label: string;
  }) {
    return isSectionHeader && isBelowSmViewport ? (
      <ButtonLink
        aria-label={label}
        icon={icon}
        size="sm"
        state={locationState}
        to={href}
        variant="icon"
      />
    ) : (
      <ButtonLink
        prependIcon={icon}
        state={locationState}
        to={href}
        variant={isSectionHeader ? 'secondary' : undefined}
      >
        {label}
      </ButtonLink>
    );
  }

  function renderDisabledButton({
    icon,
    label,
  }: {
    icon: IconName;
    label: string;
  }) {
    if (isSectionHeader && isBelowSmViewport) {
      return (
        <Button
          aria-label={label}
          disabled
          icon={icon}
          size="sm"
          type="button"
          variant="icon"
        />
      );
    }

    if (isSectionHeader) {
      return (
        <Button disabled prependIcon={icon} type="button" variant="secondary">
          {label}
        </Button>
      );
    }

    return (
      <Button disabled type="button">
        {label}
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <ActionFrame layout={layout}>
        <ButtonLink to="/login" variant="secondary">
          {t('catalog.workDetail.catalogReviews.actions.signInToWrite')}
        </ButtonLink>
      </ActionFrame>
    );
  }

  if (isViewerCatalogReviewPending) {
    return (
      <ActionFrame layout={layout}>
        {renderDisabledButton({
          icon: 'pencil-line',
          label: t('catalog.workDetail.catalogReviews.actions.checking'),
        })}
      </ActionFrame>
    );
  }

  if (hasViewerReviewError) {
    const action = renderDisabledButton({
      icon: 'pencil-line',
      label: t('catalog.workDetail.catalogReviews.actions.write'),
    });

    return isSectionHeader ? (
      <ActionFrame layout={layout}>{action}</ActionFrame>
    ) : (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {action}
        </div>
        <p className="text-sm text-ink-3" role="alert">
          {t('catalog.workDetail.catalogReviews.viewerCheckError')}
        </p>
      </div>
    );
  }

  if (viewerCatalogReview === null) {
    return (
      <ActionFrame layout={layout}>
        {renderButtonLink({
          href: `/catalog/${encodeURIComponent(catalogWorkId)}/catalog-reviews/new`,
          icon: 'pencil-line',
          label: t('catalog.workDetail.catalogReviews.actions.write'),
        })}
      </ActionFrame>
    );
  }

  if (viewerCatalogReview.status === 'draft') {
    return (
      <ActionFrame layout={layout}>
        {renderButtonLink({
          href: `/catalog-reviews/${encodeURIComponent(viewerCatalogReview.id)}/edit`,
          icon: 'pencil-line',
          label: t('catalog.workDetail.catalogReviews.actions.continueDraft'),
        })}
        <Tag variant="paused">
          {t('catalog.workDetail.catalogReviews.draftLabel')}
        </Tag>
      </ActionFrame>
    );
  }

  if (!showPublishedAction) {
    return null;
  }

  return (
    <ActionFrame layout={layout}>
      {renderButtonLink({
        href: `/catalog-reviews/${encodeURIComponent(viewerCatalogReview.id)}`,
        icon: 'eye',
        label: t('catalog.workDetail.catalogReviews.actions.view'),
      })}
    </ActionFrame>
  );
}
