import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { catalogWorkDetailQueryKey } from '../../catalog/queryKeys';
import { type RoomReadingContextOutput } from './createReadingFormSchema';
import { type SelectedCatalogWork } from './createReadingFormShared';
import { CatalogSourceStep } from './ui/CatalogSourceStep';
import { ReadingContextStep } from './ui/ReadingContextStep';
import { useToast } from '../../../components/feedback';
import { handleApiProblem } from '../../../features/errors';
import { useI18n } from '../../../i18n';
import { browserLocalDateTimePartsToUtcIso } from '../../../lib/datetime';
import { sdk } from '../../../lib/sdk';

interface CreateReadingFormProps {
  initialQuery?: string;
  roomId: string;
  onCreated?: () => void;
  onViewChange?: (header: CreateReadingPanelHeader) => void;
}

export type CreateReadingPanelHeader = {
  back?: {
    ariaLabel: string;
    onBack: () => void;
  };
  title: string;
};

export function CreateReadingForm({
  initialQuery,
  roomId,
  onCreated,
  onViewChange,
}: CreateReadingFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const editionWarningWorkIdRef = useRef<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedCatalogWork | null>(
    null,
  );
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(
    null,
  );
  const [readingError, setReadingError] = useState<string | null>(null);

  const catalogWorkQuery = useQuery({
    enabled: Boolean(selectedItem),
    queryKey: catalogWorkDetailQueryKey(
      selectedItem?.catalogWorkId ?? '',
      locale,
    ),
    queryFn: () => sdk.catalog.get(selectedItem!.catalogWorkId),
    retry: false,
  });

  useEffect(() => {
    if (
      !catalogWorkQuery.error ||
      !selectedItem ||
      editionWarningWorkIdRef.current === selectedItem.catalogWorkId
    ) {
      return;
    }

    editionWarningWorkIdRef.current = selectedItem.catalogWorkId;
    pushToast({
      message: t('rooms.readingFlow.edition.loadWarning'),
      title: t('rooms.readingFlow.edition.loadWarningTitle'),
      variant: 'warning',
    });
  }, [catalogWorkQuery.error, pushToast, selectedItem, t]);

  const effectiveSelectedEditionId =
    catalogWorkQuery.error ||
    (catalogWorkQuery.data &&
      !catalogWorkQuery.data.catalogEditions.some(
        (edition) => edition.id === selectedEditionId,
      ))
      ? null
      : selectedEditionId;

  const handleBackToCatalogSearch = () => {
    setReadingError(null);
    setSelectedEditionId(null);
    setSelectedItem(null);
    onViewChange?.({
      title: t('rooms.readingForm.searchBook'),
    });
  };

  const handleItemSelected = (item: SelectedCatalogWork) => {
    setReadingError(null);
    setSelectedEditionId(item.catalogEditionId);
    setSelectedItem(item);
    onViewChange?.({
      back: {
        ariaLabel: t('rooms.readingForm.backToSearch'),
        onBack: handleBackToCatalogSearch,
      },
      title: t('rooms.readingForm.title'),
    });
  };

  const handleAddCatalogWork = (query: string) => {
    const normalizedQuery = query.trim();

    void navigate('/catalog/new', {
      state: {
        origin: {
          kind: 'reading',
          roomId,
          ...(normalizedQuery.length > 0 ? { query: normalizedQuery } : {}),
        },
      },
    });
  };

  const createReadingMutation = useMutation({
    mutationFn: async ({
      data,
      catalogEditionId,
    }: {
      catalogEditionId: string | null;
      data: RoomReadingContextOutput;
    }) => {
      if (!selectedItem) {
        throw new Error('A selected catalog work is required.');
      }

      const readingBody: Parameters<typeof sdk.readings.create>[1] = {
        catalogWorkId: selectedItem.catalogWorkId,
      };

      if (catalogEditionId) {
        readingBody.catalogEditionId = catalogEditionId;
      }

      const trimmedDescription = data.description?.trim() ?? '';
      const normalizedStartsAt = browserLocalDateTimePartsToUtcIso({
        date: data.startsDate ?? '',
        time: data.startsTime ?? '',
      });
      const normalizedEndsAt = browserLocalDateTimePartsToUtcIso({
        date: data.endsDate ?? '',
        time: data.endsTime ?? '',
      });

      if (trimmedDescription.length > 0) {
        readingBody.description = trimmedDescription;
      }

      if (normalizedStartsAt) {
        readingBody.startsAt = normalizedStartsAt;
      }

      if (normalizedEndsAt) {
        readingBody.endsAt = normalizedEndsAt;
      }

      return sdk.readings.create(roomId, readingBody);
    },
    onError: (error) => {
      setReadingError(
        handleApiProblem(error, {
          fallback: 'Unable to create the room reading right now.',
          fallbackKey: 'rooms.readingForm.error.submit',
          t,
        }).message,
      );
    },
    onSuccess: async () => {
      setReadingError(null);
      setSelectedEditionId(null);
      setSelectedItem(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'overview'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'readings'],
        }),
      ]);
      onCreated?.();
    },
  });

  return (
    <div className="space-y-6">
      <div hidden={selectedItem !== null}>
        <CatalogSourceStep
          initialQuery={initialQuery}
          onAddCatalogWork={handleAddCatalogWork}
          onSelect={(item) => {
            handleItemSelected(item);
          }}
          t={t}
        />
      </div>
      {selectedItem ? (
        <ReadingContextStep
          catalogEditions={catalogWorkQuery.data?.catalogEditions ?? []}
          hasEditionLoadError={Boolean(catalogWorkQuery.error)}
          errorMessage={readingError}
          isLoadingEditions={catalogWorkQuery.isLoading}
          isSubmitting={createReadingMutation.isPending}
          onEditionChange={setSelectedEditionId}
          onSubmit={(data) => {
            setReadingError(null);
            createReadingMutation.mutate({
              catalogEditionId: effectiveSelectedEditionId,
              data,
            });
          }}
          selectedItem={selectedItem}
          selectedEditionId={effectiveSelectedEditionId}
          t={t}
        />
      ) : null}
    </div>
  );
}
