import {
  localeSelfLabels,
  type AppLocale,
  APP_LOCALES,
  useI18n,
} from '../../i18n';
import { Select } from '../primitives';

type FooterLanguageSelectProps = {
  className?: string;
};

export function FooterLanguageSelect({
  className = '',
}: FooterLanguageSelectProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <Select
      aria-label={t('auth.shell.language.label')}
      className={`footer-lang-select${className ? ` ${className}` : ''}`}
      matchActivatorWidth={false}
      onChange={(event) => setLocale(event.target.value as AppLocale)}
      placement="top-start"
      value={locale}
      variant="ghost"
    >
      {APP_LOCALES.map((supportedLocale) => (
        <option key={supportedLocale} value={supportedLocale}>
          {localeSelfLabels[supportedLocale]}
        </option>
      ))}
    </Select>
  );
}
