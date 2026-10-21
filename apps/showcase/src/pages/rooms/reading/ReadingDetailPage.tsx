import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import { createReadingDetailViewModel } from './readingDetailViewModel';
import { ReadingCommentsSection } from './ui/ReadingCommentsSection';
import { ReadingContextSection } from './ui/ReadingContextSection';
import { ReadingDetailHeader } from './ui/ReadingDetailHeader';
import { ReadingEditionSection } from './ui/ReadingEditionSection';
import { LoadingState } from '../../../components/feedback';
import {
  PageContainer,
  PageShell,
  PageStateShell,
} from '../../../components/layout';
import { Button, ButtonLink } from '../../../components/primitives';
import { ApiProblemPageState } from '../../../features/errors';
import { ReadingEditPanel } from '../../../features/readings/edit-reading/ReadingEditPanel';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

export function ReadingDetailPage() {
  const { roomId, readingId } = useParams<{
    roomId: string;
    readingId: string;
  }>();
  const { locale, t } = useI18n();
  const [statusReferenceTime] = useState(() => Date.now());
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const openEditPanel = useCallback(() => setIsEditPanelOpen(true), []);

  const {
    data: reading,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['rooms', roomId, 'readings', readingId, locale],
    queryFn: () => sdk.readings.get(roomId!, readingId!),
    enabled: Boolean(roomId && readingId),
  });
  const roomQuery = useQuery({
    queryKey: ['rooms', roomId, locale],
    queryFn: () => sdk.rooms.get(roomId!),
    enabled: Boolean(roomId),
  });
  usePageTitle(
    reading?.work.display.title ?? {
      key: 'page.rooms.reading.fallbackTitle',
      fallback: 'Reading',
    },
  );

  if (isLoading) {
    return (
      <PageStateShell containerSize="default">
        <LoadingState
          label={{
            key: 'rooms.reading.loading',
            fallback: 'Opening reading room...',
          }}
        />
      </PageStateShell>
    );
  }

  if (error || !reading || !roomId) {
    return (
      <PageStateShell containerSize="default">
        <ApiProblemPageState
          error={error}
          title={{ key: 'rooms.reading.error.loadTitle' }}
          body={{ key: 'rooms.reading.error.loadBody' }}
          fallbackAction={
            <Button variant="secondary" onClick={() => void refetch()}>
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/" variant="tertiary" size="sm">
              {t('rooms.reading.error.action')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  const canEditReading =
    roomQuery.data?.viewer.role === 'owner' ||
    roomQuery.data?.viewer.role === 'admin';
  const viewModel = createReadingDetailViewModel({
    reading,
    referenceTime: statusReferenceTime,
    locale,
    t,
  });

  return (
    <PageShell background="paper" minHeight>
      <PageContainer
        size="comfortable"
        padding="none"
        className="space-y-8 pt-4 pb-s-8 lg:pt-12"
      >
        <ReadingDetailHeader
          canEditReading={canEditReading}
          roomId={roomId}
          onEdit={openEditPanel}
          reading={reading}
          viewModel={viewModel}
        />

        <div className="space-y-8">
          <ReadingContextSection description={reading.description} />
          <ReadingEditionSection
            edition={viewModel.edition}
            facts={viewModel.editionFacts}
          />
        </div>

        <ReadingCommentsSection roomId={roomId} readingId={reading.id} />
        {isEditPanelOpen ? (
          <ReadingEditPanel
            roomId={roomId}
            reading={reading}
            onClose={() => setIsEditPanelOpen(false)}
          />
        ) : null}
      </PageContainer>
    </PageShell>
  );
}
