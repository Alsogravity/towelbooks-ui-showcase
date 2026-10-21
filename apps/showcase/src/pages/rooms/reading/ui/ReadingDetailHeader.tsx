import { useEffect } from 'react';

import { ReadingLibraryAction } from './ReadingLibraryAction';
import { useRegisterPageHeaderBackAction } from '../../../../components/layout/PageHeaderBackActionContext';
import { useRegisterPageMobileHeaderAction } from '../../../../components/layout/PageMobileHeaderActionContext';
import { Button, ButtonLink } from '../../../../components/primitives';
import { ReadingSummaryCard } from '../../../../entities/reading/ui';
import { useI18n } from '../../../../i18n';

import type { ReadingDetailViewModel } from '../readingDetailViewModel';
import type { Reading } from '@towelbooks/schemas';

interface ReadingDetailHeaderProps {
  canEditReading: boolean;
  roomId: string;
  onEdit: () => void;
  reading: Reading;
  viewModel: ReadingDetailViewModel;
}

export function ReadingDetailHeader({
  canEditReading,
  roomId,
  onEdit,
  reading,
  viewModel,
}: ReadingDetailHeaderProps) {
  const { formatDate, t } = useI18n();
  const registerBackAction = useRegisterPageHeaderBackAction();
  const registerMobileHeaderAction = useRegisterPageMobileHeaderAction();
  const backLabel = t('rooms.reading.backToRoom');
  const backHref = `/rooms/${roomId}`;
  const editLabel = t('rooms.reading.action.edit');
  const cardVariant =
    viewModel.status.variant === 'paused' ? 'historical' : 'active';

  useEffect(() => {
    registerBackAction({ label: backLabel, to: backHref });
    return () => registerBackAction(null);
  }, [backHref, backLabel, registerBackAction]);

  useEffect(() => {
    if (!canEditReading) {
      registerMobileHeaderAction(null);
      return;
    }

    registerMobileHeaderAction({
      primaryAction: {
        ariaLabel: editLabel,
        iconName: 'pencil-line',
        onClick: onEdit,
      },
    });

    return () => registerMobileHeaderAction(null);
  }, [canEditReading, editLabel, onEdit, registerMobileHeaderAction]);

  return (
    <div className="space-y-0 lg:space-y-5">
      <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex">
        <ButtonLink
          to={backHref}
          variant="tertiary"
          size="sm"
          prependIcon="chevron-left"
        >
          {backLabel}
        </ButtonLink>

        {canEditReading ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            prependIcon="pencil-line"
            onClick={onEdit}
          >
            {editLabel}
          </Button>
        ) : null}
      </div>

      <ReadingSummaryCard
        authorLabel={
          reading.work.contributors[0] ?? t('readings.author.unknown')
        }
        coverDelivery={{ loading: 'eager', preferredVariant: 'detail' }}
        formatDate={formatDate}
        reading={reading}
        titleAs="h1"
        variant={cardVariant}
        footer={<ReadingLibraryAction reading={reading} />}
      />

      {viewModel.edition?.subtitle ? (
        <p className="app-text-entity-subtitle text-ink-3">
          {viewModel.edition.subtitle}
        </p>
      ) : null}
    </div>
  );
}
