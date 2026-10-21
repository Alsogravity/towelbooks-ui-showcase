import { ButtonLink } from '../../../components/primitives';
import { AuthFormPage } from '../../../features/auth/ui/AuthFormPage';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { PUBLIC_APP_ENTRY_PATH } from '../../../lib/origins';
import { SketchUnderline } from '../../landing/sketchMarks';

/**
 * Stand-in shown for every guest auth route while the backend is not yet live
 * (gated by `VITE_AUTH_COMING_SOON`). It keeps the familiar auth shell so the
 * sign-in / create-account CTAs on the landing page resolve to a friendly
 * "available soon" message instead of forms that cannot complete or a 404.
 */
function ComingSoonHeading({ text }: { text: string }) {
  const splitIndex = text.lastIndexOf(' ');
  const head = splitIndex === -1 ? '' : text.slice(0, splitIndex + 1);
  const lastWord = splitIndex === -1 ? text : text.slice(splitIndex + 1);

  return (
    <>
      {head}
      <span className="relative inline-block whitespace-nowrap">
        {lastWord}
        <SketchUnderline
          className="absolute -bottom-1 left-0 h-[0.35em] w-full"
          color="var(--hand)"
        />
      </span>
    </>
  );
}

export function AuthComingSoonPage() {
  usePageTitle({ key: 'page.auth.comingSoon.title', fallback: 'Coming soon' });

  const { t } = useI18n();

  return (
    <AuthFormPage
      eyebrow={t('auth.comingSoon.eyebrow')}
      title={<ComingSoonHeading text={t('auth.comingSoon.heading')} />}
      description={t('auth.comingSoon.body')}
      titleAlign="center"
    >
      <ButtonLink
        to={PUBLIC_APP_ENTRY_PATH}
        variant="secondary"
        className="w-full justify-center"
      >
        {t('auth.comingSoon.backHome')}
      </ButtonLink>
    </AuthFormPage>
  );
}
