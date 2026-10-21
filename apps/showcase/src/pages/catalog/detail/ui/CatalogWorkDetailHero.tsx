import {
  type CatalogItem,
  type LibraryItemOwnershipFormat,
} from '@towelbooks/schemas';

import { buildDetailCoverSources } from './catalogWorkDetailHelpers';
import { CatalogWorkDetailHeroUtilityActions } from './CatalogWorkDetailHeroUtilityActions';
import { CatalogWorkDetailHeroUtilityIcons } from './CatalogWorkDetailHeroUtilityIcons';
import { CatalogWorkDetailLibraryActions } from './CatalogWorkDetailLibraryActions';
import { Alert, Icon } from '../../../../components/primitives';
import { CatalogCoverMedia } from '../../../../entities/reading/ui';
import { useI18n } from '../../../../i18n';
import { useIsDesktopShellViewport } from '../../../../layouts/app/shellViewport';

export function CatalogWorkDetailHero({
  author,
  isAddToLibraryPending,
  isAuthenticated = false,
  isInLibrary,
  isLikeDisabled,
  isLiked,
  isLikePending,
  isLibraryLookupError,
  isLibraryLookupLoading,
  item,
  catalogWorkId,
  libraryId,
  likeErrorMessage,
  libraryActionErrorMessage,
  onAddToLibrary,
  onLikeToggle,
  onInfoClick,
  shareUrl,
  subtitle,
  title,
  workTypeLabel,
}: {
  author: string;
  isAddToLibraryPending: boolean;
  isAuthenticated?: boolean;
  isInLibrary: boolean;
  isLikeDisabled: boolean;
  isLiked: boolean;
  isLikePending: boolean;
  isLibraryLookupError: boolean;
  isLibraryLookupLoading: boolean;
  item: CatalogItem;
  catalogWorkId?: string;
  libraryId: string | null;
  likeErrorMessage: string | null;
  libraryActionErrorMessage: string | null;
  onAddToLibrary: (formats: LibraryItemOwnershipFormat[]) => void;
  onLikeToggle: () => void;
  onInfoClick: () => void;
  shareUrl: string;
  subtitle: string | null;
  title: string;
  workTypeLabel: string;
}) {
  const { formatNumber, t } = useI18n();
  const isDesktopShell = useIsDesktopShellViewport();
  const coverSources = buildDetailCoverSources(item);
  const coverAlt = t('catalog.workDetail.coverAlt', {
    values: { title, workType: workTypeLabel },
  });
  const formattedAverageRating =
    item.averageRating === null
      ? '-'
      : formatNumber(item.averageRating, {
          maximumFractionDigits: 1,
        });

  const libraryActionsProps = {
    isAddToLibraryPending,
    isInLibrary,
    isLibraryLookupError,
    isLibraryLookupLoading,
    libraryActionErrorMessage,
    libraryId,
    onAddToLibrary,
  };

  const utilityActionsProps = {
    author,
    catalogWorkId,
    isAuthenticated,
    isLikeDisabled,
    isLiked,
    isLikePending,
    libraryActionErrorMessage,
    likeErrorMessage,
    onInfoClick,
    onLikeToggle,
    shareUrl,
    title,
    workTypeLabel,
  };

  const cover = (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-sm bg-vellum/20 shadow-book transition-shadow">
        <CatalogCoverMedia
          alt={coverAlt}
          author={item.contributors[0] ?? ''}
          coverDelivery={{ loading: 'eager', preferredVariant: 'detail' }}
          fit="natural"
          imageClassName="w-full transition-transform hover:scale-[1.02]"
          size="fluid"
          sources={coverSources}
          theme={item.id.charCodeAt(0)}
          title={title}
          typographic={{
            'aria-label': coverAlt,
            className: 'w-full rounded-sm',
            role: 'img',
          }}
        />
      </div>
    </div>
  );

  const metadata = (
    <div className="space-y-1">
      <h1 className="app-text-entity-title text-ink">{title}</h1>
      {subtitle ? (
        <p className="app-text-entity-subtitle text-ink-2">{subtitle}</p>
      ) : null}
      <p className="app-text-metadata text-ink-3">{author}</p>
      <div className="app-text-metadata flex items-center gap-2 text-ink-2">
        <Icon
          className="fill-current text-gold"
          name="star"
          size={16}
          strokeWidth={1.8}
        />
        <span>{formattedAverageRating}</span>
      </div>
    </div>
  );

  const actionAlerts =
    likeErrorMessage || libraryActionErrorMessage ? (
      <div className="flex w-full max-w-lg flex-col gap-2 text-left">
        {likeErrorMessage ? (
          <Alert variant="error">{likeErrorMessage}</Alert>
        ) : null}
        {libraryActionErrorMessage ? (
          <Alert variant="error">{libraryActionErrorMessage}</Alert>
        ) : null}
      </div>
    ) : null;

  return (
    <header>
      {isDesktopShell ? (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
          <div className="w-full max-w-[220px] shrink-0">{cover}</div>

          <div className="flex flex-1 flex-col gap-6 lg:self-stretch lg:justify-between">
            <div className="flex flex-col gap-3 text-left">{metadata}</div>

            <div className="flex w-full flex-col items-start gap-4">
              <CatalogWorkDetailLibraryActions {...libraryActionsProps} />

              <CatalogWorkDetailHeroUtilityActions {...utilityActionsProps} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="mx-auto w-full max-w-[180px]">{cover}</div>

          <div className="w-full space-y-1 text-center [&_div.flex]:justify-center">
            {metadata}
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <CatalogWorkDetailLibraryActions {...libraryActionsProps} />
            <CatalogWorkDetailHeroUtilityIcons
              {...utilityActionsProps}
              className="shrink-0 gap-4"
            />
          </div>

          {actionAlerts}
        </div>
      )}
    </header>
  );
}
