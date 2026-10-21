import {
  ACCOUNT_DELETION_CANCEL_PATH,
  ACCOUNT_DELETION_CONFIRM_PATH,
} from '@towelbooks/schemas';
import { createBrowserRouter, type RouteObject } from 'react-router';

import { AppAuthGate } from './app-auth-gate';
import {
  appLayoutChildren,
  catalogReviewReadChildren,
  collectionReadChildren,
  libraryPreviewChildren,
} from './app-shell-routes';
import { DocumentMetadataRouteSync } from './DocumentMetadataProvider';
import { guestAuthBranchRoute } from './guest-auth-routes';
import { LazyRoute } from './LazyRoute';
import { lazyNamedPage } from './lazy-page';
import { OptionalAuthAppRoute } from './optional-auth-app-route';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { isMaintenanceModeEnabled } from '../lib/maintenanceMode';
import { GuestLandingPage } from '../pages/GuestLandingPage';

const ProfilePage = lazyNamedPage(
  () => import('../pages/settings/ProfilePage'),
  'ProfilePage',
);
const ProfileReviewsPage = lazyNamedPage(
  () => import('../pages/settings/ProfileReviewsPage'),
  'ProfileReviewsPage',
);
const RoomDetailPage = lazyNamedPage(
  () => import('../pages/rooms/detail/RoomDetailPage'),
  'RoomDetailPage',
);

const PrivacyRevisionsPage = lazyNamedPage(
  () => import('../pages/legal/LegalRevisionsPage'),
  'PrivacyRevisionsPage',
);
const TermsRevisionsPage = lazyNamedPage(
  () => import('../pages/legal/LegalRevisionsPage'),
  'TermsRevisionsPage',
);
const PrivacyChangelogPage = lazyNamedPage(
  () => import('../pages/legal/PrivacyChangelogPage'),
  'PrivacyChangelogPage',
);
const PrivacyPolicyPage = lazyNamedPage(
  () => import('../pages/legal/PrivacyPolicyPage'),
  'PrivacyPolicyPage',
);
const TermsPage = lazyNamedPage(
  () => import('../pages/legal/TermsPage'),
  'TermsPage',
);
const CookiesPage = lazyNamedPage(
  () => import('../pages/legal/CookiesPage'),
  'CookiesPage',
);
const AcknowledgementsPage = lazyNamedPage(
  () => import('../pages/legal/AcknowledgementsPage'),
  'AcknowledgementsPage',
);
const ConfirmAccountDeletionPage = lazyNamedPage(
  () => import('../pages/auth/account-deletion/ConfirmAccountDeletionPage'),
  'ConfirmAccountDeletionPage',
);
const CancelAccountDeletionPage = lazyNamedPage(
  () => import('../pages/auth/account-deletion/CancelAccountDeletionPage'),
  'CancelAccountDeletionPage',
);
const InviteEmailRefusalPage = lazyNamedPage(
  () => import('../pages/rooms/invites/InviteEmailRefusalPage'),
  'InviteEmailRefusalPage',
);
const PricingPage = lazyNamedPage(
  () => import('../pages/pricing/PricingPage'),
  'PricingPage',
);
const NotFoundPage = lazyNamedPage(
  () => import('../pages/NotFoundPage'),
  'NotFoundPage',
);
const MaintenancePage = lazyNamedPage(
  () => import('../pages/MaintenancePage'),
  'MaintenancePage',
);
const applicationRootRoute: RouteObject = {
  children: [
    guestAuthBranchRoute,
    {
      element: <OptionalAuthAppRoute />,
      children: [
        ...catalogReviewReadChildren,
        ...collectionReadChildren,
        ...libraryPreviewChildren,
        { element: <ProfileReviewsPage />, path: ':username/reviews' },
        { element: <ProfilePage />, path: ':username' },
        { element: <RoomDetailPage />, path: 'rooms/:roomId' },
      ],
    },
    {
      children: appLayoutChildren,
      element: <AppAuthGate />,
    },
  ],
  errorElement: <RouteErrorBoundary />,
  path: '/',
};

const maintenanceRootRoute: RouteObject = {
  children: [
    {
      element: <GuestLandingPage />,
      index: true,
    },
    {
      element: (
        <LazyRoute>
          <MaintenancePage />
        </LazyRoute>
      ),
      path: '*',
    },
  ],
  path: '/',
};

function buildRouteChildren(maintenanceMode: boolean): RouteObject[] {
  const rootRoute = maintenanceMode
    ? maintenanceRootRoute
    : applicationRootRoute;
  const actionRoutes: RouteObject[] = maintenanceMode
    ? []
    : [
        {
          element: (
            <LazyRoute>
              <ConfirmAccountDeletionPage />
            </LazyRoute>
          ),
          errorElement: <RouteErrorBoundary />,
          path: ACCOUNT_DELETION_CONFIRM_PATH,
        },
        {
          element: (
            <LazyRoute>
              <CancelAccountDeletionPage />
            </LazyRoute>
          ),
          errorElement: <RouteErrorBoundary />,
          path: ACCOUNT_DELETION_CANCEL_PATH,
        },
        {
          element: (
            <LazyRoute>
              <InviteEmailRefusalPage />
            </LazyRoute>
          ),
          errorElement: <RouteErrorBoundary />,
          path: '/invite-email-refusal',
        },
      ];

  return [
    {
      element: (
        <LazyRoute>
          <PrivacyRevisionsPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/legal/privacy/revisions',
    },
    {
      element: (
        <LazyRoute>
          <PrivacyChangelogPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/legal/privacy/changelog',
    },
    {
      element: (
        <LazyRoute>
          <PrivacyPolicyPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/legal/privacy',
    },
    {
      element: (
        <LazyRoute>
          <TermsRevisionsPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/legal/terms/revisions',
    },
    {
      element: (
        <LazyRoute>
          <TermsPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/legal/terms',
    },
    {
      element: (
        <LazyRoute>
          <CookiesPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/legal/cookies',
    },
    {
      element: (
        <LazyRoute>
          <AcknowledgementsPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/acknowledgements',
    },
    ...actionRoutes,
    rootRoute,
    {
      element: (
        <LazyRoute>
          <PricingPage />
        </LazyRoute>
      ),
      errorElement: <RouteErrorBoundary />,
      path: '/pricing',
    },
    {
      element: (
        <LazyRoute>
          <NotFoundPage />
        </LazyRoute>
      ),
      path: '/404',
    },
    {
      element: (
        <LazyRoute>
          <NotFoundPage />
        </LazyRoute>
      ),
      path: '*',
    },
  ];
}

export function buildRoutes(maintenanceMode: boolean): RouteObject[] {
  return [
    {
      children: buildRouteChildren(maintenanceMode),
      element: <DocumentMetadataRouteSync />,
      errorElement: <RouteErrorBoundary />,
    },
  ];
}

export const routes: RouteObject[] = buildRoutes(
  isMaintenanceModeEnabled(import.meta.env),
);

export const router = createBrowserRouter(routes, {
  basename: window.location.pathname.startsWith('/demo') ? '/demo' : '/',
});
