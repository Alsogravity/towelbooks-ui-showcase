import { Switch } from '@towelbooks/ui';
import type {
  NotificationChannelPreference,
  NotificationPreference,
  NotificationType,
} from '@towelbooks/schemas';

import {
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from './useNotifications';
import { AppControlRow, AppSubsection } from '../../components/application';
import { PageSection } from '../../components/layout';
import { Alert } from '../../components/primitives';
import { useI18n } from '../../i18n';

type NotificationPreferencesSectionProps = {
  embedded?: boolean;
};

export function NotificationPreferencesSection({
  embedded = false,
}: NotificationPreferencesSectionProps) {
  const { t } = useI18n();
  const preferencesQuery = useNotificationPreferences();
  const updatePreference = useUpdateNotificationPreference();

  if (preferencesQuery.isError) {
    const errorContent = (
      <Alert variant="warning">
        {t('notifications.preferences.saveError')}
      </Alert>
    );

    if (embedded) {
      return <PageSection spacing="none">{errorContent}</PageSection>;
    }

    return (
      <AppSubsection
        title={t('notifications.preferences.title')}
        description={t('notifications.preferences.description')}
      >
        {errorContent}
      </AppSubsection>
    );
  }

  const items = preferencesQuery.data?.items ?? [];

  const content = (
    <div className="divide-y divide-rule">
      {items.map((preference) => (
        <PreferenceRow
          key={preference.type}
          isSaving={updatePreference.isPending}
          onToggle={(channel, enabled) =>
            updatePreference.mutate({
              type: preference.type as NotificationType,
              body:
                channel === 'inApp'
                  ? { inAppEnabled: enabled }
                  : { emailEnabled: enabled },
            })
          }
          preference={preference}
        />
      ))}
    </div>
  );

  if (embedded) {
    return <PageSection spacing="none">{content}</PageSection>;
  }

  return (
    <AppSubsection
      title={t('notifications.preferences.title')}
      description={t('notifications.preferences.description')}
    >
      {content}
    </AppSubsection>
  );
}

type PreferenceRowProps = {
  isSaving: boolean;
  onToggle: (channel: 'inApp' | 'email', enabled: boolean) => void;
  preference: NotificationPreference;
};

function PreferenceRow({ isSaving, onToggle, preference }: PreferenceRowProps) {
  const { t } = useI18n();

  return (
    <AppControlRow
      label={t(`notifications.type.${preference.type}`)}
      mobileLayout="inline"
      control={
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
          <ChannelToggle
            channel={preference.inApp}
            isSaving={isSaving}
            label={t('notifications.preferences.channel.inApp')}
            onToggle={(enabled) => onToggle('inApp', enabled)}
          />
          <ChannelToggle
            channel={preference.email}
            isSaving={isSaving}
            label={t('notifications.preferences.channel.email')}
            onToggle={(enabled) => onToggle('email', enabled)}
          />
        </div>
      }
    />
  );
}

type ChannelToggleProps = {
  channel: NotificationChannelPreference;
  isSaving: boolean;
  label: string;
  onToggle: (enabled: boolean) => void;
};

function ChannelToggle({
  channel,
  isSaving,
  label,
  onToggle,
}: ChannelToggleProps) {
  const isDisabled = !channel.editable || isSaving || !channel.supported;

  return (
    <label
      className={`flex items-center gap-2 text-sm text-ink-2${!channel.supported ? ' opacity-50' : ''}`}
    >
      <span>{label}</span>
      <Switch
        aria-label={label}
        checked={channel.enabled}
        disabled={isDisabled}
        onCheckedChange={(next) => onToggle(next)}
      />
    </label>
  );
}
