import { Link } from 'react-router';
import { useI18n } from '../../i18n';
export function GuestSiteFooter({ className = '' }: { className?: string }) {
  const { ui, locale, setLocale } = useI18n();
  return (
    <footer className={`showcase-footer ${className}`}>
      <img
        src="/assets/brand/wordmark-white.svg"
        alt="TowelBooks"
        width="150"
        height="34"
      />
      <nav aria-label={ui('landing')}>
        <Link to="/demo">{ui('explore')}</Link>
        <Link to="/pricing">{ui('pricing')}</Link>
        <Link to="/preview/auth">{ui('authPreview')}</Link>
      </nav>
      <label>
        {ui('locale')}
        <select
          value={locale}
          onChange={(e) =>
            setLocale(e.target.value === 'en-US' ? 'en-US' : 'pt-BR')
          }
        >
          <option value="pt-BR">Português</option>
          <option value="en-US">English</option>
        </select>
      </label>
      <small>{ui('demo')}</small>
    </footer>
  );
}
