import { LoadingState as SharedLoadingState } from '@towelbooks/ui';

import { type LocalizedText, resolveLocalizedText, useI18n } from '../../i18n';

interface LoadingStateProps {
  className?: string;
  label?: LocalizedText;
}

export function LoadingState({ className = '', label }: LoadingStateProps) {
  const { t } = useI18n();
  const resolvedLabel = label ?? {
    key: 'common.loading',
    fallback: 'Loading...',
  };

  return (
    <SharedLoadingState className={className}>
      {resolveLocalizedText(resolvedLabel, t)}
    </SharedLoadingState>
  );
}
