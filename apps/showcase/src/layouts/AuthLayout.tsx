import { Suspense, useEffect, useRef, type ReactNode } from 'react';
import { Outlet, useLocation, useMatches } from 'react-router';

import { trackPageView } from '../features/analytics';
import { RouteLoadingFallback } from '../app/RouteLoadingFallback';
import {
  isFullWidthAuthShell,
  resolveAuthShellVariant,
} from '../features/auth/authShell';
import { AuthBrandHeader } from '../features/auth/ui/AuthBrandHeader';
import { AuthLegalFooter } from '../features/auth/ui/AuthLegalFooter';
import { AuthPageFrame } from '../features/auth/ui/AuthPageFrame';
import { useI18n } from '../i18n';
import { useMarkStartupInteractive } from '../lib/startupTelemetry';
import {
  Annotation,
  SketchArrowGlyph,
  SketchUnderline,
} from '../pages/landing/sketchMarks';

export type AuthLayoutProps = {
  children?: ReactNode;
};

function StartupInteractiveMarker() {
  useMarkStartupInteractive();
  return null;
}

export function AuthLayout({ children }: AuthLayoutProps = {}) {
  const { pathname } = useLocation();
  const matches = useMatches();
  const { t } = useI18n();
  const prevPathRef = useRef('');

  useEffect(() => {
    trackPageView(pathname, prevPathRef.current || document.referrer);
    prevPathRef.current = pathname;
  }, [pathname]);

  const shellVariant = resolveAuthShellVariant(matches, pathname);
  const isFullWidthShell = isFullWidthAuthShell(shellVariant);
  const showDarkPanel = !isFullWidthShell;

  const tagline = t('auth.shell.tagline');
  const taglineSplit = tagline.lastIndexOf(' ');
  const taglineHead =
    taglineSplit === -1 ? '' : tagline.slice(0, taglineSplit + 1);
  const taglineLastWord =
    taglineSplit === -1 ? tagline : tagline.slice(taglineSplit + 1);

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-paper">
      <div
        aria-hidden={isFullWidthShell}
        className={`app-auth-hero-panel hidden min-h-screen overflow-y-auto lg:flex flex-col items-center justify-center relative transition-all duration-700 ease-in-out ${
          isFullWidthShell
            ? 'lg:w-0 opacity-0'
            : 'lg:w-1/2 xl:w-3/5 opacity-100'
        }`}
      >
        <div className="flex min-h-full w-full shrink-0 flex-col items-center justify-center py-8 lg:w-[50vw] xl:w-[60vw]">
          <div className="z-10 flex w-full flex-col items-center px-8 text-center">
            <p className="mb-5 flex items-center gap-2">
              <Annotation>{t('auth.shell.eyebrow')}</Annotation>
              <SketchArrowGlyph className="h-4 w-7 shrink-0 text-[color:var(--hand)]" />
            </p>
            <div className="w-full max-w-[800px]">
              <h1 className="font-display font-medium leading-[1.1] text-night-fg text-balance text-[clamp(2.5rem,4vw,5.5rem)] tracking-[clamp(-3px,-0.2vw,-1px)]">
                {taglineHead}
                <span className="relative inline-block whitespace-nowrap">
                  {taglineLastWord}
                  <SketchUnderline
                    className="absolute -bottom-2 left-0 h-[0.4em] w-full"
                    color="var(--hand)"
                  />
                </span>
              </h1>
            </div>

            <div className="relative mt-8 flex w-[clamp(320px,85%,840px)] items-center justify-center xl:mt-10">
              <img
                src="/assets/brand/auth-collage.png"
                className="h-auto w-full object-contain drop-shadow-2xl"
                alt="People reading together"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`app-auth-shell-column flex min-h-screen flex-col bg-vellum transition-all duration-700 ease-in-out lg:border-l ${
          isFullWidthShell
            ? 'w-full border-ink/0'
            : 'w-full lg:w-1/2 xl:w-2/5 border-ink/10'
        }`}
      >
        <AuthBrandHeader showDarkPanel={showDarkPanel} />

        <main
          id="auth-main"
          className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-4 pb-[var(--auth-optical-balance)] sm:p-6 lg:pt-[var(--auth-header-offset)]"
        >
          <div className="w-full max-w-md">
            <div key={pathname} className="auth-content-enter">
              <AuthPageFrame>
                <Suspense fallback={<RouteLoadingFallback variant="shell" />}>
                  {children ?? <Outlet />}
                  <StartupInteractiveMarker />
                </Suspense>
              </AuthPageFrame>
            </div>
          </div>
        </main>

        <AuthLegalFooter />
      </div>
    </div>
  );
}
