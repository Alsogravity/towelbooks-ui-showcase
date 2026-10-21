import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BIO_MAX_LINES,
  countTextLines,
  buildAvatar,
  deriveAvatarForeground,
  isReservedUsername,
  READING_CATEGORY_PREFERENCE_COUNT,
  type AvatarUploadContentType,
  type BannerPresetId,
  type BannerUploadContentType,
  type ExternalLinkInput,
  type MeResponse,
  type ProfileSummary,
  type ProfileVisibility,
  type UpdateMeRequest,
} from '@towelbooks/schemas';
import { ApiRequestError } from '@towelbooks/sdk';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router';

import { getProfilePath } from '../../app/profileRoutes';
import { useAuth } from '../../features/auth/AuthContext';
import { meQueryKey } from '../../features/auth/meQuery';
import { resolveBannerPresetId } from '../../features/banner-presets';
import {
  createApiProblemToast,
  getApiProblemValidationErrors,
} from '../../features/errors';
import {
  areExternalLinkInputsEqual,
  ExternalLinksEditor,
  toExternalLinkInputs,
} from '../../features/external-links';
import { privacyPreferencesQueryKey } from '../../features/privacy/privacyPreferencesQuery';
import { homeCatalogQueryRoot } from '../../features/catalog/queryKeys';
import { ReadingCategoryPreferencesSection } from '../../features/preferences/ReadingCategoryPreferencesSection';
import {
  activeTaxonomyCategoriesQueryKey,
  readingCategoryPreferencesQueryKey,
} from '../../features/preferences/readingCategoryPreferencesQuery';
import {
  DiscardChangesDialog,
  useUnsavedChangesGuard,
} from '../../features/unsaved-changes';
import { createBasicEmojiLabelGetter } from '../../i18n/emojiLabels';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import { useToast } from '../feedback';
import { buildDirtyProfileUpdate } from './edit/buildDirtyProfileUpdate';
import { ProfileEditFormBody } from './edit/ProfileEditFormBody';
import {
  resolveProfileEditSeed,
  resolveProfileMeSnapshot,
} from './edit/resolveProfileEditSeed';
import {
  type AvatarSelection,
  type BannerSelection,
  type ProfileEditField,
  type ProfileSaveFailure,
  isProfileEditField,
  isProfileSaveFailure,
} from './edit/profileEditFormShared';
import type { AppearanceSection } from '../appearance/AppearanceEditSheet';

const TAXONOMY_STALE_TIME = 5 * 60 * 1000;

function haveSameIds(first: readonly string[], second: readonly string[]) {
  if (first.length !== second.length) {
    return false;
  }

  const secondIds = new Set(second);
  return first.every((id) => secondIds.has(id));
}

type ProfileSaveVariables = {
  categoryIds: string[] | null;
  profile: UpdateMeRequest;
};

type CategoryDraft = {
  userId: string;
  ids: string[];
};

export interface ProfileEditFormProps {
  /**
   * The authenticated user's `/me` snapshot. The form seeds its drafts from this
   * resource (never from a public `/:username` profile) so editing is always
   * scoped to the signed-in account.
   */
  me: MeResponse;
  /**
   * Optional public-profile snapshot used only to seed avatar/banner previews
   * when navigating in from the public profile. Falls back to {@link me}.
   */
  initialProfile?: ProfileSummary;
  /** Navigated to on cancel/discard. Must be a validated internal path. */
  onCancel: () => void;
}

/**
 * Page-safe profile editing form. Owns the full edit lifecycle (drafts,
 * validation, avatar staging, save mutation, auth-state sync, cache
 * invalidation) without any modal host — it lives on the
 * `/settings/profile` route. Small appearance choices (avatar background/photo,
 * banner preset) still render in a nested sheet scoped to this page.
 */
export function ProfileEditForm({
  initialProfile,
  me,
  onCancel,
}: ProfileEditFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { locale, t } = useI18n();
  const getEmojiLabel = useMemo(() => createBasicEmojiLabelGetter(t), [t]);
  const { pushToast } = useToast();

  const pageBodyRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  const [profileEditSeed] = useState(() =>
    resolveProfileEditSeed(initialProfile, me),
  );
  const [editBaseline, setEditBaseline] = useState(
    () => profileEditSeed.baseline,
  );

  const [displayNameDraft, setDisplayNameDraft] = useState(
    () => profileEditSeed.drafts.displayName,
  );
  const [usernameDraft, setUsernameDraft] = useState(
    () => profileEditSeed.drafts.username,
  );
  const [bioDraft, setBioDraft] = useState(() => profileEditSeed.drafts.bio);
  const [avatarSelection, setAvatarSelection] =
    useState<AvatarSelection | null>(null);
  const [bannerSelection, setBannerSelection] =
    useState<BannerSelection | null>(null);
  const [avatarBackgroundDraft, setAvatarBackgroundDraft] = useState(
    () => profileEditSeed.drafts.avatarBackground,
  );
  const [bannerPresetDraft, setBannerPresetDraft] = useState<BannerPresetId>(
    () => profileEditSeed.drafts.bannerPresetId,
  );
  const [linksDraft, setLinksDraft] = useState<ExternalLinkInput[]>(() =>
    toExternalLinkInputs(me.links),
  );
  const [linksError, setLinksError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProfileEditField, string>>
  >({});
  const [appearanceSheet, setAppearanceSheet] =
    useState<AppearanceSection | null>(null);

  // null = still following server baseline; set only when the user toggles.
  const [profileVisibilityOverride, setProfileVisibilityOverride] =
    useState<ProfileVisibility | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(
    null,
  );
  const [categorySaveFailed, setCategorySaveFailed] = useState(false);

  const categoryPreferencesQueryKey =
    readingCategoryPreferencesQueryKey(locale);
  const categoryPreferencesQuery = useQuery({
    queryKey: categoryPreferencesQueryKey,
    queryFn: () => sdk.users.me.getReadingCategoryPreferences(),
    retry: false,
  });
  const taxonomyQuery = useQuery({
    queryKey: activeTaxonomyCategoriesQueryKey(locale),
    queryFn: () => sdk.catalog.listTaxonomyCategories(),
    staleTime: TAXONOMY_STALE_TIME,
    retry: false,
  });

  const loadedCategoryIds = useMemo(
    () =>
      categoryPreferencesQuery.data?.categories.map(
        (category) => category.id,
      ) ?? [],
    [categoryPreferencesQuery.data],
  );
  const selectedCategoryIds =
    categoryDraft?.userId === me.id ? categoryDraft.ids : loadedCategoryIds;
  const categoryPreferencesReady = categoryPreferencesQuery.data !== undefined;
  const hasCategoryChanges =
    categoryPreferencesReady &&
    !haveSameIds(selectedCategoryIds, loadedCategoryIds);
  const hasIncompleteChangedCategoryDraft =
    hasCategoryChanges &&
    selectedCategoryIds.length !== READING_CATEGORY_PREFERENCE_COUNT;

  const handleCategoryToggle = useCallback(
    (categoryId: string) => {
      setCategorySaveFailed(false);
      setCategoryDraft((currentDraft) => {
        const currentIds =
          currentDraft?.userId === me.id ? currentDraft.ids : loadedCategoryIds;

        if (currentIds.includes(categoryId)) {
          return {
            ids: currentIds.filter((id) => id !== categoryId),
            userId: me.id,
          };
        }

        if (currentIds.length >= READING_CATEGORY_PREFERENCE_COUNT) {
          return currentDraft;
        }

        return {
          ids: [...currentIds, categoryId],
          userId: me.id,
        };
      });
    },
    [loadedCategoryIds, me.id],
  );

  const retryCategoryQueries = useCallback(() => {
    if (categoryPreferencesQuery.isError) {
      void categoryPreferencesQuery.refetch();
    }
    if (taxonomyQuery.isError) {
      void taxonomyQuery.refetch();
    }
  }, [categoryPreferencesQuery, taxonomyQuery]);

  const privacyPreferencesQuery = useQuery({
    queryKey: privacyPreferencesQueryKey(me.id),
    queryFn: () => sdk.privacy.getPreferences(),
    retry: false,
  });

  const profileVisibilityBaseline =
    privacyPreferencesQuery.data?.profileVisibility ?? null;
  const profileVisibilityDraft =
    profileVisibilityOverride ?? profileVisibilityBaseline;
  const hasVisibilityChanged =
    profileVisibilityDraft !== null &&
    profileVisibilityBaseline !== null &&
    profileVisibilityDraft !== profileVisibilityBaseline;

  const handleProfileVisibilityChange = useCallback((checked: boolean) => {
    setProfileVisibilityOverride(checked ? 'private' : 'public');
  }, []);

  const linksBaseline = useMemo(
    () => toExternalLinkInputs(me.links),
    [me.links],
  );
  const hasLinksChanged = !areExternalLinkInputsEqual(
    linksDraft,
    linksBaseline,
  );

  const baseHasAvatarImage = Boolean(me.avatar.imageUrl);
  const baseHasBannerImage = Boolean(me.bannerImage?.imageUrl);

  const [bannerActiveSource, setBannerActiveSource] = useState<
    'custom' | 'preset'
  >(() => (baseHasBannerImage ? 'custom' : 'preset'));

  const handleBannerPresetChange = useCallback((nextValue: BannerPresetId) => {
    setBannerPresetDraft(nextValue);
    // Prefer the preset for display without deleting a custom image until Remove.
    setBannerActiveSource('preset');
  }, []);

  const handleAvatarSelect = useCallback((file: File, previewUrl: string) => {
    setAvatarSelection({ file, kind: 'pending-upload', previewUrl });
  }, []);

  const handleAvatarRemove = useCallback(() => {
    if (avatarSelection?.kind === 'pending-upload') {
      setAvatarSelection(null);
      return;
    }

    // If the profile already has a photo, stage its removal; otherwise there is
    // nothing to clear server-side, so just drop the pending selection.
    setAvatarSelection(baseHasAvatarImage ? { kind: 'pending-remove' } : null);
  }, [avatarSelection, baseHasAvatarImage]);

  const handleBannerSelect = useCallback((file: File, previewUrl: string) => {
    setBannerSelection({ file, kind: 'pending-upload', previewUrl });
    setBannerActiveSource('custom');
  }, []);

  const handleBannerSelectCustom = useCallback(() => {
    // Re-activate the custom image; cancel a staged remove if present.
    setBannerSelection((current) =>
      current?.kind === 'pending-remove' ? null : current,
    );
    setBannerActiveSource('custom');
  }, []);

  const handleBannerRemove = useCallback(() => {
    if (bannerSelection?.kind === 'pending-upload') {
      // Drop a not-yet-saved upload. If a saved image still exists, stage its
      // removal so Remove + Save is required to clear it.
      setBannerSelection(
        baseHasBannerImage ? { kind: 'pending-remove' } : null,
      );
      setBannerActiveSource('preset');
      return;
    }

    setBannerSelection(baseHasBannerImage ? { kind: 'pending-remove' } : null);
    setBannerActiveSource('preset');
  }, [bannerSelection, baseHasBannerImage]);

  // Release the object URL of a previewed file once it is replaced or the form
  // unmounts so we don't leak blobs.
  useEffect(() => {
    if (avatarSelection?.kind !== 'pending-upload') {
      return;
    }

    const { previewUrl } = avatarSelection;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [avatarSelection]);

  useEffect(() => {
    if (bannerSelection?.kind !== 'pending-upload') {
      return;
    }

    const { previewUrl } = bannerSelection;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [bannerSelection]);

  const previewAvatarImageUrl =
    avatarSelection?.kind === 'pending-upload'
      ? avatarSelection.previewUrl
      : avatarSelection?.kind === 'pending-remove'
        ? null
        : me.avatar.imageUrl;

  // Picker keeps a saved/pending custom image available so the user can
  // re-activate it after Remove (before Save) or after choosing a preset.
  const availableBannerImageUrl =
    bannerSelection?.kind === 'pending-upload'
      ? bannerSelection.previewUrl
      : (me.bannerImage?.imageUrl ?? null);

  const availableBannerImageUrls =
    bannerSelection?.kind === 'pending-upload'
      ? null
      : (me.bannerImage?.imageUrls ?? null);

  const isCustomBannerActive =
    bannerActiveSource === 'custom' &&
    bannerSelection?.kind !== 'pending-remove' &&
    Boolean(availableBannerImageUrl);

  // Main form preview: custom image only when that source is active.
  const previewBannerImageUrl = isCustomBannerActive
    ? availableBannerImageUrl
    : null;

  const previewBannerImageUrls = isCustomBannerActive
    ? availableBannerImageUrls
    : null;

  const previewAvatar = buildAvatar({
    avatarBackground: avatarBackgroundDraft,
    avatarForeground: deriveAvatarForeground(avatarBackgroundDraft),
    avatarImageUrl: previewAvatarImageUrl,
    displayName: displayNameDraft || me.username,
    username: usernameDraft || me.username,
  });

  const previewDisplayName = useMemo(() => {
    const trimmed = displayNameDraft.trim();

    if (trimmed.length > 0) {
      return trimmed;
    }

    return me.username;
  }, [displayNameDraft, me.username]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      avatarSelection !== null ||
      bannerSelection !== null ||
      hasLinksChanged ||
      hasCategoryChanges ||
      hasVisibilityChanged ||
      displayNameDraft.trim() !== editBaseline.displayName ||
      usernameDraft.trim().toLowerCase() !== editBaseline.username ||
      bioDraft.trim() !== editBaseline.bio ||
      avatarBackgroundDraft !== editBaseline.avatarBackground ||
      bannerPresetDraft !== editBaseline.bannerPresetId
    );
  }, [
    avatarBackgroundDraft,
    avatarSelection,
    bannerPresetDraft,
    bannerSelection,
    bioDraft,
    displayNameDraft,
    editBaseline,
    hasLinksChanged,
    hasCategoryChanges,
    hasVisibilityChanged,
    usernameDraft,
  ]);

  const {
    allowProgrammaticNavigation,
    discardChangesDialogProps,
    requestLeave,
  } = useUnsavedChangesGuard({
    isDirty: hasUnsavedChanges,
    onLeave: onCancel,
    // Profile-specific wording when present; falls back to common defaults.
    copy: {
      title: 'settings.profile.edit.discardChanges.title',
      body: 'settings.profile.edit.discardChanges.body',
      confirm: 'settings.profile.edit.discardChanges.confirm',
      cancel: 'settings.profile.edit.discardChanges.cancel',
    },
  });

  const syncSignedInUser = useCallback(
    (updatedMe: MeResponse) => {
      queryClient.setQueryData(meQueryKey(updatedMe.id), updatedMe);
      updateUser({
        avatar: updatedMe.avatar,
        authMethods: updatedMe.authMethods,
        bannerPresetId: updatedMe.bannerPresetId,
        bio: updatedMe.bio,
        defaultLibraryId: updatedMe.defaultLibraryId,
        displayName: updatedMe.displayName,
        email: updatedMe.email,
        id: updatedMe.id,
        locale: updatedMe.locale,
        localeMode: updatedMe.localeMode,
        lastResolvedLocale: updatedMe.lastResolvedLocale,
        username: updatedMe.username,
      });
    },
    [queryClient, updateUser],
  );

  const completeSave = useCallback(
    async (
      updatedMe: MeResponse,
      options: { showSuccessToast?: boolean } = {},
    ) => {
      const { showSuccessToast = true } = options;

      syncSignedInUser(updatedMe);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profiles'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms'] }),
      ]);

      setEditBaseline({
        avatarBackground: updatedMe.avatar.background,
        bannerPresetId: resolveBannerPresetId(updatedMe.bannerPresetId),
        bio: (updatedMe.bio ?? '').trim(),
        displayName: (updatedMe.displayName ?? '').trim(),
        username: updatedMe.username,
      });
      setAvatarSelection(null);
      setBannerSelection(null);
      setBannerActiveSource(
        updatedMe.bannerImage?.imageUrl ? 'custom' : 'preset',
      );

      if (showSuccessToast) {
        pushToast({
          title: t('settings.profile.edit.saved'),
          variant: 'success',
        });
      }

      // Username may have changed during the edit, so always resolve the public
      // path from the freshly saved snapshot and leave the settings form.
      allowProgrammaticNavigation();
      navigate(getProfilePath(updatedMe), { replace: true });
    },
    [
      allowProgrammaticNavigation,
      navigate,
      queryClient,
      syncSignedInUser,
      setEditBaseline,
      setAvatarSelection,
      setBannerSelection,
      pushToast,
      t,
    ],
  );

  const handleMediaMutationError = useCallback(
    (error: unknown, kind: 'avatar' | 'banner') => {
      const notConfiguredCode =
        kind === 'avatar'
          ? 'AVATAR_UPLOADS_NOT_CONFIGURED'
          : 'BANNER_UPLOADS_NOT_CONFIGURED';
      const notConfiguredKey =
        kind === 'avatar'
          ? 'settings.profile.edit.avatarPhoto.error.notConfigured'
          : 'settings.profile.edit.bannerPhoto.error.notConfigured';
      const uploadFallbackKey =
        kind === 'avatar'
          ? 'settings.profile.edit.avatarPhoto.error.upload'
          : 'settings.profile.edit.bannerPhoto.error.upload';

      if (
        error instanceof ApiRequestError &&
        error.problem.code === notConfiguredCode
      ) {
        pushToast({
          title: t(notConfiguredKey),
          variant: 'error',
        });
        return;
      }

      pushToast(
        createApiProblemToast(error, {
          fallbackKey: uploadFallbackKey,
          t,
        }),
      );
    },
    [pushToast, t],
  );

  const updateProfileMutation = useMutation({
    mutationFn: async ({ categoryIds, profile }: ProfileSaveVariables) => {
      if (categoryIds !== null) {
        let savedPreferences;

        try {
          savedPreferences =
            await sdk.users.me.replaceReadingCategoryPreferences({
              categoryIds,
            });
        } catch (cause) {
          throw {
            cause,
            failedStep: 'categories',
          } satisfies ProfileSaveFailure;
        }

        setCategoryDraft({
          ids: savedPreferences.categories.map((category) => category.id),
          userId: me.id,
        });
        setCategorySaveFailed(false);
        queryClient.setQueryData(categoryPreferencesQueryKey, savedPreferences);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: categoryPreferencesQueryKey,
          }),
          queryClient.invalidateQueries({ queryKey: homeCatalogQueryRoot }),
        ]);
      }

      const profileChanged = Object.keys(profile).length > 0;

      const savedProfile = profileChanged
        ? await sdk.users.me.update(profile)
        : resolveProfileMeSnapshot(initialProfile, me);

      let nextProfile = savedProfile;

      try {
        if (avatarSelection?.kind === 'pending-upload') {
          const { file } = avatarSelection;

          const avatarResponse = await sdk.users.me.avatar.upload(file, {
            contentType: file.type as AvatarUploadContentType,
            sizeBytes: file.size,
          });

          nextProfile = {
            ...nextProfile,
            avatar: avatarResponse.avatar,
          };
        } else if (avatarSelection?.kind === 'pending-remove') {
          const avatarResponse = await sdk.users.me.avatar.clear();

          nextProfile = {
            ...nextProfile,
            avatar: avatarResponse.avatar,
          };
        }

        // Upload only when the custom image is still the active source.
        // Selecting a preset keeps a pending file available for re-activation
        // without publishing it until the user activates custom again.
        if (
          bannerSelection?.kind === 'pending-upload' &&
          bannerActiveSource === 'custom'
        ) {
          const { file } = bannerSelection;

          const bannerResponse = await sdk.users.me.banner.upload(file, {
            contentType: file.type as BannerUploadContentType,
            sizeBytes: file.size,
          });

          nextProfile = {
            ...nextProfile,
            bannerImage: bannerResponse.bannerImage,
          };
        } else if (bannerSelection?.kind === 'pending-remove') {
          // Image is cleared only via Remove (+ Save), never by picking a preset.
          const bannerResponse = await sdk.users.me.banner.clear();

          nextProfile = {
            ...nextProfile,
            bannerImage: bannerResponse.bannerImage,
          };
        }
      } catch (cause) {
        throw {
          cause,
          savedProfile: profileChanged ? savedProfile : undefined,
        } satisfies ProfileSaveFailure;
      }

      if (hasLinksChanged) {
        try {
          const linksResponse = await sdk.users.me.replaceLinks({
            links: linksDraft,
          });
          nextProfile = {
            ...nextProfile,
            links: linksResponse.links,
          };
        } catch (cause) {
          throw {
            cause,
            savedProfile:
              profileChanged ||
              avatarSelection !== null ||
              bannerSelection !== null
                ? nextProfile
                : undefined,
          } satisfies ProfileSaveFailure;
        }
      }

      if (hasVisibilityChanged && profileVisibilityDraft !== null) {
        try {
          const updatedPreferences = await sdk.privacy.updatePreferences({
            profileVisibility: profileVisibilityDraft,
          });
          queryClient.setQueryData(
            privacyPreferencesQueryKey(me.id),
            updatedPreferences,
          );
        } catch (cause) {
          throw {
            cause,
            savedProfile:
              profileChanged ||
              avatarSelection !== null ||
              bannerSelection !== null ||
              hasLinksChanged
                ? nextProfile
                : undefined,
          } satisfies ProfileSaveFailure;
        }
      }

      return nextProfile;
    },
    onSuccess: async (updatedMe) => {
      setLinksError(null);
      await completeSave(updatedMe);
    },
    onError: async (error: unknown) => {
      if (isProfileSaveFailure(error) && error.failedStep === 'categories') {
        setCategorySaveFailed(true);
        pushToast(
          createApiProblemToast(error.cause, {
            fallbackKey: 'settings.preferences.readingCategories.error.save',
            messageKeys: {
              INVALID_READING_CATEGORY_PREFERENCES:
                'settings.preferences.readingCategories.error.save',
            },
            t,
          }),
        );
        return;
      }

      if (isProfileSaveFailure(error) && error.savedProfile) {
        const { savedProfile } = error;

        setDisplayNameDraft(savedProfile.displayName ?? '');
        setUsernameDraft(savedProfile.username);
        setBioDraft(savedProfile.bio ?? '');
        setAvatarBackgroundDraft(savedProfile.avatar.background);
        setBannerPresetDraft(
          resolveBannerPresetId(savedProfile.bannerPresetId),
        );
        setEditBaseline({
          avatarBackground: savedProfile.avatar.background,
          bannerPresetId: resolveBannerPresetId(savedProfile.bannerPresetId),
          bio: (savedProfile.bio ?? '').trim(),
          displayName: (savedProfile.displayName ?? '').trim(),
          username: savedProfile.username,
        });
        // Profile fields persisted; surface only the follow-up failure (not a
        // success toast) so the user sees the actionable error.
        await completeSave(savedProfile, { showSuccessToast: false });
        handleMediaMutationError(
          error.cause,
          bannerSelection !== null && avatarSelection === null
            ? 'banner'
            : 'avatar',
        );
        return;
      }

      const rootError = isProfileSaveFailure(error) ? error.cause : error;

      if (isProfileSaveFailure(error)) {
        if (avatarSelection !== null || bannerSelection !== null) {
          handleMediaMutationError(
            rootError,
            bannerSelection !== null && avatarSelection === null
              ? 'banner'
              : 'avatar',
          );
        } else {
          setLinksError(
            t('errors.unexpected.body', {
              fallback: 'Something went wrong. Try again.',
            }),
          );
        }
        return;
      }

      const nextFieldErrors: Partial<Record<ProfileEditField, string>> = {};

      for (const validationError of getApiProblemValidationErrors(rootError)) {
        if (
          validationError.field &&
          isProfileEditField(validationError.field) &&
          validationError.message
        ) {
          nextFieldErrors[validationError.field] = validationError.message;
        }
      }

      if (nextFieldErrors.username === 'username is reserved') {
        nextFieldErrors.username = t('settings.profile.edit.usernameReserved');
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        return;
      }

      if (
        rootError instanceof ApiRequestError &&
        rootError.problem.code === 'CONFLICT' &&
        typeof rootError.problem.detail === 'string'
      ) {
        setFieldErrors({ username: rootError.problem.detail });
        return;
      }

      pushToast(
        createApiProblemToast(rootError, {
          fallbackKey: 'settings.profile.error.save',
          t,
        }),
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasUnsavedChanges || updateProfileMutation.isPending) {
      return;
    }

    if (hasIncompleteChangedCategoryDraft) {
      return;
    }

    const trimmedDisplayName = displayNameDraft.trim();
    const trimmedUsername = usernameDraft.trim().toLowerCase();
    const trimmedBio = bioDraft.trim();

    const nextFieldErrors: Partial<Record<ProfileEditField, string>> = {};

    if (trimmedDisplayName.length > 0 && trimmedDisplayName.length < 2) {
      nextFieldErrors.displayName = t(
        'settings.profile.edit.validationMinLength',
      );
    }

    if (!trimmedUsername) {
      nextFieldErrors.username = t('settings.profile.edit.usernameRequired');
    } else if (isReservedUsername(trimmedUsername)) {
      nextFieldErrors.username = t('settings.profile.edit.usernameReserved');
    }

    if (trimmedBio.length > 0 && countTextLines(trimmedBio) > BIO_MAX_LINES) {
      nextFieldErrors.bio = t('settings.profile.edit.validation.bioMaxLines', {
        values: { max: BIO_MAX_LINES },
      });
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setLinksError(null);
    updateProfileMutation.mutate({
      categoryIds: hasCategoryChanges ? selectedCategoryIds : null,
      profile: buildDirtyProfileUpdate(
        {
          avatarBackground: avatarBackgroundDraft,
          bannerPresetId: bannerPresetDraft,
          bio: bioDraft,
          displayName: displayNameDraft,
          username: usernameDraft,
        },
        editBaseline,
        me.username,
      ),
    });
  };

  const handleDisplayNameChange = useCallback((value: string) => {
    setDisplayNameDraft(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      displayName: undefined,
    }));
  }, []);

  const handleUsernameChange = useCallback((value: string) => {
    setUsernameDraft(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      username: undefined,
    }));
  }, []);

  const handleBioChange = useCallback((value: string) => {
    setBioDraft(value);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      bio: undefined,
    }));
  }, []);

  return (
    <section
      aria-label={t('settings.profile.edit.title')}
      className="relative flex min-h-0 flex-1 flex-col"
    >
      <ProfileEditFormBody
        appearanceSheet={appearanceSheet}
        bannerPresetDraft={bannerPresetDraft}
        bannerImageUrl={previewBannerImageUrl}
        bannerImageUrls={previewBannerImageUrls}
        bannerAvailableImageUrl={availableBannerImageUrl}
        bannerAvailableImageUrls={availableBannerImageUrls}
        bannerActiveSource={bannerActiveSource}
        bioDraft={bioDraft}
        bioRef={bioRef}
        canSave={hasUnsavedChanges && !hasIncompleteChangedCategoryDraft}
        close={requestLeave}
        dialogBodyRef={pageBodyRef}
        displayNameDraft={displayNameDraft}
        displayNamePlaceholder={me.username}
        fieldErrors={fieldErrors}
        getEmojiLabel={getEmojiLabel}
        isSaving={updateProfileMutation.isPending}
        linksSection={
          <ExternalLinksEditor
            initialLinks={me.links}
            serverError={linksError}
            onChange={setLinksDraft}
          />
        }
        readingCategoriesSection={
          <ReadingCategoryPreferencesSection
            categories={taxonomyQuery.data?.categories ?? []}
            hasLoadError={
              categoryPreferencesQuery.isError || taxonomyQuery.isError
            }
            isLoading={
              categoryPreferencesQuery.isLoading || taxonomyQuery.isLoading
            }
            isSaving={updateProfileMutation.isPending}
            saveFailed={categorySaveFailed}
            selectedCategoryIds={selectedCategoryIds}
            onRetry={retryCategoryQueries}
            onToggleCategory={handleCategoryToggle}
          />
        }
        visibilityChecked={profileVisibilityDraft === 'private'}
        visibilityDisabled={
          privacyPreferencesQuery.isError ||
          profileVisibilityDraft === null ||
          updateProfileMutation.isPending
        }
        onVisibilityChange={handleProfileVisibilityChange}
        previewAvatar={previewAvatar}
        previewDisplayName={previewDisplayName}
        usernameDraft={usernameDraft}
        onAvatarRemove={handleAvatarRemove}
        onAvatarSelect={handleAvatarSelect}
        onBannerPresetChange={handleBannerPresetChange}
        onBannerRemove={handleBannerRemove}
        onBannerSelect={handleBannerSelect}
        onBannerSelectCustom={handleBannerSelectCustom}
        onBioChange={handleBioChange}
        onCloseAppearanceSheet={() => setAppearanceSheet(null)}
        onDisplayNameChange={handleDisplayNameChange}
        onOpenAppearanceSheet={setAppearanceSheet}
        onSubmit={handleSubmit}
        onUsernameChange={handleUsernameChange}
      />
      <DiscardChangesDialog {...discardChangesDialogProps} />
    </section>
  );
}
