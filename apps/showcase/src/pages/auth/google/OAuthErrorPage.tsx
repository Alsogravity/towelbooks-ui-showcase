import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';

export function OAuthErrorPage() {
  usePageTitle({
    key: 'page.auth.oauthError.title',
    fallback: 'Sign-in error',
  });

  const { t } = useI18n();

  return (
    <AuthFormPage title={t('auth.oauthError.heading')}>
      <p className="supporting-copy text-ink-2">{t('auth.oauthError.body')}</p>
      <div className="mt-6 text-center">
        <AuthSignInLink>{t('auth.oauthError.tryAgain')}</AuthSignInLink>
      </div>
    </AuthFormPage>
  );
}
