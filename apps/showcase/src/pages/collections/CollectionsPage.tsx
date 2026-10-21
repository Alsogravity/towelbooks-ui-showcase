import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CUSTOM_COLLECTIONS_PER_USER_MAX,
  type CreateCollectionRequest,
} from '@towelbooks/schemas';
import { useCallback, useEffect, useState } from 'react';

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/feedback';
import {
  PageContainer,
  PageHeader,
  PageSection,
  PageShell,
  PageStateShell,
} from '../../components/layout';
import { useRegisterPageMobileHeaderAction } from '../../components/layout/PageMobileHeaderActionContext';
import { Alert, Button } from '../../components/primitives';
import { handleApiProblem } from '../../features/errors';
import { useAuth } from '../../features/auth/AuthContext';
import {
  CollectionEditorDialog,
  type CollectionEditorValues,
} from '../../features/collections/CollectionEditorDialog';
import { CollectionSummaryRow } from '../../features/collections/CollectionSummaryRow';
import {
  invalidateCollectionList,
  useOwnerCollections,
} from '../../features/collections/queries';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

type EditorState = {
  mode: 'create';
} | null;

const collectionMutationMessageKeys = {
  COLLECTION_CREATION_LIMIT_REACHED: 'collections.form.limitReached',
} as const;

export function CollectionsPage() {
  usePageTitle({ key: 'page.collections.title', fallback: 'Collections' });
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const registerMobileHeaderAction = useRegisterPageMobileHeaderAction();
  const collectionsQuery = useOwnerCollections(user?.id ?? null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [editorTrigger, setEditorTrigger] = useState<HTMLButtonElement | null>(
    null,
  );

  const createMutation = useMutation({
    mutationFn: (values: CreateCollectionRequest) =>
      sdk.collections.create(values),
    onSuccess: async () => {
      await invalidateCollectionList(queryClient);
      setEditor(null);
    },
  });
  const collections = collectionsQuery.data?.items ?? [];
  const fixedCollections = collections.filter(
    (collection) => collection.systemKey !== null,
  );
  const customCollections = collections.filter(
    (collection) => collection.systemKey === null,
  );
  const orderedCollections = [...fixedCollections, ...customCollections];
  const customLimitReached =
    customCollections.length >= CUSTOM_COLLECTIONS_PER_USER_MAX;
  const mutationError = createMutation.error
    ? handleApiProblem(createMutation.error, {
        fallbackKey: 'collections.form.error',
        messageKeys: collectionMutationMessageKeys,
        t,
      }).message
    : null;

  const openCreate = useCallback(
    (trigger?: HTMLButtonElement) => {
      createMutation.reset();
      setEditorTrigger(trigger ?? null);
      setEditor({ mode: 'create' });
    },
    [createMutation],
  );
  const openCreateFromMobileHeader = useCallback(() => {
    const trigger =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : undefined;

    openCreate(trigger);
  }, [openCreate]);

  useEffect(() => {
    if (collectionsQuery.isLoading || collectionsQuery.isError) {
      registerMobileHeaderAction(null);
      return;
    }

    registerMobileHeaderAction({
      primaryAction: {
        ariaLabel: t('collections.action.create'),
        disabled: customLimitReached,
        iconName: 'plus',
        onClick: openCreateFromMobileHeader,
      },
    });

    return () => registerMobileHeaderAction(null);
  }, [
    collectionsQuery.isError,
    collectionsQuery.isLoading,
    customLimitReached,
    openCreateFromMobileHeader,
    registerMobileHeaderAction,
    t,
  ]);

  const handleSubmit = (values: CollectionEditorValues) => {
    createMutation.mutate(values as CreateCollectionRequest);
  };

  if (collectionsQuery.isLoading) {
    return (
      <PageStateShell>
        <LoadingState label={{ key: 'collections.loading' }} />
      </PageStateShell>
    );
  }

  if (collectionsQuery.isError) {
    return (
      <PageStateShell>
        <ErrorState
          body={{ key: 'collections.error.body' }}
          title={{ key: 'collections.error.title' }}
          action={
            <Button
              onClick={() => void collectionsQuery.refetch()}
              type="button"
              variant="secondary"
            >
              {t('collections.error.retry')}
            </Button>
          }
        />
      </PageStateShell>
    );
  }

  return (
    <PageShell background="paper" minHeight className="flex flex-col">
      <PageContainer
        size="comfortable"
        className="flex w-full min-w-0 flex-1 flex-col gap-8"
      >
        <PageHeader
          actions={
            <Button
              disabled={customLimitReached}
              onClick={(event) => openCreate(event.currentTarget)}
              prependIcon="plus"
              title={
                customLimitReached
                  ? t('collections.form.limitReached')
                  : undefined
              }
            >
              {t('collections.action.create')}
            </Button>
          }
          backHref="/my-library"
          backLabel={t('errors.page.backToLibrary')}
          showDesktopBackAction={false}
          title={t('collections.header.title')}
        />

        {collections.length === 0 ? (
          <PageSection className="flex flex-1 items-center justify-center">
            <EmptyState
              action={
                <Button
                  onClick={(event) => openCreate(event.currentTarget)}
                  prependIcon="plus"
                  type="button"
                >
                  {t('collections.empty.action')}
                </Button>
              }
              body={{ key: 'collections.empty.body' }}
              icon="bookmark"
              title={{ key: 'collections.empty.title' }}
            />
          </PageSection>
        ) : (
          <PageSection className="flex w-full min-w-0 flex-col gap-8">
            <ul
              aria-label={t('collections.header.title')}
              className="flex list-none flex-col gap-4 p-0"
            >
              {orderedCollections.map((collection) => (
                <CollectionSummaryRow
                  collection={collection}
                  key={collection.id}
                />
              ))}
            </ul>
          </PageSection>
        )}

        {createMutation.error && !editor ? (
          <Alert variant="error">{t('collections.form.error')}</Alert>
        ) : null}
      </PageContainer>

      {editor ? (
        <CollectionEditorDialog
          collection={null}
          errorMessage={mutationError}
          getReturnFocusElement={() => editorTrigger}
          isPending={createMutation.isPending}
          key="create"
          onClose={() => {
            if (!createMutation.isPending) setEditor(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </PageShell>
  );
}
