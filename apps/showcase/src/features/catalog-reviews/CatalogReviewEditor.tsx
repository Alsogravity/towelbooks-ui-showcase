import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import {
  type CatalogReviewEditorFormValues,
  createCatalogReviewEditorSchema,
} from './catalogReviewEditorCopy';
import { CatalogReviewEditorHeaderActions } from './CatalogReviewEditorHeaderActions';
import {
  buildCatalogReviewInitialValues,
  type CatalogReviewEditorMode,
  type CatalogReviewEditorProps,
} from './catalogReviewEditorShared';
import {
  buildCatalogReviewBackHref,
  type CatalogReviewOrigin,
} from './catalogReviewNavigation';
import { CatalogReviewForm } from './CatalogReviewForm';
import { CatalogReviewPreview } from './CatalogReviewPreview';
import { useCatalogReviewEditorMutations } from './useCatalogReviewEditorMutations';
import { useCatalogReviewUnsavedChangesGuard } from './useCatalogReviewUnsavedChangesGuard';
import { useToast } from '../../components/feedback';
import { PageContainer, PageHeader, PageShell } from '../../components/layout';
import { Alert } from '../../components/primitives';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

export function CatalogReviewEditor(props: CatalogReviewEditorProps) {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const mode: CatalogReviewEditorMode = props.mode;
  const initialCatalogWork =
    props.mode === 'create' ? props.initialCatalogWork : null;
  const initialReflection =
    props.mode === 'edit' ? props.initialReflection : null;
  const [serverError, setServerError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'edit' | 'readonly'>('edit');

  const initialValues = useMemo(
    () => buildCatalogReviewInitialValues(mode, initialReflection),
    [initialReflection, mode],
  );

  const editorTitle =
    mode === 'create'
      ? t('catalog.catalogReviewEditor.create.title')
      : t('catalog.catalogReviewEditor.edit.title');
  const linkedCatalogWork =
    mode === 'create'
      ? initialCatalogWork!
      : {
          catalogWorkId: initialReflection!.catalogWorkId,
          title: initialReflection!.target.title,
        };
  const schema = createCatalogReviewEditorSchema(t);

  usePageTitle({
    fallback: editorTitle,
    key:
      mode === 'create'
        ? 'catalog.catalogReviewEditor.create.title'
        : 'catalog.catalogReviewEditor.edit.title',
  });

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CatalogReviewEditorFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);
  const allowProgrammaticNavigationRef = useCatalogReviewUnsavedChangesGuard(
    isDirty,
    t,
  );

  const currentReflection = mode === 'edit' ? initialReflection : null;
  const origin: CatalogReviewOrigin | null = props.origin ?? null;
  const backHref = buildCatalogReviewBackHref(
    linkedCatalogWork.catalogWorkId,
    origin,
  );
  const backLabel = t(
    origin?.kind === 'catalog-review-discovery'
      ? 'catalog.catalogReviewNavigation.backToDiscovery'
      : origin?.kind === 'profile-reviews'
        ? 'catalog.catalogReviewNavigation.backToProfileReviews'
        : origin
          ? 'catalog.catalogReviewNavigation.backToLibraryItem'
          : 'catalog.catalogReviewNavigation.backToReviews',
  );
  const canSaveDraft =
    mode === 'create' || currentReflection?.status === 'draft';
  const canPublish = mode === 'create' || currentReflection?.status === 'draft';
  const canUpdate =
    mode === 'edit' && currentReflection?.status === 'published';
  const [watchedTitle = '', watchedBody = ''] = useWatch({
    control,
    name: ['title', 'body'],
  });
  const { deleteMutation, publishMutation, saveDraftMutation, updateMutation } =
    useCatalogReviewEditorMutations({
      allowProgrammaticNavigationRef,
      currentReflection,
      isDirty,
      linkedCatalogWork,
      mode,
      navigate,
      pushToast,
      queryClient,
      reset,
      sdk,
      setError,
      setServerError,
      locale,
      t,
      origin,
    });

  const isAnyActionPending =
    saveDraftMutation.isPending ||
    publishMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const description =
    mode === 'create'
      ? t('catalog.catalogReviewEditor.description.create', {
          values: { title: linkedCatalogWork.title },
        })
      : undefined;

  return (
    <PageShell background="paper" minHeight>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-vellum to-paper opacity-50" />
      <PageContainer size="wide">
        <PageHeader
          backHref={backHref}
          backLabel={backLabel}
          title={editorTitle}
          description={description}
          titleClassName={mode === 'edit' ? 'hidden md:block' : undefined}
          actions={
            <CatalogReviewEditorHeaderActions
              canDelete={mode === 'edit'}
              canPublish={canPublish}
              canSaveDraft={canSaveDraft}
              canUpdate={canUpdate}
              displayMode={displayMode}
              isDeleting={deleteMutation.isPending}
              isPublishing={publishMutation.isPending}
              isSaving={saveDraftMutation.isPending || updateMutation.isPending}
              onDelete={() => {
                setServerError(null);
                deleteMutation.mutate();
              }}
              onDisplayModeChange={setDisplayMode}
              onPublish={() => {
                setServerError(null);
                void handleSubmit((values) => publishMutation.mutate(values))();
              }}
              onSaveDraft={() => {
                setServerError(null);
                void handleSubmit((values) =>
                  saveDraftMutation.mutate(values),
                )();
              }}
              onUpdate={() => {
                setServerError(null);
                void handleSubmit((values) => updateMutation.mutate(values))();
              }}
            />
          }
        />

        <div className="mx-auto mt-24 max-w-5xl px-4 pb-24">
          {displayMode === 'edit' ? (
            <form
              className="space-y-12"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              {serverError ? (
                <Alert variant="error">{serverError}</Alert>
              ) : null}

              <CatalogReviewForm
                errors={errors}
                isDisabled={isAnyActionPending}
                register={register}
              />
            </form>
          ) : (
            <CatalogReviewPreview body={watchedBody} title={watchedTitle} />
          )}
        </div>
      </PageContainer>
    </PageShell>
  );
}
