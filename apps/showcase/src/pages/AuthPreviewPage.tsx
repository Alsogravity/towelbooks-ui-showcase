import { Link } from 'react-router';
import { ButtonLink } from '../components/primitives';
import { useI18n } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';
export function AuthPreviewPage() {
  const { ui } = useI18n();
  usePageTitle(ui('authPreview'));
  return (
    <main className="auth-preview">
      <section className="auth-art">
        <img
          src="/assets/brand/wordmark.svg"
          alt="TowelBooks"
          width="180"
          height="40"
        />
        <img
          src="/assets/landing/reading-room-hero.png"
          alt=""
          className="auth-illustration"
        />
        <h1>{ui('authTitle')}</h1>
      </section>
      <section className="auth-form">
        <p className="eyebrow">{ui('authPreview')}</p>
        <h2 className="app-text-page-title">TowelBooks</h2>
        <p className="app-text-body text-ink-3">{ui('authBody')}</p>
        <ButtonLink to="/demo">{ui('demoIdentity')}</ButtonLink>
        <Link to="/">← {ui('landing')}</Link>
      </section>
    </main>
  );
}
