import {
  type CatalogItem,
  type LibraryItemOwnershipFormat,
} from '@towelbooks/schemas';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import {
  type CatalogWorkDetailField,
  type CatalogWorkDetailTabKey,
  getCatalogWorkTypeLabel,
  resolveCatalogWorkDetailTab,
} from './catalogWorkDetailHelpers';
import { CatalogWorkDetailHero } from './CatalogWorkDetailHero';
import { CatalogWorkDetailHeader } from './CatalogWorkDetailHeader';
import { CatalogWorkDetailMetadataDialog } from './CatalogWorkDetailMetadataDialog';
import { CatalogWorkDetailOverviewPanel } from './CatalogWorkDetailOverviewPanel';
import { PageContainer, PageShell } from '../../../../components/layout';
import {
  AnimatedTabPanel,
  Icon,
  type Tab,
  Tabs,
  TabPanelsSlider,
} from '../../../../components/primitives';
import { CatalogReviewsPanel } from '../../../../features/catalog-reviews/CatalogReviewsPanel';
import { CatalogRatingsPanel } from '../../../../features/ratings/CatalogRatingsPanel';
import { useI18n } from '../../../../i18n';

type CatalogWorkDetailContentProps = {
  isAuthenticated: boolean;
  isAddToLibraryPending: boolean;
  isInLibrary: boolean;
  isLikeDisabled: boolean;
  isLiked: boolean;
  isLikePending: boolean;
  isSystemAdmin: boolean;
  isLibraryLookupError: boolean;
  isLibraryLookupLoading: boolean;
  item: CatalogItem;
  libraryId: string | null;
  likeErrorMessage: string | null;
  libraryActionErrorMessage: string | null;
  onAddToLibrary: (formats: LibraryItemOwnershipFormat[]) => void;
  onLikeToggle: () => void;
  catalogWorkId: string;
};

export function CatalogWorkDetailContent({
  isAuthenticated,
  isAddToLibraryPending,
  isInLibrary,
  isLikeDisabled,
  isLiked,
  isLikePending,
  isSystemAdmin,
  isLibraryLookupError,
  isLibraryLookupLoading,
  item,
  libraryId,
  likeErrorMessage,
  libraryActionErrorMessage,
  onAddToLibrary,
  onLikeToggle,
  catalogWorkId,
}: CatalogWorkDetailContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const activeTab = resolveCatalogWorkDetailTab(searchParams.get('tab'));
  const workTypeLabel = getCatalogWorkTypeLabel(item.kind, t);
  const { synopsis, subtitle, title } = item.display;
  const contributors = item.contributors.join(', ');
  const author = contributors || t('catalog.workDetail.value.unavailable');
  const shareUrl = `/catalog/${catalogWorkId}`;
  const displayedEdition =
    item.catalogEditions.find(
      (edition) => edition.id === item.display.catalogEditionId,
    ) ?? item.catalogEditions[0];
  const editIdentifier =
    displayedEdition?.isbn13 ?? displayedEdition?.isbn10 ?? null;
  const metadataItems: CatalogWorkDetailField[] = [
    {
      label: t('catalog.workDetail.labels.title'),
      value: title,
    },
    {
      label: t('catalog.workDetail.labels.author'),
      value: author,
    },
  ];
  const resolvedSynopsis =
    synopsis ?? t('catalog.workDetail.description.fallback');
  const tabIdPrefix = 'catalog-work-detail-tab';
  const tabs: Tab<CatalogWorkDetailTabKey>[] = [
    {
      key: 'overview',
      label: (
        <span className="inline-flex items-center justify-center gap-2">
          <Icon name="text-align-left" size={24} strokeWidth={1.7} />
          <span className="sr-only sm:not-sr-only">
            {t('catalog.workDetail.tabs.overview')}
          </span>
        </span>
      ),
    },
    {
      key: 'ratings',
      label: (
        <span className="inline-flex items-center justify-center gap-2">
          <Icon name="star" size={24} strokeWidth={1.7} />
          <span className="sr-only sm:not-sr-only">
            {t('catalog.workDetail.tabs.ratings')}
          </span>
        </span>
      ),
    },
    {
      key: 'catalog-reviews',
      label: (
        <span className="inline-flex items-center justify-center gap-2">
          <Icon name="feather" size={24} strokeWidth={1.7} />
          <span className="sr-only sm:not-sr-only">
            {t('catalog.workDetail.tabs.catalogReviews')}
          </span>
        </span>
      ),
    },
  ];

  function handleTabChange(nextTab: CatalogWorkDetailTabKey) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextTab === 'overview') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', nextTab);
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  return (
    <PageShell background="paper" minHeight>
      <PageContainer
        size="default"
        padding="none"
        className="flex flex-col gap-3 py-8 lg:py-12"
      >
        <CatalogWorkDetailHeader />
        <CatalogWorkDetailHero
          author={author}
          isAddToLibraryPending={isAddToLibraryPending}
          isAuthenticated={isAuthenticated}
          isInLibrary={isInLibrary}
          isLikeDisabled={isLikeDisabled}
          isLiked={isLiked}
          isLikePending={isLikePending}
          isLibraryLookupError={isLibraryLookupError}
          isLibraryLookupLoading={isLibraryLookupLoading}
          item={item}
          catalogWorkId={catalogWorkId}
          workTypeLabel={workTypeLabel}
          libraryId={libraryId}
          likeErrorMessage={likeErrorMessage}
          libraryActionErrorMessage={libraryActionErrorMessage}
          onAddToLibrary={onAddToLibrary}
          onLikeToggle={onLikeToggle}
          onInfoClick={() => setIsDetailsOpen(true)}
          shareUrl={shareUrl}
          subtitle={subtitle}
          title={title}
        />

        <Tabs
          activeKey={activeTab}
          ariaLabel={t('catalog.workDetail.tabs.ariaLabel')}
          className="-mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] [&_[role=tablist]]:min-w-0 [&_[role=tab]]:min-w-0"
          idPrefix={tabIdPrefix}
          onChange={handleTabChange}
          tabs={tabs}
        />

        <TabPanelsSlider activeKey={activeTab} tabs={tabs}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <AnimatedTabPanel
                key={tab.key}
                id={`${tabIdPrefix}-${tab.key}-panel`}
                aria-labelledby={`${tabIdPrefix}-${tab.key}`}
                isActive={isActive}
                className={tab.key === 'overview' ? 'space-y-3' : 'pb-12'}
              >
                {renderCatalogWorkDetailTabPanel(tab.key, {
                  author,
                  item,
                  catalogWorkId,
                  synopsis: resolvedSynopsis,
                  workTypeLabel,
                })}
              </AnimatedTabPanel>
            );
          })}
        </TabPanelsSlider>

        <CatalogWorkDetailMetadataDialog
          closeButtonLabel={t('common.close')}
          editButtonLabel={t('catalog.workDetail.actions.editWork')}
          editHref={
            editIdentifier
              ? `/catalog/edit/${encodeURIComponent(editIdentifier)}`
              : ''
          }
          isOpen={isDetailsOpen}
          metadataItems={metadataItems}
          onClose={() => setIsDetailsOpen(false)}
          showEditAction={isSystemAdmin && editIdentifier !== null}
          title={t('catalog.workDetail.sections.details')}
        />
      </PageContainer>
    </PageShell>
  );
}

function renderCatalogWorkDetailTabPanel(
  activeTab: CatalogWorkDetailTabKey,
  {
    author,
    item,
    catalogWorkId,
    synopsis,
    workTypeLabel,
  }: {
    author: string;
    item: CatalogItem;
    catalogWorkId: string;
    synopsis: string;
    workTypeLabel: string;
  },
) {
  switch (activeTab) {
    case 'overview':
      return (
        <CatalogWorkDetailOverviewPanel
          author={author}
          item={item}
          synopsis={synopsis}
          workTypeLabel={workTypeLabel}
        />
      );
    case 'ratings':
      return (
        <CatalogRatingsPanel
          catalogWorkId={catalogWorkId}
          workTypeLabel={workTypeLabel}
        />
      );
    case 'catalog-reviews':
      return (
        <CatalogReviewsPanel
          catalogWorkId={catalogWorkId}
          workTypeLabel={workTypeLabel}
        />
      );
  }
}
