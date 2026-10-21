import { useReportOverlay } from '../../features/reports/ReportOverlayContext';
import { useI18n } from '../../i18n';
import { ActionMenu, ToolbarIconButton } from '../primitives';

export interface ProfileVisitorMenuProps {
  reportTargetId: string;
}

export function ProfileVisitorMenu({
  reportTargetId,
}: ProfileVisitorMenuProps) {
  const { openReport } = useReportOverlay();
  const { t } = useI18n();
  const menuLabel = t('profile.action.menu');

  return (
    <ActionMenu
      ariaLabel={menuLabel}
      contentClassName="w-48"
      placement="bottom-start"
      sections={[
        {
          id: 'profile-actions',
          items: [
            {
              id: 'report-profile',
              kind: 'action',
              icon: 'flag',
              label: t('reports.action.report'),
              onSelect: () =>
                openReport({ targetId: reportTargetId, targetType: 'profile' }),
            },
          ],
        },
      ]}
      activator={({ activatorProps, ref }) => (
        <ToolbarIconButton
          ref={ref}
          icon="more-horizontal"
          iconSize={20}
          aria-label={menuLabel}
          {...activatorProps}
        />
      )}
    />
  );
}
