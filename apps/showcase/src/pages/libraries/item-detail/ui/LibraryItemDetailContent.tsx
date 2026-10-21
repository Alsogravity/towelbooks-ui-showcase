import {
  type LibraryItemDetail,
  type LibraryOwnerIdentity,
} from '@towelbooks/schemas';
import { useMemo, useState } from 'react';

import { LibraryItemDetailFooter } from './LibraryItemDetailFooter';
import { LibraryItemDetailHeader } from './LibraryItemDetailHeader';
import { LibraryItemDetailOverviewPanel } from './LibraryItemDetailOverviewPanel';
import { LibraryItemDetailSessionsPanel } from './LibraryItemDetailSessionsPanel';
import { LibraryItemRatingPanel } from './LibraryItemRatingPanel';
import { LibraryItemReviewPanel } from './LibraryItemReviewPanel';
import {
  AnimatedTabPanel,
  Icon,
  TabPanelsSlider,
  Tabs,
} from '../../../../components/primitives';
import { useLibraryItemDetailForm } from '../../../../features/libraries/useLibraryItemDetailForm';
import { useI18n } from '../../../../i18n';
import {
  getItemTitle,
  getLibraryItemCoverSources,
  getReadingSessionCountLabelKey,
} from '../../ui/libraryPageShared';

import type { Tab } from '../../../../components/primitives';

type ItemDetailTab = 'library' | 'sessions' | 'rating' | 'review';

interface LibraryItemDetailContentProps {
  canManage: boolean;
  item: LibraryItemDetail;
  libraryId: string;
  owner: LibraryOwnerIdentity | null;
  ownerUserId: string;
}

export function LibraryItemDetailContent({
  canManage,
  item,
  libraryId,
  owner,
  ownerUserId,
}: LibraryItemDetailContentProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ItemDetailTab>('library');
  const { draft, handleRemove, isRemoving, isSaving, saveNote } =
    useLibraryItemDetailForm(item, libraryId);

  const title = getItemTitle(item);
  const author = item.work.contributors[0] ?? null;
  const tabIdPrefix = 'library-item-tab';
  const tabs = useMemo<Tab<ItemDetailTab>[]>(
    () => [
      {
        key: 'library',
        label: (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name="text-align-start" size={24} strokeWidth={1.7} />
            <span className="hidden sm:inline">
              {t('myLibrary.items.tabs.library')}
            </span>
          </span>
        ),
      },
      {
        key: 'sessions',
        label: (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name="scroll-text" size={24} strokeWidth={1.7} />
            <span className="hidden sm:inline">
              {t('myLibrary.items.tabs.sessions')}
            </span>
          </span>
        ),
      },
      {
        key: 'rating',
        label: (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name="star" size={24} strokeWidth={1.7} />
            <span className="hidden sm:inline">
              {t('myLibrary.items.tabs.rating')}
            </span>
          </span>
        ),
      },
      {
        key: 'review',
        label: (
          <span className="inline-flex items-center justify-center gap-2">
            <Icon name="feather" size={24} strokeWidth={1.7} />
            <span className="hidden sm:inline">
              {t('myLibrary.items.tabs.review')}
            </span>
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <>
      <LibraryItemDetailHeader
        author={author}
        backTo={`/libraries/${libraryId}`}
        coverSources={getLibraryItemCoverSources(item)}
        readingSummaryLabel={t(
          getReadingSessionCountLabelKey(item.readingSummary.sessionsCount),
          {
            values: { count: item.readingSummary.sessionsCount },
          },
        )}
        themeSeed={item.catalogWorkId}
        title={title}
        owner={owner}
        readOnly={!canManage}
      />

      <Tabs
        activeKey={activeTab}
        ariaLabel={t('myLibrary.items.tabs.ariaLabel')}
        className="mb-10 w-full [&_[role=tablist]]:min-w-0"
        idPrefix={tabIdPrefix}
        tabs={tabs}
        onChange={setActiveTab}
      />

      <TabPanelsSlider activeKey={activeTab} tabs={tabs}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <AnimatedTabPanel
              aria-labelledby={`${tabIdPrefix}-${tab.key}`}
              id={`${tabIdPrefix}-${tab.key}-panel`}
              isActive={isActive}
              key={tab.key}
            >
              {tab.key === 'library' ? (
                <>
                  <LibraryItemDetailOverviewPanel
                    canManage={canManage}
                    item={item}
                    isSavingNote={isSaving}
                    libraryId={libraryId}
                    note={draft.note}
                    onSaveNote={saveNote}
                  />
                  {canManage ? (
                    <LibraryItemDetailFooter
                      isRemoving={isRemoving}
                      onRemove={handleRemove}
                    />
                  ) : null}
                </>
              ) : tab.key === 'sessions' ? (
                <LibraryItemDetailSessionsPanel
                  canManage={canManage}
                  item={item}
                  libraryId={libraryId}
                />
              ) : tab.key === 'rating' ? (
                <LibraryItemRatingPanel
                  canManage={canManage}
                  catalogWorkId={item.catalogWorkId}
                  enabled={isActive}
                  itemId={item.id}
                  libraryId={libraryId}
                  ownerUserId={ownerUserId}
                />
              ) : (
                <LibraryItemReviewPanel
                  canManage={canManage}
                  catalogWorkId={item.catalogWorkId}
                  enabled={isActive}
                  libraryId={libraryId}
                  libraryItemId={item.id}
                  ownerUserId={ownerUserId}
                />
              )}
            </AnimatedTabPanel>
          );
        })}
      </TabPanelsSlider>
    </>
  );
}
