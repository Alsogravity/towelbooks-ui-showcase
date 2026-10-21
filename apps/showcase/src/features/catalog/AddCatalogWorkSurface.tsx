import { useQuery } from '@tanstack/react-query';
import {
  CATALOG_EDITION_COVER_PROCESSED_IMAGE_PRESET,
  CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES,
  CATALOG_EDITION_COVER_UPLOAD_MAX_SIZE_BYTES,
  CATALOG_EDITION_COVER_UPLOAD_MIN_SIZE_BYTES,
  CATALOG_LANGUAGE_TAG_VALUES,
  CONTRIBUTION_HUMAN_VERIFICATION_ACTION,
  containsTextUrl,
  ErrorCode,
  applyContributorMatchDecisions,
  contributionRequestSchema,
  formatCatalogLanguageLabel,
  removeTextUrls,
  type CatalogEditionCoverUploadContentType,
  type AppLocale,
  type CatalogLanguageTag,
  type CatalogWorkType,
  type ContributionContributor,
  type ContributionContributorRole,
  type ContributorMatchDecision,
  type ContributionLocalProjection,
  type ContributionPrefill,
  type ContributionRequest,
  type ContributionResolutionResponse,
  type ContributionResponse,
  type CatalogTaxonomyCategoryOption,
  type ContributionTaxonomyUnmatchedLabel,
} from '@towelbooks/schemas';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  Alert,
  Button,
  ButtonLink,
  Card,
  FormSelectField,
  FormTextField,
  FormTextareaField,
  Icon,
} from '../../components/primitives';
import { LoadingState } from '../../components/feedback';
import { useToast } from '../../components/feedback';
import { FilterSelectableOption } from '../../components/filters';
import {
  TurnstileChallenge,
  type TurnstileChallengeHandle,
} from '../../components/human-verification';
import {
  CatalogCoverMedia,
  catalogCoverSourcesFromUrl,
} from '../../entities/reading/ui';
import { createApiProblemToast, handleApiProblem } from '../../features/errors';
import { CatalogContributorField } from './CatalogContributorField';
import { ContributorIdentityReviewDialog } from './ContributorIdentityReviewDialog';
import { catalogWorkPickerResultFromLocalProjection } from './CatalogWorkPicker';
import { normalizeCatalogContributionIdentifier } from './catalogContributionNavigation';
import { useI18n } from '../../i18n';
import {
  publicationDateTimeFromInput,
  publicationDateTimeToInputValue,
} from '../../lib/datetime';
import { sdk } from '../../lib/sdk';
import { getApiErrorCode } from '@towelbooks/sdk';

export type AddCatalogWorkSurfaceProps = {
  onCancel: () => void;
  onSuccess: (result: ContributionResponse) => void;
};

export type AddCatalogWorkFlowProps = {
  backAction?: ReactNode;
  initialIdentifier?: string;
  onIdentifierSubmit?: (identifier: string) => void;
  onIdentifierParamChange?: (identifier: string | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onResolutionChange?: (
    resolution: ContributionResolutionResponse | null,
  ) => void;
  existingBookPath?: (catalogWorkId: string) => string;
  onSuccess: (result: ContributionResponse) => void;
};

type AddCatalogWorkCoreProps = {
  backAction?: ReactNode;
  initialIdentifier?: string;
  onIdentifierSubmit?: (identifier: string) => void;
  onIdentifierParamChange?: (identifier: string | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onResolutionChange?: (
    resolution: ContributionResolutionResponse | null,
  ) => void;
  existingBookPath?: (catalogWorkId: string) => string;
  onCancel?: () => void;
  onSuccess: (result: ContributionResponse) => void;
};

export type FormFieldName =
  | 'categorySlugs'
  | 'contributors'
  | 'openLibraryCategoryKeys'
  | 'editionNumber'
  | 'imprint'
  | 'language'
  | 'pageCount'
  | 'publicationDate'
  | 'publisher'
  | 'seriesOrCollection'
  | 'subtitle'
  | 'synopsis'
  | 'tags'
  | 'title'
  | 'type'
  | 'volume';

export type FormDraft = {
  categorySlugs: string[];
  contributors: ContributionContributor[];
  openLibraryCategoryKeys: string[];
  editionNumber: string;
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
  volume: string;
};

type LocalCoverSelection = {
  file: File;
  previewUrl: string;
};

const contributionResolutions = new Set<
  ContributionResolutionResponse['resolution']
>(['new_work', 'new_edition_existing_work']);
const HUMAN_VERIFICATION_TOAST_KEY = 'catalog-contribution-human-verification';

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

function dedupeExactContributorRequestValues(
  values: readonly ContributionContributor[],
): ContributionContributor[] {
  const seen = new Set<string>();

  return values.reduce<ContributionContributor[]>((result, value) => {
    const normalized = value.name.trim().replace(/\s+/gu, ' ');
    const key = `${normalized.toLocaleLowerCase()}:${value.role}`;

    if (normalized && !seen.has(key)) {
      seen.add(key);
      result.push({ name: normalized, role: value.role });
    }

    return result;
  }, []);
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableInteger(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : null;
}

function formDraftFromPrefill(prefill: ContributionPrefill): FormDraft {
  return {
    categorySlugs: [],
    contributors: [...prefill.contributors],
    openLibraryCategoryKeys: [],
    editionNumber: prefill.editionNumber ?? '',
    imprint: '',
    language: prefill.language ?? '',
    pageCount: prefill.pageCount?.toString() ?? '',
    publicationDate: publicationDateTimeToInputValue(prefill.publicationDate),
    publisher: prefill.publisher ?? '',
    seriesOrCollection: prefill.seriesOrCollection ?? '',
    subtitle: prefill.subtitle ?? '',
    synopsis: removeTextUrls(prefill.synopsis ?? ''),
    tags: '',
    title: prefill.title ?? '',
    type: 'book',
    volume: '',
  };
}

export function mergeContributionPrefillIntoDraft(
  current: FormDraft | null,
  prefill: ContributionPrefill,
  dirtyFields: ReadonlySet<FormFieldName>,
): FormDraft {
  const next = formDraftFromPrefill(prefill);
  if (!current) return next;

  return {
    categorySlugs: dirtyFields.has('categorySlugs')
      ? current.categorySlugs
      : next.categorySlugs,
    contributors: dirtyFields.has('contributors')
      ? current.contributors
      : next.contributors,
    openLibraryCategoryKeys: dirtyFields.has('openLibraryCategoryKeys')
      ? current.openLibraryCategoryKeys
      : next.openLibraryCategoryKeys,
    editionNumber: dirtyFields.has('editionNumber')
      ? current.editionNumber
      : next.editionNumber,
    imprint: dirtyFields.has('imprint') ? current.imprint : next.imprint,
    language: dirtyFields.has('language') ? current.language : next.language,
    pageCount: dirtyFields.has('pageCount')
      ? current.pageCount
      : next.pageCount,
    publicationDate: dirtyFields.has('publicationDate')
      ? current.publicationDate
      : next.publicationDate,
    publisher: dirtyFields.has('publisher')
      ? current.publisher
      : next.publisher,
    seriesOrCollection: dirtyFields.has('seriesOrCollection')
      ? current.seriesOrCollection
      : next.seriesOrCollection,
    subtitle: dirtyFields.has('subtitle') ? current.subtitle : next.subtitle,
    synopsis: dirtyFields.has('synopsis') ? current.synopsis : next.synopsis,
    tags: dirtyFields.has('tags') ? current.tags : next.tags,
    title: dirtyFields.has('title') ? current.title : next.title,
    type: dirtyFields.has('type') ? current.type : next.type,
    volume: dirtyFields.has('volume') ? current.volume : next.volume,
  };
}

function toContributionRequest(
  draft: FormDraft,
  identifier: string,
  isExistingWork: boolean,
  coverMediaAssetId: string | null,
): ContributionRequest {
  return {
    categorySlugs: isExistingWork ? [] : draft.categorySlugs,
    contributors: dedupeExactContributorRequestValues(draft.contributors),
    coverMediaAssetId,
    editionNumber: nullableText(draft.editionNumber),
    identifier,
    imprint: nullableText(draft.imprint),
    language: draft.language || null,
    openLibraryCategoryKeys: isExistingWork
      ? []
      : draft.openLibraryCategoryKeys,
    pageCount: nullableInteger(draft.pageCount),
    publicationDate: publicationDateTimeFromInput(draft.publicationDate),
    publisher: nullableText(draft.publisher),
    seriesOrCollection: nullableText(draft.seriesOrCollection),
    subtitle: nullableText(draft.subtitle),
    synopsis: nullableText(draft.synopsis),
    tags: isExistingWork ? [] : splitCommaList(draft.tags),
    title: draft.title.trim(),
    ...(isExistingWork ? {} : { type: draft.type }),
    volume: nullableText(draft.volume),
  };
}

function getCoverError(file: File, t: (key: string) => string): string | null {
  if (
    !(
      CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES as readonly string[]
    ).includes(file.type)
  ) {
    return t('catalog.contribution.form.coverTypeError');
  }

  if (
    file.size < CATALOG_EDITION_COVER_UPLOAD_MIN_SIZE_BYTES ||
    file.size > CATALOG_EDITION_COVER_UPLOAD_MAX_SIZE_BYTES
  ) {
    return t('catalog.contribution.form.coverSizeError');
  }

  return null;
}

function capitalizeLanguageLabel(
  label: string | null,
  locale: AppLocale,
): string | null {
  return !label
    ? label
    : `${label[0].toLocaleUpperCase(locale)}${label.slice(1)}`;
}

function revokeObjectUrl(url: string) {
  if (url && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    URL.revokeObjectURL(url);
  }
}

function LocalProjectionCard({
  action,
  local,
  title,
}: {
  action: ReactNode;
  local: ContributionLocalProjection;
  title: string;
}) {
  const result = catalogWorkPickerResultFromLocalProjection(local);

  return (
    <Card className="flex flex-col items-center gap-6 border-rule/70 bg-vellum">
      <h2 className="app-text-section-title m-0 w-full text-center text-ink">
        {title}
      </h2>
      <div className="aspect-[2/3] w-56 max-w-full overflow-hidden rounded-sm bg-paper-2 sm:w-64">
        <CatalogCoverMedia
          alt={result.title}
          author={result.contributors[0] ?? ''}
          coverDelivery={{ loading: 'eager', preferredVariant: 'detail' }}
          imageClassName="h-full w-full object-cover"
          size="fluid"
          sources={catalogCoverSourcesFromUrl(
            result.coverUrl,
            result.coverThumbnailUrl,
            result.coverGeometry,
          )}
          theme={result.catalogWorkId.charCodeAt(0)}
          title={result.title}
        />
      </div>
      {action}
    </Card>
  );
}

function AddCatalogWorkCore({
  backAction,
  initialIdentifier,
  onCancel,
  onIdentifierSubmit,
  onIdentifierParamChange,
  onLoadingChange,
  onResolutionChange,
  existingBookPath,
  onSuccess,
}: AddCatalogWorkCoreProps) {
  const { locale, t } = useI18n();
  const { pushToast } = useToast();
  const hasSurfaceChrome = onCancel !== undefined;
  const isIdentifierEntry = onIdentifierSubmit !== undefined;
  const isMetadataRoute = !hasSurfaceChrome && !isIdentifierEntry;
  const [identifierDraft, setIdentifierDraft] = useState(
    normalizeCatalogContributionIdentifier(initialIdentifier ?? ''),
  );
  const [resolution, setResolution] =
    useState<ContributionResolutionResponse | null>(null);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [surfaceError, setSurfaceError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(
    () => isMetadataRoute && Boolean(initialIdentifier?.trim()),
  );
  const [formDraft, setFormDraft] = useState<FormDraft | null>(null);
  const [isContributorReviewOpen, setIsContributorReviewOpen] = useState(false);
  const [contributorReviewDecisions, setContributorReviewDecisions] = useState<
    Map<string, ContributorMatchDecision>
  >(() => new Map());
  const [dirtyFields, setDirtyFields] = useState<Set<FormFieldName>>(
    () => new Set(),
  );
  const [localCover, setLocalCover] = useState<LocalCoverSelection | null>(
    null,
  );
  const [coverError, setCoverError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [humanVerificationRequired, setHumanVerificationRequired] =
    useState(false);
  const [humanVerificationToken, setHumanVerificationToken] = useState<
    string | null
  >(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const humanVerificationRef = useRef<TurnstileChallengeHandle>(null);
  const pendingSynopsisUrlRemovalBaseRef = useRef<string | null>(null);

  const resetHumanVerification = useCallback(() => {
    setHumanVerificationToken(null);
    humanVerificationRef.current?.reset();
  }, []);

  const notifyCoverError = useCallback(
    (message: string) => {
      setCoverError(message);
      pushToast({
        title: message,
        variant: 'error',
      });
    },
    [pushToast],
  );

  const notifyHumanVerificationError = useCallback(() => {
    pushToast({
      message: t('humanVerification.error'),
      replaceKey: HUMAN_VERIFICATION_TOAST_KEY,
      title: t('errors.toast.title'),
      variant: 'error',
    });
  }, [pushToast, t]);

  const notifyHumanVerificationApiError = useCallback(
    (error: unknown) => {
      pushToast({
        ...createApiProblemToast(error, {
          fallbackKey: 'catalog.contribution.form.error',
          t,
        }),
        replaceKey: HUMAN_VERIFICATION_TOAST_KEY,
      });
    },
    [pushToast, t],
  );

  const isContribution = resolution
    ? contributionResolutions.has(resolution.resolution)
    : false;
  const isExistingWork = resolution?.resolution === 'new_edition_existing_work';

  const taxonomyQuery = useQuery({
    enabled: isContribution,
    queryKey: ['catalog', 'taxonomy', 'active', locale],
    queryFn: () => sdk.catalog.listTaxonomyCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const taxonomyOptions = useMemo(
    () => taxonomyQuery.data?.categories ?? [],
    [taxonomyQuery.data],
  );
  const suggestedCategorySlugs = useMemo(
    () =>
      (resolution?.prefill.taxonomySuggestions.categories ?? []).map(
        (option) => option.slug,
      ),
    [resolution?.prefill.taxonomySuggestions.categories],
  );
  const unmatchedTaxonomyOptions = useMemo<
    ContributionTaxonomyUnmatchedLabel[]
  >(
    () => resolution?.prefill.taxonomySuggestions.unmatchedLabels ?? [],
    [resolution?.prefill.taxonomySuggestions.unmatchedLabels],
  );

  useEffect(() => {
    return () => {
      if (localCover) {
        revokeObjectUrl(localCover.previewUrl);
      }
    };
  }, [localCover]);

  const resetToIdentifier = () => {
    pendingSynopsisUrlRemovalBaseRef.current = null;
    onResolutionChange?.(null);
    setResolution(null);
    setFormDraft(null);
    setIsContributorReviewOpen(false);
    setContributorReviewDecisions(new Map());
    setIdentifierDraft('');
    setIdentifierError(null);
    setSurfaceError(null);
    setDirtyFields(new Set());
    setCoverError(null);
    setLocalCover(null);
    setHumanVerificationRequired(false);
    resetHumanVerification();
    onIdentifierParamChange?.(null);
  };

  const resolveIdentifier = useCallback(
    async (requestedIdentifier = identifierDraft) => {
      setIdentifierError(null);
      setSurfaceError(null);
      setHumanVerificationRequired(false);
      resetHumanVerification();
      setIsResolving(true);
      onResolutionChange?.(null);
      onLoadingChange?.(true);

      try {
        const normalizedIdentifier =
          normalizeCatalogContributionIdentifier(requestedIdentifier);
        const nextResolution = await sdk.catalog.resolveContribution({
          identifier: normalizedIdentifier,
        });

        setResolution(nextResolution);
        const possibleContributorMatches =
          nextResolution.prefill.possibleContributorMatches ?? [];
        setContributorReviewDecisions(new Map());
        setIsContributorReviewOpen(possibleContributorMatches.length > 0);
        onResolutionChange?.(nextResolution);
        setIdentifierDraft(nextResolution.identifier.value);
        if (
          onIdentifierParamChange &&
          nextResolution.identifier.value !== initialIdentifier
        ) {
          onIdentifierParamChange(nextResolution.identifier.value);
        }
        const nextDirtyFields = new Set<FormFieldName>();
        pendingSynopsisUrlRemovalBaseRef.current = null;
        setDirtyFields(nextDirtyFields);
        setLocalCover(null);
        setCoverError(null);
        setHumanVerificationRequired(false);
        resetHumanVerification();
        setFormDraft(
          contributionResolutions.has(nextResolution.resolution)
            ? mergeContributionPrefillIntoDraft(
                null,
                nextResolution.prefill,
                nextDirtyFields,
              )
            : null,
        );
      } catch (error) {
        const handledProblem = handleApiProblem(error, {
          fallbackKey: 'catalog.contribution.identifier.error',
          t,
        });
        const identifierValidationError = handledProblem.validationErrors.find(
          (validationError) => validationError.field === 'identifier',
        );

        if (identifierValidationError) {
          setIdentifierError(identifierValidationError.message);
        } else {
          pushToast(
            createApiProblemToast(error, {
              fallbackKey: 'catalog.contribution.identifier.error',
              t,
            }),
          );
        }
      } finally {
        setIsResolving(false);
        onLoadingChange?.(false);
      }
    },
    [
      identifierDraft,
      initialIdentifier,
      onIdentifierParamChange,
      onLoadingChange,
      onResolutionChange,
      pushToast,
      resetHumanVerification,
      t,
    ],
  );

  const autoResolvedIdentifierRef = useRef<string | null>(null);

  useEffect(() => {
    const normalizedIdentifier = normalizeCatalogContributionIdentifier(
      initialIdentifier ?? '',
    );

    if (
      isIdentifierEntry ||
      normalizedIdentifier.length === 0 ||
      resolution !== null ||
      autoResolvedIdentifierRef.current === normalizedIdentifier
    ) {
      return;
    }

    autoResolvedIdentifierRef.current = normalizedIdentifier;
    setIdentifierDraft(normalizedIdentifier);
    void resolveIdentifier(normalizedIdentifier);
  }, [initialIdentifier, isIdentifierEntry, resolution, resolveIdentifier]);

  const updateTextField = <
    K extends Exclude<FormFieldName, 'categorySlugs' | 'contributors'>,
  >(
    field: K,
    value: string,
  ) => {
    let nextValue = value;

    if (field === 'synopsis') {
      const pendingBase = pendingSynopsisUrlRemovalBaseRef.current;
      const pendingSuffix =
        pendingBase !== null && value.startsWith(pendingBase)
          ? value.slice(pendingBase.length)
          : null;

      if (
        pendingBase !== null &&
        pendingSuffix !== null &&
        pendingSuffix.length > 0
      ) {
        if (/^\s/u.test(pendingSuffix)) {
          pendingSynopsisUrlRemovalBaseRef.current = null;
        } else {
          nextValue = pendingBase;
        }
      }

      if (nextValue === value && containsTextUrl(value)) {
        nextValue = removeTextUrls(value);
        pendingSynopsisUrlRemovalBaseRef.current =
          value.trimEnd() === value ? nextValue : null;
        pushToast({
          title: t('catalog.contribution.form.synopsisUrlRemovedTitle'),
          message: t('catalog.contribution.form.synopsisUrlRemoved'),
          variant: 'warning',
        });
      } else if (pendingSuffix === null) {
        pendingSynopsisUrlRemovalBaseRef.current = null;
      }
    }

    setDirtyFields((current) => new Set(current).add(field));
    setFormDraft((current) =>
      current ? { ...current, [field]: nextValue } : current,
    );
    setSurfaceError(null);
  };

  const updateContributorField = (values: ContributionContributor[]) => {
    setDirtyFields((current) => new Set(current).add('contributors'));
    setFormDraft((current) =>
      current ? { ...current, contributors: values } : current,
    );
    setSurfaceError(null);
  };

  const toggleCategory = (option: CatalogTaxonomyCategoryOption) => {
    setDirtyFields((current) => new Set(current).add('categorySlugs'));
    setFormDraft((current) => {
      if (!current) {
        return current;
      }

      const selectedSlugs =
        current.categorySlugs.length === 0 && !dirtyFields.has('categorySlugs')
          ? suggestedCategorySlugs
          : current.categorySlugs;
      const categorySlugs = selectedSlugs.includes(option.slug)
        ? selectedSlugs.filter((slug) => slug !== option.slug)
        : [...selectedSlugs, option.slug];

      return { ...current, categorySlugs };
    });
  };

  const toggleOpenLibraryCategory = (
    option: ContributionTaxonomyUnmatchedLabel,
  ) => {
    setDirtyFields((current) =>
      new Set(current).add('openLibraryCategoryKeys'),
    );
    setFormDraft((current) => {
      if (!current) return current;

      const openLibraryCategoryKeys = current.openLibraryCategoryKeys.includes(
        option.normalizedKey,
      )
        ? current.openLibraryCategoryKeys.filter(
            (key) => key !== option.normalizedKey,
          )
        : [...current.openLibraryCategoryKeys, option.normalizedKey];

      return { ...current, openLibraryCategoryKeys };
    });
  };

  const handleCoverSelection = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const validationError = getCoverError(file, t);
    if (validationError) {
      notifyCoverError(validationError);
      return;
    }

    const previewUrl =
      typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(file)
        : '';
    setCoverError(null);
    setLocalCover({ file, previewUrl });

    if (previewUrl && typeof Image !== 'undefined') {
      const image = new Image();
      image.onload = () => {
        const valid =
          image.naturalWidth >=
            CATALOG_EDITION_COVER_PROCESSED_IMAGE_PRESET.minWidth &&
          image.naturalHeight >=
            CATALOG_EDITION_COVER_PROCESSED_IMAGE_PRESET.minHeight &&
          image.naturalWidth / image.naturalHeight <= 1;

        if (!valid) {
          notifyCoverError(t('catalog.contribution.form.coverDimensionsError'));
          setLocalCover((current) => {
            if (current?.previewUrl !== previewUrl) {
              return current;
            }

            revokeObjectUrl(previewUrl);
            return null;
          });
        }
      };
      image.src = previewUrl;
    }
  };

  const submitContribution = async () => {
    if (!resolution || !formDraft || !isContribution) {
      return;
    }

    setSurfaceError(null);
    if (coverError) {
      return;
    }

    let coverMediaAssetId: string | null = null;

    try {
      const categorySlugs =
        !isExistingWork &&
        formDraft.categorySlugs.length === 0 &&
        !dirtyFields.has('categorySlugs')
          ? suggestedCategorySlugs
          : formDraft.categorySlugs;
      const draftRequest = toContributionRequest(
        { ...formDraft, categorySlugs },
        resolution.identifier.value,
        isExistingWork,
        null,
      );
      const parsedRequest = contributionRequestSchema.safeParse(draftRequest);

      if (!parsedRequest.success) {
        setSurfaceError(
          formDraft.title.trim().length === 0
            ? t('catalog.contribution.form.requiredTitle')
            : t('catalog.contribution.form.invalid'),
        );
        return;
      }

      if (humanVerificationRequired && !humanVerificationToken) {
        setSurfaceError(t('catalog.contribution.verification.required'));
        return;
      }

      setIsSubmitting(true);

      if (localCover) {
        const uploadedCover = await sdk.users.me.catalogEditionCovers.upload(
          localCover.file,
          {
            contentType: localCover.file
              .type as CatalogEditionCoverUploadContentType,
            sizeBytes: localCover.file.size,
          },
        );
        coverMediaAssetId = uploadedCover.mediaAssetId;
      }

      const result = await sdk.catalog.createContribution({
        ...parsedRequest.data,
        coverMediaAssetId,
        ...(humanVerificationToken ? { humanVerificationToken } : {}),
      });
      setHumanVerificationRequired(false);
      onSuccess(result);
    } catch (error) {
      const code = getApiErrorCode(error);
      if (code === ErrorCode.CATALOG_CONTRIBUTION_HUMAN_VERIFICATION_REQUIRED) {
        setHumanVerificationRequired(true);
        notifyHumanVerificationApiError(error);
      } else if (
        code === ErrorCode.CATALOG_CONTRIBUTION_HUMAN_VERIFICATION_FAILED
      ) {
        setHumanVerificationRequired(true);
        notifyHumanVerificationApiError(error);
      } else {
        pushToast(
          createApiProblemToast(error, {
            fallbackKey: 'catalog.contribution.form.error',
            t,
          }),
        );
      }
    } finally {
      setIsSubmitting(false);
      resetHumanVerification();
    }
  };

  if (!resolution && isMetadataRoute && isResolving) {
    return (
      <section
        aria-busy="true"
        className="flex min-h-[24rem] flex-1 items-center justify-center px-4 py-8"
      >
        <LoadingState />
      </section>
    );
  }

  return (
    <section
      aria-labelledby={hasSurfaceChrome ? 'add-catalog-work-title' : undefined}
      className="space-y-6"
    >
      {hasSurfaceChrome ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="app-text-eyebrow m-0 text-ink-3">
              {t('catalog.workDetail.eyebrow')}
            </p>
            <h1
              className="app-text-page-title m-0 text-ink"
              id="add-catalog-work-title"
            >
              {t('catalog.contribution.title')}
            </h1>
          </div>
          <Button onClick={onCancel} type="button" variant="ghost">
            {t('common.close')}
          </Button>
        </div>
      ) : null}

      {!resolution ? (
        <form
          className="max-w-xl space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            const requestedIdentifier =
              normalizeCatalogContributionIdentifier(identifierDraft);

            if (isIdentifierEntry && requestedIdentifier.length === 0) {
              setIdentifierError(t('catalog.contribution.identifier.error'));
              return;
            }

            if (onIdentifierSubmit) {
              onIdentifierSubmit(requestedIdentifier);
              return;
            }

            void resolveIdentifier(requestedIdentifier);
          }}
        >
          <FormTextField
            autoFocus
            autoComplete="off"
            error={identifierError ?? undefined}
            id="catalog-contribution-identifier"
            label={t('catalog.contribution.identifier.label')}
            placeholder={t('catalog.contribution.identifier.placeholder')}
            value={identifierDraft}
            onChange={(event) => {
              setIdentifierDraft(
                normalizeCatalogContributionIdentifier(
                  event.currentTarget.value,
                ),
              );
              setIdentifierError(null);
              setSurfaceError(null);
            }}
          />
          {surfaceError ? <Alert variant="error">{surfaceError}</Alert> : null}
          <div className={hasSurfaceChrome ? 'flex justify-end' : 'flex'}>
            <Button
              className={hasSurfaceChrome ? undefined : 'w-full justify-center'}
              isLoading={isResolving}
              loadingLabel={t('catalog.picker.searching')}
              type="submit"
            >
              {t('catalog.contribution.identifier.continue')}
            </Button>
          </div>
        </form>
      ) : resolution.resolution === 'blocked_existing' ? (
        <div className="max-w-xl space-y-4">
          <Alert variant="error">
            <strong className="block">
              {t('catalog.contribution.blocked.title')}
            </strong>
            <span>{t('catalog.contribution.blocked.body')}</span>
          </Alert>
          <div className="flex flex-wrap items-center gap-3">
            {backAction}
            <Button
              onClick={resetToIdentifier}
              type="button"
              variant="secondary"
            >
              {t('catalog.contribution.identifier.change')}
            </Button>
          </div>
        </div>
      ) : resolution.resolution === 'existing_edition' && resolution.local ? (
        <div className="max-w-xl">
          <LocalProjectionCard
            action={
              <div className="flex w-full flex-col gap-3 sm:flex-row-reverse sm:justify-start">
                {existingBookPath ? (
                  <ButtonLink
                    className="w-full justify-center sm:w-48 lg:w-52"
                    to={existingBookPath(resolution.local.work.id)}
                  >
                    {t('catalog.contribution.existing.open')}
                  </ButtonLink>
                ) : (
                  <Button
                    className="w-full justify-center sm:w-48 lg:w-52"
                    onClick={() => {
                      const local = resolution.local;
                      if (!local) return;
                      onSuccess({
                        catalogEditionId:
                          local.edition?.id ??
                          local.work.display.catalogEditionId ??
                          local.work.id,
                        catalogWorkId: local.work.id,
                        local,
                        outcome: 'edition_reused',
                      });
                    }}
                    type="button"
                  >
                    {t('catalog.contribution.existing.open')}
                  </Button>
                )}
                {backAction}
              </div>
            }
            local={resolution.local}
            title={t('catalog.contribution.existing.title')}
          />
        </div>
      ) : isContribution && formDraft && resolution ? (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submitContribution();
          }}
        >
          {hasSurfaceChrome ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="app-text-section-title m-0 text-ink">
                  {t('catalog.contribution.form.title')}
                </h2>
                {isExistingWork ? (
                  <p className="app-text-supporting-copy m-0 mt-1 max-w-2xl text-ink-3">
                    {t('catalog.contribution.form.existingWork')}
                  </p>
                ) : null}
              </div>
              <Button onClick={resetToIdentifier} type="button" variant="ghost">
                {t('catalog.contribution.identifier.change')}
              </Button>
            </div>
          ) : isExistingWork ? (
            <p className="app-text-supporting-copy m-0 max-w-2xl text-ink-3">
              {t('catalog.contribution.form.existingWork')}
            </p>
          ) : null}

          <div className="grid gap-6">
            <div className="space-y-3">
              <div className="mx-auto aspect-[2/3] w-40 max-w-full overflow-hidden rounded-sm bg-paper-2">
                {localCover?.previewUrl ? (
                  <img
                    alt={t('catalog.contribution.form.coverAlt')}
                    className="h-full w-full object-cover"
                    src={localCover.previewUrl}
                  />
                ) : resolution.prefill.cover?.url ||
                  resolution.prefill.cover?.thumbnailUrl ? (
                  <CatalogCoverMedia
                    author={formDraft.contributors[0]?.name ?? ''}
                    coverDelivery={{
                      loading: 'eager',
                      preferredVariant: 'detail',
                    }}
                    imageClassName="h-full w-full object-cover"
                    size="fluid"
                    sources={catalogCoverSourcesFromUrl(
                      resolution.prefill.cover.url,
                      resolution.prefill.cover.thumbnailUrl,
                    )}
                    theme={formDraft.title.charCodeAt(0)}
                    title={formDraft.title}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-3 text-center app-text-metadata text-ink-3">
                    {t('catalog.contribution.form.cover')}
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                accept={CATALOG_EDITION_COVER_UPLOAD_ALLOWED_CONTENT_TYPES.join(
                  ',',
                )}
                className="sr-only"
                id="catalog-contribution-cover"
                onChange={(event) => {
                  handleCoverSelection(event.currentTarget.files?.[0]);
                  event.currentTarget.value = '';
                }}
                type="file"
              />
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  onClick={() => coverInputRef.current?.click()}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {localCover
                    ? t('catalog.contribution.form.replaceCover')
                    : t('catalog.contribution.form.chooseCover')}
                </Button>
                {localCover ? (
                  <Button
                    aria-label={t('catalog.contribution.form.removeCover')}
                    onClick={() => setLocalCover(null)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {t('catalog.contribution.form.removeCover')}
                  </Button>
                ) : null}
              </div>
              <p className="app-text-metadata m-0 text-ink-3">
                {resolution.prefill.cover
                  ? t('catalog.contribution.form.coverProvider')
                  : null}
                {resolution.prefill.cover ? ' · ' : ''}
                {t('catalog.contribution.form.coverHint')}
              </p>
            </div>

            <div className="grid gap-4">
              <FormTextField
                error={
                  formDraft.title.trim().length === 0 && surfaceError
                    ? t('catalog.contribution.form.requiredTitle')
                    : undefined
                }
                id="catalog-contribution-title"
                label={t('catalog.contribution.form.titleLabel')}
                onChange={(event) =>
                  updateTextField('title', event.currentTarget.value)
                }
                value={formDraft.title}
              />
              {!isExistingWork ? (
                <FormSelectField
                  id="catalog-contribution-work-type"
                  label={t('catalog.contribution.form.workType')}
                  onChange={(event) =>
                    updateTextField(
                      'type',
                      event.currentTarget.value as CatalogWorkType,
                    )
                  }
                  value={formDraft.type}
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
                </FormSelectField>
              ) : null}
              <FormTextField
                id="catalog-contribution-subtitle"
                label={t('catalog.contribution.form.subtitle')}
                onChange={(event) =>
                  updateTextField('subtitle', event.currentTarget.value)
                }
                value={formDraft.subtitle}
              />
              <CatalogContributorField
                addLabel={t('catalog.contribution.form.contributorAdd')}
                dialogTitle={t(
                  'catalog.contribution.form.contributorDialogTitle',
                )}
                duplicateError={t(
                  'catalog.contribution.form.contributorRoleDuplicate',
                )}
                emptyMessage={t('catalog.contribution.form.contributorsEmpty')}
                id="catalog-contribution-contributors"
                inputLabel={t('catalog.contribution.form.contributorNameLabel')}
                inputPlaceholder={t(
                  'catalog.contribution.form.contributorNamePlaceholder',
                )}
                label={t('catalog.contribution.form.contributors')}
                onChange={updateContributorField}
                requiredError={t(
                  'catalog.contribution.form.contributorRequired',
                )}
                roleLabel={t('catalog.contribution.form.contributorRoleLabel')}
                roleOptions={[
                  {
                    label: t(
                      'catalog.contribution.form.contributorRole.author',
                    ),
                    value: 'author' as ContributionContributorRole,
                  },
                  {
                    label: t(
                      'catalog.contribution.form.contributorRole.editor',
                    ),
                    value: 'editor' as ContributionContributorRole,
                  },
                  {
                    label: t(
                      'catalog.contribution.form.contributorRole.illustrator',
                    ),
                    value: 'illustrator' as ContributionContributorRole,
                  },
                  {
                    label: t(
                      'catalog.contribution.form.contributorRole.translator',
                    ),
                    value: 'translator' as ContributionContributorRole,
                  },
                  {
                    label: t(
                      'catalog.contribution.form.contributorRole.narrator',
                    ),
                    value: 'narrator' as ContributionContributorRole,
                  },
                  {
                    label: t(
                      'catalog.contribution.form.contributorRole.contributor',
                    ),
                    value: 'contributor' as ContributionContributorRole,
                  },
                ]}
                roleRequiredError={t(
                  'catalog.contribution.form.contributorRoleRequired',
                )}
                values={formDraft.contributors}
              />
              <FormTextField
                id="catalog-contribution-publisher"
                label={t('catalog.contribution.form.publisher')}
                onChange={(event) =>
                  updateTextField('publisher', event.currentTarget.value)
                }
                value={formDraft.publisher}
              />
              <FormTextField
                id="catalog-contribution-imprint"
                label={t('catalog.contribution.form.imprint')}
                onChange={(event) =>
                  updateTextField('imprint', event.currentTarget.value)
                }
                value={formDraft.imprint}
              />
              <FormTextField
                id="catalog-contribution-edition-number"
                label={t('catalog.contribution.form.editionNumber')}
                onChange={(event) =>
                  updateTextField('editionNumber', event.currentTarget.value)
                }
                value={formDraft.editionNumber}
              />
              <FormTextField
                id="catalog-contribution-publication-date"
                label={t('catalog.contribution.form.publicationDate')}
                lang={locale}
                onChange={(event) =>
                  updateTextField('publicationDate', event.currentTarget.value)
                }
                type="date"
                value={formDraft.publicationDate}
              />
              <FormTextField
                id="catalog-contribution-page-count"
                label={t('catalog.contribution.form.pageCount')}
                inputMode="numeric"
                onChange={(event) =>
                  updateTextField('pageCount', event.currentTarget.value)
                }
                type="number"
                value={formDraft.pageCount}
              />
              <FormSelectField
                id="catalog-contribution-language"
                label={t('catalog.contribution.form.language')}
                onChange={(event) =>
                  updateTextField(
                    'language',
                    event.currentTarget.value as CatalogLanguageTag | '',
                  )
                }
                value={formDraft.language}
              >
                <option value="">
                  {t('catalog.contribution.form.language.none')}
                </option>
                {CATALOG_LANGUAGE_TAG_VALUES.map((language) => (
                  <option key={language} value={language}>
                    {capitalizeLanguageLabel(
                      formatCatalogLanguageLabel(language, locale),
                      locale,
                    )}
                  </option>
                ))}
              </FormSelectField>
              <FormTextField
                id="catalog-contribution-series"
                label={t('catalog.contribution.form.series')}
                onChange={(event) =>
                  updateTextField(
                    'seriesOrCollection',
                    event.currentTarget.value,
                  )
                }
                value={formDraft.seriesOrCollection}
              />
              <FormTextField
                id="catalog-contribution-volume"
                label={t('catalog.contribution.form.volume')}
                onChange={(event) =>
                  updateTextField('volume', event.currentTarget.value)
                }
                value={formDraft.volume}
              />
              <FormTextField
                id="catalog-contribution-identifier-fixed"
                label={t('catalog.contribution.form.identifier')}
                readOnly
                value={resolution.identifier.value}
              />
            </div>
          </div>

          <div className="grid gap-6">
            <FormTextareaField
              id="catalog-contribution-synopsis"
              label={t('catalog.contribution.form.synopsis')}
              onChange={(event) =>
                updateTextField('synopsis', event.currentTarget.value)
              }
              rows={6}
              value={formDraft.synopsis}
            />
            {!isExistingWork ? (
              <div className="space-y-5">
                <fieldset className="space-y-2">
                  <legend className="app-text-label text-ink">
                    {t('catalog.contribution.form.genres')}
                  </legend>
                  {taxonomyQuery.isLoading ? (
                    <p className="app-text-metadata m-0 text-ink-3">
                      {t('catalog.contribution.form.genreLoading')}
                    </p>
                  ) : null}
                  {!taxonomyQuery.isLoading &&
                  taxonomyOptions.length === 0 &&
                  unmatchedTaxonomyOptions.length === 0 ? (
                    <p className="app-text-metadata m-0 text-ink-3">
                      {t('catalog.contribution.form.genreEmpty')}
                    </p>
                  ) : null}
                  <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border border-rule/60 p-3 dark:border-night-fg/30">
                    {taxonomyOptions.map((option) => {
                      const selectedCategorySlugs =
                        formDraft.categorySlugs.length === 0 &&
                        !dirtyFields.has('categorySlugs')
                          ? suggestedCategorySlugs
                          : formDraft.categorySlugs;

                      return (
                        <FilterSelectableOption
                          appearance="removable-chip"
                          isSelected={selectedCategorySlugs.includes(
                            option.slug,
                          )}
                          key={option.slug}
                          label={option.displayName}
                          onToggle={() => toggleCategory(option)}
                        />
                      );
                    })}
                    {unmatchedTaxonomyOptions.map((option) => (
                      <FilterSelectableOption
                        appearance="removable-chip"
                        isSelected={formDraft.openLibraryCategoryKeys.includes(
                          option.normalizedKey,
                        )}
                        key={`open-library-${option.normalizedKey}`}
                        label={option.displayName}
                        onToggle={() => toggleOpenLibraryCategory(option)}
                      />
                    ))}
                  </div>
                </fieldset>
                <FormTextField
                  id="catalog-contribution-tags"
                  hint={t('catalog.contribution.form.tagsHint')}
                  label={t('catalog.contribution.form.tags')}
                  onChange={(event) =>
                    updateTextField('tags', event.currentTarget.value)
                  }
                  value={formDraft.tags}
                />
              </div>
            ) : null}
          </div>

          {humanVerificationRequired ? (
            <section
              aria-labelledby="catalog-contribution-verification-title"
              className="space-y-3 rounded-md border border-rule/60 bg-paper-2 p-4"
            >
              <div>
                <h3
                  className="app-text-label m-0 text-ink"
                  id="catalog-contribution-verification-title"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name="bot" size={18} strokeWidth={1.75} />
                    {t('catalog.contribution.verification.title')}
                  </span>
                </h3>
                <p className="app-text-supporting-copy m-0 mt-1 text-ink-3">
                  {t('catalog.contribution.verification.description')}
                </p>
              </div>
              <TurnstileChallenge
                ref={humanVerificationRef}
                action={CONTRIBUTION_HUMAN_VERIFICATION_ACTION}
                onError={notifyHumanVerificationError}
                onTokenChange={(token) => {
                  setHumanVerificationToken(token);
                  if (token) setSurfaceError(null);
                }}
                showErrorMessage={false}
              />
            </section>
          ) : null}
          {surfaceError ? <Alert variant="error">{surfaceError}</Alert> : null}
          <div className="flex flex-wrap justify-end gap-3">
            {backAction}
            {hasSurfaceChrome ? (
              <Button onClick={onCancel} type="button" variant="ghost">
                {t('common.close')}
              </Button>
            ) : null}
            <Button
              disabled={
                isSubmitting ||
                (humanVerificationRequired && !humanVerificationToken)
              }
              isLoading={isSubmitting}
              loadingLabel={t('catalog.contribution.form.submitting')}
              type="submit"
            >
              {t('catalog.contribution.form.submit')}
            </Button>
          </div>
        </form>
      ) : null}
      {resolution && isContributorReviewOpen ? (
        <ContributorIdentityReviewDialog
          decisions={contributorReviewDecisions}
          matches={resolution.prefill.possibleContributorMatches ?? []}
          onClose={() => {
            setContributorReviewDecisions(new Map());
            setIsContributorReviewOpen(false);
          }}
          onDecision={(matchId, decision) => {
            setContributorReviewDecisions((current) => {
              const next = new Map(current);
              next.set(matchId, decision);
              return next;
            });
          }}
          onConfirm={() => {
            if (!formDraft) return;

            const matches = resolution.prefill.possibleContributorMatches ?? [];
            setFormDraft((current) =>
              current
                ? {
                    ...current,
                    contributors: applyContributorMatchDecisions(
                      current.contributors,
                      matches,
                      contributorReviewDecisions,
                    ),
                  }
                : current,
            );
            setIsContributorReviewOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

export function AddCatalogWorkSurface(props: AddCatalogWorkSurfaceProps) {
  return <AddCatalogWorkCore {...props} />;
}

export function AddCatalogWorkFlow(props: AddCatalogWorkFlowProps) {
  return <AddCatalogWorkCore {...props} />;
}
