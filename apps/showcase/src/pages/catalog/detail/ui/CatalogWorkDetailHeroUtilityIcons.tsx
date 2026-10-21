import { useState } from 'react';

import { Button, LikeButton } from '../../../../components/primitives';
import { ShareDialog } from '../../../../components/share/ShareDialog';
import { ReportActionButton } from '../../../../features/reports/ReportActionButton';
import { useI18n } from '../../../../i18n';

export function CatalogWorkDetailHeroUtilityIcons({
  author,
  catalogWorkId,
  className,
  isAuthenticated = false,
  isLikeDisabled,
  isLiked,
  isLikePending,
  onInfoClick,
  onLikeToggle,
  shareUrl,
  title,
  workTypeLabel,
}: {
  author: string;
  catalogWorkId?: string;
  className?: string;
  isAuthenticated?: boolean;
  isLikeDisabled: boolean;
  isLiked: boolean;
  isLikePending: boolean;
  onInfoClick: () => void;
  onLikeToggle: () => void;
  shareUrl: string;
  title: string;
  workTypeLabel: string;
}) {
  const { t } = useI18n();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isLikeActive = isLiked || isLikePending;

  return (
    <>
      <div
        className={['flex items-center gap-6', className]
          .filter(Boolean)
          .join(' ')}
      >
        <LikeButton
          aria-label={t('catalog.workDetail.actions.like')}
          buttonClassName={[
            isLikeActive ? 'text-brick' : '',
            'hover:!bg-transparent',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={isLikeDisabled}
          isLiked={isLikeActive}
          onClick={onLikeToggle}
        />
        {[
          {
            'aria-label': t('share.action'),
            icon: 'share' as const,
            onClick: () => setIsShareOpen(true),
          },
          {
            'aria-label': t('catalog.workDetail.sections.details'),
            icon: 'info' as const,
            onClick: onInfoClick,
          },
        ].map((buttonProps, index) => (
          <Button
            key={index}
            variant="ghost"
            {...buttonProps}
            className="hover:!bg-transparent"
          />
        ))}
        {isAuthenticated && catalogWorkId ? (
          <ReportActionButton
            className="hover:!bg-transparent"
            targetId={catalogWorkId}
            targetType="catalog_work"
            variant="ghost"
          />
        ) : null}
      </div>
      <ShareDialog
        getMessage={(fullUrl) =>
          t('catalog.workDetail.share.message', {
            values: { author, title, url: fullUrl, workType: workTypeLabel },
          })
        }
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        subject={t('catalog.workDetail.share.subject', {
          values: { title },
        })}
        url={shareUrl}
      />
    </>
  );
}
