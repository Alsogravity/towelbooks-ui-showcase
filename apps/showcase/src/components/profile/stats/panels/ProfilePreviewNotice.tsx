import { useI18n } from '../../../../i18n';

export interface ProfilePreviewNoticeProps {
  shownCount: number;
  totalCount: number;
}

export function ProfilePreviewNotice({
  shownCount,
  totalCount,
}: ProfilePreviewNoticeProps) {
  const { formatNumber, t } = useI18n();

  return (
    <p className="body-sm text-ink-3" role="note">
      {t('profile.statDialog.previewNotice', {
        values: {
          shown: formatNumber(shownCount),
          total: formatNumber(totalCount),
        },
      })}
    </p>
  );
}
