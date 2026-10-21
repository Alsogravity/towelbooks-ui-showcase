import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CollectionItem,
  PublicCollectionItem,
  UpdateCollectionRequest,
} from '@towelbooks/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

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
  SectionHeaderWithIcon,
} from '../../components/layout';
import { useRegisterPageMobileHeaderAction } from '../../components/layout/PageMobileHeaderActionContext';
import { Button, Pagination } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import { handleApiProblem } from '../../features/errors';
import {
  CollectionItemAddDialog,
  CollectionEditorDialog,
  CollectionItemEditDialog,
  CollectionItemRemoveDialog,
  CollectionRemoveDialog,
} from '../../features/collections';
import { CollectionItemRow } from '../../features/collections/CollectionItemRow';
import {
  invalidateCollectionSurface,
  useCollectionDetail,
  useCollectionItems,
} from '../../features/collections/queries';
import {
  COLLECTION_ACCENT_CLASS_BY_KEY,
  CollectionPresentationIcon,
  getCollectionDescription,
  getCollectionName,
} from '../../features/collections/collectionPresentation';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { NON_INDEXABLE_ROBOTS_DIRECTIVE } from '../../lib/documentMetadata';
import { sdk } from '../../lib/sdk';
import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';

const collectionItemMutationMessageKeys = {
  COLLECTION_ITEM_LIMIT_REACHED: 'collections.detail.addLimitReached',
} as const;

function isOwnerCollectionItem(
  item: CollectionItem | PublicCollectionItem,
): item is CollectionItem {
  return 'note' in item;
}

export function CollectionDetailPage() {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatNumber, t } = useI18n();
  const queryClient = useQueryClient();
  const registerMobileHeaderAction = useRegisterPageMobileHeaderAction();
  const collectionQuery = useCollectionDetail(collectionId, user?.id ?? null);
  const collection = collectionQuery.data;
  const isOwner = Boolean(
    collection && user && collection.owner.username === user.username,
  );
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCollectionEditorOpen, setIsCollectionEditorOpen] = useState(false);
  const [isCollectionRemoveOpen, setIsCollectionRemoveOpen] = useState(false);
  const [addedWorkIds, setAddedWorkIds] = useState<Set<string>>(new Set());
  const [editItem, setEditItem] = useState<CollectionItem | null>(null);
  const [removeItem, setRemoveItem] = useState<
    CollectionItem | PublicCollectionItem | null
  >(null);
  const [addDialogTrigger, setAddDialogTrigger] =
    useState<HTMLButtonElement | null>(null);
  const [collectionEditorTrigger, setCollectionEditorTrigger] =
    useState<HTMLButtonElement | null>(null);
  const [collectionRemoveTrigger, setCollectionRemoveTrigger] =
    useState<HTMLButtonElement | null>(null);
  const [editItemFocusElement, setEditItemFocusElement] =
    useState<HTMLButtonElement | null>(null);
  const [removeItemFocusElement, setRemoveItemFocusElement] =
    useState<HTMLButtonElement | null>(null);

  const access = isOwner ? 'owner' : 'public';
  const itemsQuery = useCollectionItems({
    access,
    collectionId,
    enabled: Boolean(collection),
    page,
    viewerUserId: user?.id ?? null,
  });

  const addMutation = useMutation({
    mutationFn: (result: {
      catalogEditionId: string | null;
      catalogWorkId: string;
    }) =>
      sdk.collections.addItem(collectionId!, {
        catalogWorkId: result.catalogWorkId,
        ...(collection?.systemKey === 'wishlist'
          ? { catalogEditionId: result.catalogEditionId }
          : {}),
      }),
    onSuccess: async (_item, variables) => {
      setAddedWorkIds((current) => {
        const next = new Set(current);
        next.add(variables.catalogWorkId);
        return next;
      });
      setPage(1);
      await invalidateCollectionSurface(queryClient, collectionId!);
    },
  });
  const updateItemMutation = useMutation({
    mutationFn: (values: {
      note: string | null;
      priority: 'low' | 'medium' | 'high';
    }) => sdk.collections.updateItem(collectionId!, editItem!.id, values),
    onSuccess: async () => {
      await invalidateCollectionSurface(queryClient, collectionId!);
      setEditItem(null);
    },
  });
  const updateCollectionMutation = useMutation({
    mutationFn: (values: UpdateCollectionRequest) =>
      sdk.collections.update(collectionId!, values),
    onSuccess: async () => {
      await invalidateCollectionSurface(queryClient, collectionId!);
      setIsCollectionEditorOpen(false);
    },
  });
  const removeCollectionMutation = useMutation({
    mutationFn: () => sdk.collections.remove(collectionId!),
    onSuccess: async () => {
      await invalidateCollectionSurface(queryClient, collectionId!);
      setIsCollectionRemoveOpen(false);
      navigate('/collections');
    },
  });
  const removeItemMutation = useMutation({
    mutationFn: () => sdk.collections.removeItem(collectionId!, removeItem!.id),
    onSuccess: async () => {
      await invalidateCollectionSurface(queryClient, collectionId!);
      setRemoveItem(null);
    },
  });

  const openCollectionEditor = useCallback(
    (trigger?: HTMLButtonElement | null) => {
      updateCollectionMutation.reset();
      setCollectionEditorTrigger(trigger ?? null);
      setIsCollectionEditorOpen(true);
    },
    [updateCollectionMutation],
  );
  const openCollectionRemove = useCallback(
    (trigger?: HTMLButtonElement | null) => {
      removeCollectionMutation.reset();
      setCollectionRemoveTrigger(trigger ?? null);
      setIsCollectionRemoveOpen(true);
    },
    [removeCollectionMutation],
  );
  const openCollectionEditorFromMobileHeader = useCallback(() => {
    const trigger =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;

    openCollectionEditor(trigger);
  }, [openCollectionEditor]);
  const openCollectionRemoveFromMobileHeader = useCallback(() => {
    const trigger =
      document.activeElement instanceof HTMLButtonElement
        ? document.activeElement
        : null;

    openCollectionRemove(trigger);
  }, [openCollectionRemove]);

  useEffect(() => {
    if (!collection || !isOwner || collection.systemKey !== null) {
      registerMobileHeaderAction(null);
      return;
    }

    registerMobileHeaderAction({
      leadingAction: {
        ariaLabel: t('collections.action.edit'),
        iconName: 'pencil-line',
        onClick: openCollectionEditorFromMobileHeader,
        tone: 'default',
      },
      primaryAction: {
        ariaLabel: t('collections.action.delete'),
        iconName: 'trash-2',
        onClick: openCollectionRemoveFromMobileHeader,
      },
    });

    return () => registerMobileHeaderAction(null);
  }, [
    collection,
    isOwner,
    openCollectionEditorFromMobileHeader,
    openCollectionRemoveFromMobileHeader,
    registerMobileHeaderAction,
    t,
  ]);

  const collectionName = collection ? getCollectionName(collection, t) : '';
  usePageTitle({
    key: 'page.collectionDetail.title',
    fallback: collectionName || 'Collection',
  });
  useDocumentMetadata({
    robots: NON_INDEXABLE_ROBOTS_DIRECTIVE,
    socialPath: null,
  });

  const detailDescription = collection
    ? (collection.description ?? getCollectionDescription(collection, t))
    : null;
  const accent = collection
    ? COLLECTION_ACCENT_CLASS_BY_KEY[collection.accentKey]
    : null;
  const totalPages = itemsQuery.data
    ? Math.max(1, Math.ceil(itemsQuery.data.total / itemsQuery.data.pageSize))
    : 1;
  const addErrorMessage = addMutation.error
    ? handleApiProblem(addMutation.error, {
        fallbackKey: 'collections.detail.addError',
        messageKeys: collectionItemMutationMessageKeys,
        t,
      }).message
    : null;
  const editErrorMessage = updateItemMutation.error
    ? handleApiProblem(updateItemMutation.error, {
        fallbackKey: 'collections.detail.editItemError',
        t,
      }).message
    : null;
  const removeErrorMessage = removeItemMutation.error
    ? handleApiProblem(removeItemMutation.error, {
        fallbackKey: 'collections.detail.removeError',
        t,
      }).message
    : null;
  const collectionEditErrorMessage = updateCollectionMutation.error
    ? handleApiProblem(updateCollectionMutation.error, {
        fallbackKey: 'collections.form.error',
        t,
      }).message
    : null;
  const collectionRemoveErrorMessage = removeCollectionMutation.error
    ? handleApiProblem(removeCollectionMutation.error, {
        fallbackKey: 'collections.detail.deleteError',
        t,
      }).message
    : null;

  const items = useMemo(() => itemsQuery.data?.items ?? [], [itemsQuery.data]);

  if (collectionQuery.isError) {
    return (
      <PageStateShell>
        <ErrorState
          body={{ key: 'collections.error.body' }}
          title={{ key: 'collections.error.title' }}
          action={
            <Button
              onClick={() => void collectionQuery.refetch()}
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

  if (collectionQuery.isFetching || !collection) {
    return (
      <PageStateShell>
        <LoadingState label={{ key: 'collections.loading' }} />
      </PageStateShell>
    );
  }

  const isWishlist = collection.systemKey === 'wishlist';
  const ownerProfileHref = `/${encodeURIComponent(collection.owner.username)}`;
  const backHref = isOwner ? '/collections' : ownerProfileHref;
  const backLabel = isOwner
    ? t('collections.detail.back')
    : t('collections.detail.backToProfile');

  const openAddDialog = (trigger?: HTMLButtonElement) => {
    addMutation.reset();
    setAddedWorkIds(new Set());
    setAddDialogTrigger(trigger ?? null);
    setIsAddDialogOpen(true);
  };

  return (
    <PageShell background="paper" minHeight className="flex flex-col">
      <PageContainer
        size="comfortable"
        className="flex w-full min-w-0 flex-1 flex-col gap-8"
      >
        <PageHeader
          actions={
            isOwner && collection.systemKey === null ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  aria-label={t('collections.action.delete')}
                  className="![color:var(--danger)] hover:![color:var(--danger-strong)] active:![color:var(--danger-strong)]"
                  icon="trash-2"
                  iconSize={24}
                  onClick={(event) => openCollectionRemove(event.currentTarget)}
                  size="sm"
                  type="button"
                  variant="icon"
                />
                <Button
                  aria-label={t('collections.action.edit')}
                  icon="pencil-line"
                  iconSize={24}
                  onClick={(event) => openCollectionEditor(event.currentTarget)}
                  size="sm"
                  type="button"
                  variant="icon"
                />
              </div>
            ) : null
          }
          backHref={backHref}
          backLabel={backLabel}
          title={t('page.collectionDetail.title')}
        />

        <PageSection className="flex w-full min-w-0 flex-col gap-8">
          <section
            className="flex flex-wrap items-start gap-5 border-b border-rule/70 pb-6"
            aria-labelledby="collection-detail-heading"
          >
            <div
              className={`flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${accent?.border ?? 'border-rule'} ${accent?.surface ?? 'bg-vellum/50'}`}
            >
              {collection.coverUrl ? (
                <img
                  alt={t('collections.detail.collectionCoverAlt')}
                  className="h-full w-full object-cover"
                  src={collection.coverUrl}
                />
              ) : (
                <CollectionPresentationIcon
                  accentKey={collection.accentKey}
                  iconKey={collection.iconKey}
                  size={38}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="app-text-section-title m-0 text-ink"
                  id="collection-detail-heading"
                >
                  {collectionName}
                </h2>
              </div>
              {collection.owner.username !== user?.username ? (
                <p className="app-text-metadata mt-2 text-ink-3">
                  <Link
                    className="rounded-sm text-ink-2 underline decoration-rule underline-offset-2 hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
                    to={ownerProfileHref}
                  >
                    {t('collections.detail.owner', {
                      values: { username: `@${collection.owner.username}` },
                    })}
                  </Link>
                </p>
              ) : null}
              <p className="app-text-body mt-3 text-ink-2">
                {detailDescription ?? t('collections.noDescription')}
              </p>
              {!isOwner ? (
                <p className="app-text-caption mt-3 text-ink-3">
                  {t('collections.detail.readOnly')}
                </p>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="collection-items-heading">
            <SectionHeaderWithIcon
              actions={
                isOwner ? (
                  <Button
                    onClick={(event) => openAddDialog(event.currentTarget)}
                    prependIcon="plus"
                    type="button"
                    variant="secondary"
                  >
                    {t('collections.action.addItem')}
                  </Button>
                ) : null
              }
              icon="library"
              title={t('collections.detail.items')}
            />

            <div className="mt-4">
              {itemsQuery.isFetching ? (
                <LoadingState label={{ key: 'collections.detail.loading' }} />
              ) : itemsQuery.isError ? (
                <ErrorState
                  body={{ key: 'collections.detail.itemsError' }}
                  title={{ key: 'collections.error.title' }}
                  action={
                    <Button
                      onClick={() => void itemsQuery.refetch()}
                      type="button"
                      variant="secondary"
                    >
                      {t('collections.detail.retry')}
                    </Button>
                  }
                />
              ) : items.length === 0 ? (
                <EmptyState
                  action={
                    isOwner ? (
                      <Button
                        onClick={(event) => openAddDialog(event.currentTarget)}
                        prependIcon="plus"
                        type="button"
                      >
                        {t('collections.action.addItem')}
                      </Button>
                    ) : undefined
                  }
                  body={{ key: 'collections.detail.empty.body' }}
                  icon={collection.iconKey === 'love' ? 'heart' : 'bookmark'}
                  title={{ key: 'collections.detail.empty.title' }}
                />
              ) : (
                <>
                  <ul className="list-none space-y-4 p-0" role="list">
                    {items.map((item) => (
                      <li key={item.id}>
                        <CollectionItemRow
                          isOwner={isOwner}
                          isWishlist={isWishlist}
                          item={item}
                          onEdit={
                            isOwner && isOwnerCollectionItem(item)
                              ? (nextItem, trigger) => {
                                  updateItemMutation.reset();
                                  setEditItemFocusElement(trigger);
                                  setEditItem(nextItem);
                                }
                              : undefined
                          }
                          onRemove={
                            isOwner
                              ? (nextItem, trigger) => {
                                  removeItemMutation.reset();
                                  setRemoveItemFocusElement(trigger);
                                  setRemoveItem(nextItem);
                                }
                              : undefined
                          }
                        />
                      </li>
                    ))}
                  </ul>
                  {totalPages > 1 ? (
                    <div className="mt-6 flex justify-end border-t border-rule pt-4">
                      <Pagination
                        currentPageLabel={(pageNumber) =>
                          t('collections.detail.pagination.currentPage', {
                            values: { page: formatNumber(pageNumber) },
                          })
                        }
                        navLabel={t('collections.detail.pagination.nav')}
                        nextLabel={t('collections.detail.pagination.next')}
                        onPageChange={setPage}
                        page={page}
                        pageLabel={(pageNumber) =>
                          t('collections.detail.pagination.page', {
                            values: { page: formatNumber(pageNumber) },
                          })
                        }
                        previousLabel={t(
                          'collections.detail.pagination.previous',
                        )}
                        totalPages={totalPages}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </PageSection>
      </PageContainer>

      {isAddDialogOpen && isOwner ? (
        <CollectionItemAddDialog
          addedWorkIds={addedWorkIds}
          errorMessage={addErrorMessage}
          getReturnFocusElement={() => addDialogTrigger}
          isPending={addMutation.isPending}
          onClose={() => setIsAddDialogOpen(false)}
          onSelect={(result) =>
            addMutation.mutate({
              catalogEditionId: result.catalogEditionId,
              catalogWorkId: result.catalogWorkId,
            })
          }
        />
      ) : null}

      {isCollectionRemoveOpen && isOwner && collection.systemKey === null ? (
        <CollectionRemoveDialog
          collectionName={collectionName}
          errorMessage={collectionRemoveErrorMessage}
          getReturnFocusElement={() => collectionRemoveTrigger}
          isPending={removeCollectionMutation.isPending}
          onClose={() => {
            if (!removeCollectionMutation.isPending) {
              setIsCollectionRemoveOpen(false);
            }
          }}
          onConfirm={() => removeCollectionMutation.mutate()}
        />
      ) : null}

      {editItem && isOwner ? (
        <CollectionItemEditDialog
          errorMessage={editErrorMessage}
          getReturnFocusElement={() => editItemFocusElement}
          isPending={updateItemMutation.isPending}
          item={editItem}
          onClose={() => {
            if (!updateItemMutation.isPending) setEditItem(null);
          }}
          onSubmit={(values) => updateItemMutation.mutate(values)}
        />
      ) : null}

      {removeItem && isOwner ? (
        <CollectionItemRemoveDialog
          errorMessage={removeErrorMessage}
          isPending={removeItemMutation.isPending}
          item={removeItem}
          getReturnFocusElement={() => removeItemFocusElement}
          onClose={() => {
            if (!removeItemMutation.isPending) setRemoveItem(null);
          }}
          onConfirm={() => removeItemMutation.mutate()}
        />
      ) : null}

      {isCollectionEditorOpen && isOwner && collection.systemKey === null ? (
        <CollectionEditorDialog
          collection={collection}
          errorMessage={collectionEditErrorMessage}
          getReturnFocusElement={() => collectionEditorTrigger}
          isPending={updateCollectionMutation.isPending}
          onClose={() => {
            if (!updateCollectionMutation.isPending) {
              setIsCollectionEditorOpen(false);
            }
          }}
          onSubmit={(values) =>
            updateCollectionMutation.mutate({
              accentKey: values.accentKey,
              description: values.description,
              iconKey: values.iconKey,
              name: values.name ?? collection.name ?? '',
            })
          }
        />
      ) : null}
    </PageShell>
  );
}
