import {
  CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES,
  CATALOG_EDITION_COVER_UPLOAD_MAX_SIZE_BYTES,
  CATALOG_EDITION_COVER_UPLOAD_MIN_SIZE_BYTES,
  CATALOG_LANGUAGE_TAG_VALUES,
  updateAdminCatalogEditRequestSchema,
  formatCatalogLanguageLabel,
  type AdminCatalogEditEdition,
  type AdminCatalogEditTarget,
  type CatalogEditionCoverUploadContentType,
  type CatalogLanguageTag,
  type CatalogWorkType,
  type UpdateAdminCatalogEditRequest,
} from '@towelbooks/schemas';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Checkbox,
  Input,
  Select,
  Textarea,
} from '../../components/primitives';
import { FilterSelectableOption } from '../../components/filters';
import { useToast } from '../../components/feedback';
import {
  CatalogCoverMedia,
  catalogCoverSourcesFromUrl,
} from '../../entities/reading/ui';
import { createApiProblemToast } from '../../features/errors';
import {
  CatalogRoleContributorField,
  normalizeContributorDraftName,
} from './CatalogRoleContributorField';
import { useI18n } from '../../i18n';
import {
  publicationDateTimeFromInput,
  publicationDateTimeToInputValue,
} from '../../lib/datetime';
import { sdk } from '../../lib/sdk';

type EditDraft = {
  authors: string[];
  categorySlugs: string[];
  coverUrl: string;
  editionNumber: string;
  hideCatalogWork: boolean;
  hideEdition: boolean;
  imprint: string;
  language: CatalogLanguageTag | '';
  pageCount: string;
  publicationDate: string;
  publisher: string;
  seriesOrCollection: string;
  subtitle: string;
  synopsis: string;
  tags: string;
  title: string;
  type: CatalogWorkType;
  translators: string[];
  volume: string;
};

type LocalCover = { file: File; previewUrl: string };

export type EditCatalogWorkSurfaceProps = {
  identifier: string;
  target: AdminCatalogEditTarget;
  onCancel: () => void;
  onSuccess: (target: AdminCatalogEditTarget) => void;
};

function selectedEdition(
  target: AdminCatalogEditTarget,
): AdminCatalogEditEdition | null {
  return (
    target.editions.find(
      (edition) => edition.id === target.selectedEditionId,
    ) ?? null
  );
}

function uniqueNames(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return values.reduce<string[]>((result, value) => {
    const normalized = normalizeContributorDraftName(value);
    const key = normalized.toLocaleLowerCase();
    if (normalized && !seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
    return result;
  }, []);
}

function toDraft(
  target: AdminCatalogEditTarget,
  edition: AdminCatalogEditEdition,
): EditDraft {
  return {
    authors: uniqueNames(
      edition.contributors
        .filter((contributor) => contributor.role === 'author')
        .map((contributor) => contributor.name),
    ),
    categorySlugs: target.work.categories.map((category) => category.slug),
    // An empty field is intentional: submitting it preserves the current
    // cover, including first-party media assets that are not manual URL
    // overrides.
    coverUrl: '',
    editionNumber: edition.editionNumber ?? '',
    hideCatalogWork: target.work.hidden,
    hideEdition: edition.hidden,
    imprint: edition.imprint ?? '',
    language: edition.language ?? '',
    pageCount: edition.pageCount?.toString() ?? '',
    publicationDate: publicationDateTimeToInputValue(edition.publishedDate),
    publisher: edition.publisher ?? '',
    seriesOrCollection: edition.seriesOrCollection ?? '',
    subtitle: edition.subtitle ?? '',
    synopsis: edition.synopsis ?? '',
    tags: target.work.tags.join(', '),
    title: edition.title,
    type: target.work.type,
    translators: uniqueNames(
      edition.contributors
        .filter((contributor) => contributor.role === 'translator')
        .map((contributor) => contributor.name),
    ),
    volume: edition.volume ?? '',
  };
}

function nullableText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function nullableInteger(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isInteger(parsed) ? parsed : null;
}

function splitCommaList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function revokePreview(previewUrl: string): void {
  if (previewUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previewUrl);
}

export function EditCatalogWorkSurface({
  identifier,
  onCancel,
  onSuccess,
  target,
}: EditCatalogWorkSurfaceProps) {
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const selectedEditionId = target.selectedEditionId;
  const edition = selectedEditionId ? selectedEdition(target) : null;
  const [draft, setDraft] = useState<EditDraft | null>(() =>
    edition ? toDraft(target, edition) : null,
  );
  const [localCover, setLocalCover] = useState<LocalCover | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localCover) revokePreview(localCover.previewUrl);
    };
  }, [localCover]);

  const taxonomyQuery = useQuery({
    queryKey: ['catalog', 'taxonomy', 'active', locale],
    queryFn: () => sdk.catalog.listTaxonomyCategories(),
    staleTime: 5 * 60 * 1000,
  });

  if (!edition || !draft || !selectedEditionId) return null;

  const update = <K extends keyof EditDraft>(field: K, value: EditDraft[K]) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const pushFormError = (message: string) => {
    pushToast({
      message,
      title: t('errors.toast.title'),
      variant: 'error',
    });
  };

  const handleCoverFile = (file: File | undefined) => {
    if (!file) return;
    if (
      !(
        CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES as readonly string[]
      ).includes(file.type) ||
      file.size < CATALOG_EDITION_COVER_UPLOAD_MIN_SIZE_BYTES ||
      file.size > CATALOG_EDITION_COVER_UPLOAD_MAX_SIZE_BYTES
    ) {
      pushFormError(t('catalog.edit.form.coverFileError'));
      return;
    }
    if (localCover) revokePreview(localCover.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    setLocalCover({ file, previewUrl });
    update('coverUrl', '');
  };

  const toggleCategory = (slug: string) => {
    const next = draft.categorySlugs.includes(slug)
      ? draft.categorySlugs.filter((value) => value !== slug)
      : [...draft.categorySlugs, slug];
    update('categorySlugs', next);
  };

  const submit = async () => {
    const baseRequest = {
      authors: uniqueNames(draft.authors),
      categorySlugs: draft.categorySlugs,
      coverUrl: draft.coverUrl.trim() || undefined,
      editionNumber: nullableText(draft.editionNumber),
      hideCatalogWork: draft.hideCatalogWork,
      hideEdition: draft.hideEdition,
      imprint: nullableText(draft.imprint),
      language: draft.language || null,
      pageCount: nullableInteger(draft.pageCount),
      publicationDate: publicationDateTimeFromInput(draft.publicationDate),
      publisher: nullableText(draft.publisher),
      seriesOrCollection: nullableText(draft.seriesOrCollection),
      subtitle: nullableText(draft.subtitle),
      synopsis: nullableText(draft.synopsis),
      tags: splitCommaList(draft.tags),
      title: draft.title.trim(),
      type: draft.type,
      translators: uniqueNames(draft.translators),
      volume: nullableText(draft.volume),
    };
    const parsed = updateAdminCatalogEditRequestSchema.safeParse(baseRequest);
    if (!parsed.success) {
      pushFormError(
        draft.title.trim().length === 0
          ? t('catalog.contribution.form.requiredTitle')
          : t('catalog.edit.form.invalid'),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let request: UpdateAdminCatalogEditRequest = parsed.data;
      if (localCover) {
        const uploaded = await sdk.users.me.catalogEditionCovers.upload(
          localCover.file,
          {
            contentType: localCover.file
              .type as CatalogEditionCoverUploadContentType,
            sizeBytes: localCover.file.size,
          },
        );
        request = { ...request, coverMediaAssetId: uploaded.mediaAssetId };
      }
      const result = await sdk.adminCatalogEdit.updateEditTarget(
        identifier,
        request,
      );
      onSuccess(result);
      pushToast({
        title: t('catalog.edit.form.success'),
        variant: 'success',
      });
    } catch (error) {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'catalog.edit.form.error',
          t,
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="space-y-4">
        <div>
          <label
            className="app-text-label text-ink"
            htmlFor="catalog-edit-cover-url"
          >
            {t('catalog.edit.form.coverUrl')}
          </label>
          <Input
            id="catalog-edit-cover-url"
            placeholder={t('catalog.edit.form.coverUrlPlaceholder')}
            value={draft.coverUrl}
            onChange={(event) => {
              if (localCover) {
                revokePreview(localCover.previewUrl);
                setLocalCover(null);
              }
              update('coverUrl', event.currentTarget.value);
            }}
          />
          <p className="app-text-metadata m-0 mt-1 text-ink-3">
            {t('catalog.edit.form.coverUrlHint')}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 app-text-supporting-copy text-ink">
            <Checkbox
              aria-label={t('catalog.edit.form.hideWork')}
              checked={draft.hideCatalogWork}
              onCheckedChange={(checked) => update('hideCatalogWork', checked)}
            />
            {t('catalog.edit.form.hideWork')}
          </label>
          <label className="flex items-center gap-2 app-text-supporting-copy text-ink">
            <Checkbox
              aria-label={t('catalog.edit.form.hideEdition')}
              checked={draft.hideEdition}
              onCheckedChange={(checked) => update('hideEdition', checked)}
            />
            {t('catalog.edit.form.hideEdition')}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="h-28 w-20 overflow-hidden rounded-sm bg-paper-2">
            {localCover?.previewUrl ? (
              <img
                alt={t('catalog.contribution.form.coverAlt')}
                className="h-full w-full object-cover"
                src={localCover.previewUrl}
              />
            ) : (
              <CatalogCoverMedia
                author={draft.authors.join(', ')}
                coverDelivery={{ loading: 'eager', preferredVariant: 'detail' }}
                imageClassName="h-full w-full object-cover"
                size="fluid"
                sources={catalogCoverSourcesFromUrl(
                  edition.coverUrl,
                  edition.coverThumbnailUrl,
                )}
                theme={draft.title.charCodeAt(0)}
                title={draft.title}
              />
            )}
          </div>
          <input
            ref={coverInputRef}
            accept={CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES.join(
              ',',
            )}
            className="sr-only"
            id="catalog-edit-cover-file"
            onChange={(event) => {
              handleCoverFile(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
            type="file"
          />
          <Button
            onClick={() => coverInputRef.current?.click()}
            type="button"
            variant="secondary"
          >
            {t('catalog.edit.form.chooseCover')}
          </Button>
          {localCover ? (
            <Button
              onClick={() => {
                revokePreview(localCover.previewUrl);
                setLocalCover(null);
              }}
              type="button"
              variant="ghost"
            >
              {t('catalog.contribution.form.removeCover')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        <label className="space-y-1.5">
          <span className="app-text-label text-ink">
            {t('catalog.contribution.form.titleLabel')}
          </span>
          <Input
            value={draft.title}
            onChange={(event) => update('title', event.currentTarget.value)}
          />
        </label>
        <label className="space-y-1.5" htmlFor="catalog-edit-work-type">
          <span className="app-text-label text-ink">
            {t('catalog.contribution.form.workType')}
          </span>
          <Select
            id="catalog-edit-work-type"
            onChange={(event) =>
              update('type', event.currentTarget.value as CatalogWorkType)
            }
            value={draft.type}
          >
            <option value="book">
              {t('catalog.contribution.form.workType.book')}
            </option>
            <option value="manga">
              {t('catalog.contribution.form.workType.manga')}
            </option>
            <option value="comic">
              {t('catalog.contribution.form.workType.comic')}
            </option>
          </Select>
        </label>
        <label className="space-y-1.5">
          <span className="app-text-label text-ink">
            {t('catalog.contribution.form.language')}
          </span>
          <Select
            aria-label={t('catalog.contribution.form.language')}
            id="catalog-edit-language"
            onChange={(event) =>
              update(
                'language',
                event.currentTarget.value as CatalogLanguageTag | '',
              )
            }
            value={draft.language}
          >
            <option value="">
              {t('catalog.contribution.form.language.none')}
            </option>
            {CATALOG_LANGUAGE_TAG_VALUES.map((language) => (
              <option key={language} value={language}>
                {formatCatalogLanguageLabel(language, locale)}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1.5">
          <span className="app-text-label text-ink">
            {t('catalog.contribution.form.subtitle')}
          </span>
          <Input
            value={draft.subtitle}
            onChange={(event) => update('subtitle', event.currentTarget.value)}
          />
        </label>
        <CatalogRoleContributorField
          addLabel={t('catalog.contribution.form.authorsAdd')}
          dialogTitle={t('catalog.contribution.form.authorDialogTitle')}
          duplicateError={t('catalog.contribution.form.contributorDuplicate')}
          emptyMessage={t('catalog.contribution.form.authorsEmpty')}
          id="catalog-edit-authors"
          inputLabel={t('catalog.contribution.form.contributorNameLabel')}
          inputPlaceholder={t(
            'catalog.contribution.form.contributorNamePlaceholder',
          )}
          label={t('catalog.contribution.form.authors')}
          onChange={(values) => update('authors', values)}
          requiredError={t('catalog.contribution.form.contributorRequired')}
          values={draft.authors}
        />
        {(
          [
            ['publisher', 'catalog.contribution.form.publisher'],
            ['imprint', 'catalog.contribution.form.imprint'],
            ['editionNumber', 'catalog.contribution.form.editionNumber'],
            ['pageCount', 'catalog.contribution.form.pageCount'],
            ['seriesOrCollection', 'catalog.contribution.form.series'],
            ['volume', 'catalog.contribution.form.volume'],
          ] as const
        ).map(([field, labelKey]) => (
          <label className="space-y-1.5" key={field}>
            <span className="app-text-label text-ink">{t(labelKey)}</span>
            <Input
              inputMode={field === 'pageCount' ? 'numeric' : undefined}
              type={field === 'pageCount' ? 'number' : 'text'}
              value={draft[field]}
              onChange={(event) => update(field, event.currentTarget.value)}
            />
          </label>
        ))}
        <label className="space-y-1.5">
          <span className="app-text-label text-ink">
            {t('catalog.contribution.form.publicationDate')}
          </span>
          <Input
            lang={locale}
            onChange={(event) =>
              update('publicationDate', event.currentTarget.value)
            }
            type="date"
            value={draft.publicationDate}
          />
        </label>
        <CatalogRoleContributorField
          addLabel={t('catalog.contribution.form.translatorsAdd')}
          dialogTitle={t('catalog.contribution.form.translatorDialogTitle')}
          duplicateError={t('catalog.contribution.form.contributorDuplicate')}
          emptyMessage={t('catalog.contribution.form.translatorsEmpty')}
          id="catalog-edit-translators"
          inputLabel={t('catalog.contribution.form.contributorNameLabel')}
          inputPlaceholder={t(
            'catalog.contribution.form.contributorNamePlaceholder',
          )}
          label={t('catalog.contribution.form.translators')}
          onChange={(values) => update('translators', values)}
          requiredError={t('catalog.contribution.form.contributorRequired')}
          values={draft.translators}
        />
      </div>

      <label className="space-y-1.5">
        <span className="app-text-label text-ink">
          {t('catalog.contribution.form.synopsis')}
        </span>
        <Textarea
          rows={6}
          value={draft.synopsis}
          onChange={(event) => update('synopsis', event.currentTarget.value)}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="app-text-label text-ink">
          {t('catalog.contribution.form.genres')}
        </legend>
        {taxonomyQuery.isLoading ? (
          <p className="app-text-metadata m-0 text-ink-3">
            {t('catalog.contribution.form.genreLoading')}
          </p>
        ) : null}
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border border-rule/60 p-3">
          {(taxonomyQuery.data?.categories ?? []).map((category) => (
            <FilterSelectableOption
              isSelected={draft.categorySlugs.includes(category.slug)}
              key={category.slug}
              label={category.displayName}
              onToggle={() => toggleCategory(category.slug)}
            />
          ))}
        </div>
      </fieldset>

      <label className="space-y-1.5">
        <span className="app-text-label text-ink">
          {t('catalog.contribution.form.tags')}
        </span>
        <Input
          value={draft.tags}
          onChange={(event) => update('tags', event.currentTarget.value)}
        />
        <span className="app-text-metadata text-ink-3">
          {t('catalog.contribution.form.tagsHint')}
        </span>
      </label>

      <div className="flex flex-wrap justify-end gap-3">
        <Button onClick={onCancel} type="button" variant="ghost">
          {t('common.cancel')}
        </Button>
        <Button
          isLoading={isSubmitting}
          loadingLabel={t('catalog.edit.form.submitting')}
          type="submit"
        >
          {t('catalog.edit.form.submit')}
        </Button>
      </div>
    </form>
  );
}
