import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@towelbooks/sdk';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';

import { buildLoginRedirectPath } from '../../features/auth/redirects';
import { useAuthenticatedAction } from '../../features/auth/useAuthenticatedAction';
import { buildSettingsHash } from '../../features/settings/settingsHash';

import { LoadingState, useToast } from '../../components/feedback';
import { PageShell, PageStateShell } from '../../components/layout';
import { Button, ButtonLink } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import {
  ApiProblemPageState,
  createApiProblemToast,
} from '../../features/errors';
import { useDocumentMetadata } from '../../app/DocumentMetadataProvider';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';
import {
  INDEXABLE_ROBOTS_DIRECTIVE,
  NON_INDEXABLE_ROBOTS_DIRECTIVE,
  PROFILE_DEFAULT_SOCIAL_IMAGE,
  PROFILE_DEFAULT_SOCIAL_IMAGE_ALT,
  resolveProfileSocialMetadata,
} from '../../lib/documentMetadata';
import {
  ProfileFollowDialog,
  type ProfileFollowDialogTab,
} from '../../components/profile/ProfileFollowDialog';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfilePageSurface } from '../../components/profile/ProfilePageLayout';
import {
  deriveProfileFollowActionState,
  isProfileFollowUnfollowAction,
} from '../../components/profile/profileFollowActionState';
import { ProfileSections } from '../../components/profile/ProfileSections';
import { NotFoundPage } from '../NotFoundPage';
import { ProfileMobileSettingsButton } from '../../components/profile/ProfileMobileSettingsButton';
import { ProfileUnfollowConfirmDialog } from '../../components/profile/ProfileUnfollowConfirmDialog';

export function ProfilePage() {
  const [followDialogTab, setFollowDialogTab] =
    useState<ProfileFollowDialogTab | null>(null);
  const [isUnfollowConfirmationOpen, setIsUnfollowConfirmationOpen] =
    useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: authState, user } = useAuth();
  const isAuthenticated = authState ?? user !== null;
  const runAuthenticatedAction = useAuthenticatedAction();
  const { formatNumber, t } = useI18n();
  const { pushToast } = useToast();
  const { username: routeUsername } = useParams<{ username: string }>();

  const isOwnProfileRoute = Boolean(
    routeUsername && user?.username && routeUsername === user.username,
  );

  const {
    data: profileData,
    error: profileError,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = useQuery({
    enabled: Boolean(routeUsername),
    queryKey: ['profiles', routeUsername],
    queryFn: () => sdk.users.getProfile(routeUsername!),
  });

  const profileSocialMetadata = profileData
    ? resolveProfileSocialMetadata(profileData.profile)
    : null;
  const profileTitle = profileSocialMetadata?.shareTitle ?? t('app.name');

  usePageTitle(profileTitle, { appendAppName: false });

  const isIndexableProfile =
    !isProfileFetching &&
    Boolean(profileSocialMetadata) &&
    profileData?.access.visibility === 'public';

  useDocumentMetadata({
    canonicalPath:
      profileSocialMetadata && profileData?.profile.username
        ? `/${encodeURIComponent(profileData.profile.username)}`
        : undefined,
    description: profileSocialMetadata?.description,
    ogType: profileSocialMetadata?.ogType,
    robots: isIndexableProfile
      ? INDEXABLE_ROBOTS_DIRECTIVE
      : NON_INDEXABLE_ROBOTS_DIRECTIVE,
    socialPath:
      profileSocialMetadata && profileData?.profile.username
        ? `/${encodeURIComponent(profileData.profile.username)}`
        : null,
    shareImage: profileSocialMetadata
      ? profileSocialMetadata.shareImage
      : PROFILE_DEFAULT_SOCIAL_IMAGE,
    shareImageAlt:
      profileSocialMetadata?.shareImageAlt ?? PROFILE_DEFAULT_SOCIAL_IMAGE_ALT,
    shareImageHeight: profileSocialMetadata
      ? (profileSocialMetadata.shareImageHeight ?? null)
      : 630,
    shareImageType: profileSocialMetadata
      ? (profileSocialMetadata.shareImageType ?? null)
      : 'image/png',
    shareImageWidth: profileSocialMetadata
      ? (profileSocialMetadata.shareImageWidth ?? null)
      : 1200,
    shareTitle: profileSocialMetadata?.shareTitle,
    twitterCard: profileSocialMetadata?.twitterCard,
  });

  const canViewContent = profileData?.access?.canViewContent ?? false;
  const canEdit =
    isAuthenticated &&
    (profileData?.viewer?.isSelf === true || isOwnProfileRoute);
  const libraryTo = profileData?.defaultLibraryId
    ? `/libraries/${profileData.defaultLibraryId}`
    : canEdit
      ? '/my-library'
      : undefined;
  const followActionState = profileData
    ? deriveProfileFollowActionState({
        access: profileData.access,
        isOwn: canEdit,
      })
    : 'follow';

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!routeUsername) {
        return;
      }

      if (isProfileFollowUnfollowAction(followActionState)) {
        await sdk.users.unfollowProfile(routeUsername);
        return;
      }

      await sdk.users.followProfile(routeUsername);
    },
    onSuccess: async () => {
      setIsUnfollowConfirmationOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ['profiles', routeUsername],
      });
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: isProfileFollowUnfollowAction(followActionState)
            ? 'profile.action.unfollow.error'
            : 'profile.action.follow.error',
          t,
        }),
      );
    },
  });

  if (!routeUsername) {
    if (user?.username) {
      return <Navigate to={`/${user.username}`} replace />;
    }

    return (
      <Navigate
        to={{ pathname: '/', hash: buildSettingsHash('account') }}
        replace
      />
    );
  }

  if (profileError) {
    if (
      profileError instanceof ApiRequestError &&
      profileError.status === 404
    ) {
      return <NotFoundPage />;
    }

    return (
      <PageStateShell containerSize="narrow">
        <ApiProblemPageState
          error={profileError}
          title={{ key: 'profile.page.error.loadTitle' }}
          body={{ key: 'profile.page.error.loadBody' }}
          fallbackAction={
            <Button variant="secondary" onClick={() => void refetchProfile()}>
              {t('errors.action.retry')}
            </Button>
          }
          action={
            <ButtonLink to="/" variant="secondary">
              {t('errors.page.backToLibrary')}
            </ButtonLink>
          }
        />
      </PageStateShell>
    );
  }

  if (!profileData || isProfileFetching) {
    return (
      <PageStateShell containerSize="narrow">
        <LoadingState />
      </PageStateShell>
    );
  }

  const { profile, stats: profileStats } = profileData;
  const bannerImage = 'bannerImage' in profile ? profile.bannerImage : null;
  const bannerPresetId =
    'bannerPresetId' in profile ? profile.bannerPresetId : null;
  const links = 'links' in profile ? profile.links : [];
  const profileId = 'id' in profile ? profile.id : null;
  const displayName = profile.displayName ?? profile.username;
  const stats =
    canViewContent && profileStats
      ? [
          {
            key: 'followers',
            actionLabel: t('profile.followDialog.openFollowers'),
            label: t(
              profileStats.followersCount === 1
                ? 'profile.stats.followers.one'
                : 'profile.stats.followers',
            ),
            onClick: () =>
              runAuthenticatedAction(() => setFollowDialogTab('followers')),
            value: formatNumber(profileStats.followersCount),
          },
          {
            key: 'following',
            actionLabel: t('profile.followDialog.openFollowing'),
            label: t('profile.stats.following'),
            onClick: () =>
              runAuthenticatedAction(() => setFollowDialogTab('following')),
            value: formatNumber(profileStats.followingCount),
          },
        ]
      : [];

  return (
    <PageShell
      background="paper"
      minHeight
      className={['flex flex-col', !isAuthenticated ? 'overflow-x-clip' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {isAuthenticated ? <ProfileMobileSettingsButton /> : null}
      <ProfilePageSurface>
        <ProfileHeader
          avatar={profile.avatar}
          bannerPresetId={bannerPresetId}
          bannerImageUrl={bannerImage?.imageUrl ?? null}
          bannerImageUrls={bannerImage?.imageUrls ?? null}
          displayName={displayName}
          username={profile.username}
          bio={profile.bio ?? undefined}
          links={links}
          stats={stats}
          actions={{
            actionState: followActionState,
            isPending: isAuthenticated && followMutation.isPending,
            libraryTo,
            onEdit: () =>
              navigate('/settings/profile', {
                state: { returnTo: location.pathname },
              }),
            onFollowToggle: () =>
              runAuthenticatedAction(() => {
                if (followActionState === 'following') {
                  setIsUnfollowConfirmationOpen(true);
                  return;
                }

                followMutation.mutate();
              }),
          }}
          visitorMenu={
            isAuthenticated && !canEdit && profileId
              ? { reportTargetId: profileId }
              : undefined
          }
        />

        {canViewContent && profileStats ? (
          <ProfileSections
            isOwnProfile={canEdit}
            key={routeUsername}
            stats={profileStats}
            viewerUserId={user?.id ?? null}
            username={routeUsername}
          />
        ) : (
          <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center lg:px-0">
            <div className="-translate-y-20">
              <h2 className="app-text-section-title text-ink">
                {t('profile.locked.title')}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">
                {t('profile.locked.body')}
              </p>
              {!isAuthenticated ? (
                <ButtonLink
                  to={buildLoginRedirectPath(
                    `${location.pathname}${location.search}${location.hash}`,
                  )}
                  variant="secondary"
                  className="mt-6"
                >
                  {t('profile.locked.loginAction')}
                </ButtonLink>
              ) : null}
            </div>
          </section>
        )}
      </ProfilePageSurface>

      {followDialogTab && canViewContent ? (
        <ProfileFollowDialog
          initialTab={followDialogTab}
          isOwnProfile={canEdit}
          onClose={() => setFollowDialogTab(null)}
          username={routeUsername}
        />
      ) : null}
      {isUnfollowConfirmationOpen ? (
        <ProfileUnfollowConfirmDialog
          displayName={displayName}
          isPending={followMutation.isPending}
          onClose={() => setIsUnfollowConfirmationOpen(false)}
          onConfirm={() => followMutation.mutate()}
        />
      ) : null}
    </PageShell>
  );
}
