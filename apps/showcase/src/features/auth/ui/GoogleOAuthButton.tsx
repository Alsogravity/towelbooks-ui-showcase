import { useState } from 'react';
import { useI18n } from '../../../i18n';
import {
  type GoogleOAuthIntent,
  googleOAuthStartUrl,
  isGoogleOAuthEnabled,
} from '../../../lib/googleOAuth';
import { GoogleGLogo } from './GoogleGLogo';

const BASE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '12px',
  border: '1px solid var(--google-oauth-btn-stroke)',
  borderRadius: '9999px',
  color: 'var(--google-oauth-btn-fg)',
  fontSize: '0.9375rem',
  fontWeight: 500,
  lineHeight: 1.25,
  cursor: 'pointer',
  width: '100%',
  minHeight: '2.75rem',
  fontFamily: 'inherit',
  transition: 'background-color 150ms ease',
} as const;

export function GoogleOAuthButton({ intent }: { intent: GoogleOAuthIntent }) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  if (!isGoogleOAuthEnabled(import.meta.env)) {
    return null;
  }

  return (
    <button
      type="button"
      style={{
        ...BASE_STYLE,
        backgroundColor: isHovered
          ? 'var(--google-oauth-btn-hover-fill)'
          : 'var(--google-oauth-btn-fill)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        window.location.assign(googleOAuthStartUrl(intent));
      }}
    >
      <GoogleGLogo className="shrink-0" />
      <span>
        {intent === 'sign_in'
          ? t('auth.google.signInWithGoogle')
          : t('auth.google.signUpWithGoogle')}
      </span>
    </button>
  );
}
