import { Suspense, lazy, type ComponentType } from 'react';

import { LoadingState } from '../../components/feedback';

import type { SettingsRouteKey } from './settingsHash';

const SettingsIndexPage = lazy(() =>
  import('../../pages/settings/SettingsIndexPage').then((mod) => ({
    default: mod.SettingsIndexPage,
  })),
);
const AccountSettingsPage = lazy(() =>
  import('../../pages/settings/AccountSettingsPage').then((mod) => ({
    default: mod.AccountSettingsPage,
  })),
);
const PreferencesPage = lazy(() =>
  import('../../pages/settings/PreferencesPage').then((mod) => ({
    default: mod.PreferencesPage,
  })),
);
const NotificationsSettingsPage = lazy(() =>
  import('../../pages/settings/NotificationsSettingsPage').then((mod) => ({
    default: mod.NotificationsSettingsPage,
  })),
);
const PrivacySettingsPage = lazy(() =>
  import('../../pages/settings/PrivacySettingsPage').then((mod) => ({
    default: mod.PrivacySettingsPage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import('../../pages/settings/ChangePasswordPage').then((mod) => ({
    default: mod.ChangePasswordPage,
  })),
);
const SetPasswordPage = lazy(() =>
  import('../../pages/settings/SetPasswordPage').then((mod) => ({
    default: mod.SetPasswordPage,
  })),
);
const DeleteAccountPage = lazy(() =>
  import('../../pages/settings/DeleteAccountPage').then((mod) => ({
    default: mod.DeleteAccountPage,
  })),
);

type SettingsRouteContentProps = {
  route: SettingsRouteKey;
};

const settingsPages: Record<SettingsRouteKey, ComponentType> = {
  index: SettingsIndexPage,
  account: AccountSettingsPage,
  preferences: PreferencesPage,
  notifications: NotificationsSettingsPage,
  privacy: PrivacySettingsPage,
  'change-password': ChangePasswordPage,
  'set-password': SetPasswordPage,
  'delete-account': DeleteAccountPage,
};

export function SettingsRouteContent({ route }: SettingsRouteContentProps) {
  const Page = settingsPages[route];

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[12rem] items-center justify-center">
          <LoadingState />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
}
