import { type ReactNode } from 'react';

import { Alert } from '../../../../components/primitives';

import { CatalogWorkDetailHeroUtilityIcons } from './CatalogWorkDetailHeroUtilityIcons';

export function CatalogWorkDetailHeroUtilityActions({
  author,
  catalogWorkId,
  endAdornment,
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
}: {
  author: string;
  catalogWorkId?: string;
  endAdornment?: ReactNode;
  isAuthenticated?: boolean;
  isLikeDisabled: boolean;
  isLiked: boolean;
  isLikePending: boolean;
  libraryActionErrorMessage: string | null;
  likeErrorMessage: string | null;
  onInfoClick: () => void;
  onLikeToggle: () => void;
  shareUrl: string;
  title: string;
  workTypeLabel: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-center gap-6 lg:justify-start">
        <CatalogWorkDetailHeroUtilityIcons
          author={author}
          catalogWorkId={catalogWorkId}
          isAuthenticated={isAuthenticated}
          isLikeDisabled={isLikeDisabled}
          isLiked={isLiked}
          isLikePending={isLikePending}
          onInfoClick={onInfoClick}
          onLikeToggle={onLikeToggle}
          shareUrl={shareUrl}
          title={title}
          workTypeLabel={workTypeLabel}
        />
        {endAdornment}
      </div>
      {likeErrorMessage || libraryActionErrorMessage ? (
        <div className="flex w-full max-w-lg flex-col gap-2 text-left">
          {likeErrorMessage ? (
            <Alert variant="error">{likeErrorMessage}</Alert>
          ) : null}
          {libraryActionErrorMessage ? (
            <Alert variant="error">{libraryActionErrorMessage}</Alert>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
