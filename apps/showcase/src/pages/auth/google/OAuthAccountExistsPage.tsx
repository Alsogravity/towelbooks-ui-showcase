import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { AuthSignInLink } from '../../../features/auth/ui/AuthTextLink';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';

export function OAuthAccountExistsPage() {
  usePageTitle({
    key: 'page.auth.oauthAccountExists.title',
    fallback: 'Account already exists',
  });

  const { t } = useI18n();

  return (
    <AuthFormPage title={t('auth.oauthAccountExists.heading')}>
      <p className="supporting-copy text-ink-2">
        {t('auth.oauthAccountExists.body')}
      </p>
      <div className="mt-6 text-center">
        <AuthSignInLink>
          {t('auth.oauthAccountExists.signInAction')}
        </AuthSignInLink>
      </div>
    </AuthFormPage>
  );
}
