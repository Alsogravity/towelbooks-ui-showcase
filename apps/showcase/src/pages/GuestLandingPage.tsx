import { Fragment, useEffect, useState, type ComponentType } from 'react';
import { BuildLibraryGlyph } from '../components/illustrations/BuildLibraryGlyph';
import { FeatureIllustration } from '../components/illustrations/FeatureIllustration';
import { GatherRoomGlyph } from '../components/illustrations/GatherRoomGlyph';
import { ReadDiscussGlyph } from '../components/illustrations/ReadDiscussGlyph';
import { ButtonLink, type IconName } from '../components/primitives';
import { usePageTitle } from '../hooks/usePageTitle';
import { useI18n } from '../i18n';
import { GuestSiteFooter } from './landing/GuestSiteFooter';
import { HeroTextPortal } from './landing/HeroTextPortal';
import { LandingPillSection } from './landing/LandingPillSection';
import { ReadingDoodles } from './landing/ReadingDoodles';
import { SocialReadingVisual } from './landing/SocialReadingVisual';
import {
  Annotation,
  SketchArrow,
  SketchArrowGlyph,
  SketchBookDataIcon,
  SketchBringPeopleIcon,
  SketchFindRoomIcon,
  SketchFreeStartIcon,
  SketchFrame,
  SketchStartReadingIcon,
  SketchUnderline,
} from './landing/sketchMarks';

const REGISTER_PATH = '/preview/auth';
const GUEST_LOGIN_PATH = '/preview/auth';

type PromiseIcon = ComponentType<{
  className?: string;
  variant?: number;
}>;

type PromiseItem = {
  Icon: PromiseIcon;
  titleKey: string;
  bodyKey: string;
};

const PROMISES: readonly PromiseItem[] = [
  {
    Icon: SketchFreeStartIcon,
    titleKey: 'landing.promises.free.title',
    bodyKey: 'landing.promises.free.body',
  },
  {
    Icon: SketchBringPeopleIcon,
    titleKey: 'landing.promises.people.title',
    bodyKey: 'landing.promises.people.body',
  },
  {
    Icon: SketchBookDataIcon,
    titleKey: 'landing.promises.data.title',
    bodyKey: 'landing.promises.data.body',
  },
];

// Reader personas surfaced as a decorative cluster in the "Made for the way you
// read" card — the order matches the visual rhythm, not any ranking.
const PERSONA_TAG_KEYS: readonly string[] = [
  'landing.personas.tags.rooms',
  'landing.personas.tags.solo',
  'landing.personas.tags.students',
  'landing.personas.tags.rereaders',
  'landing.personas.tags.notetakers',
  'landing.personas.tags.nightowls',
  'landing.personas.tags.bingers',
  'landing.personas.tags.slow',
  'landing.personas.tags.buddy',
  'landing.personas.tags.scribblers',
];

type Step = {
  badgeClassName: string;
  Icon: ComponentType<{ className?: string }>;
  titleKey: string;
  bodyKey: string;
};

const STEPS: readonly Step[] = [
  {
    badgeClassName: 'bg-brick text-[color:var(--accent-fg)]',
    Icon: BuildLibraryGlyph,
    titleKey: 'landing.how.step1.title',
    bodyKey: 'landing.how.step1.body',
  },
  {
    badgeClassName:
      'bg-forest text-[color:var(--accent-fg)] dark:bg-forest-soft',
    Icon: GatherRoomGlyph,
    titleKey: 'landing.how.step2.title',
    bodyKey: 'landing.how.step2.body',
  },
  {
    badgeClassName:
      'bg-gold text-ink dark:bg-gold-soft dark:text-[color:var(--accent-fg)]',
    Icon: ReadDiscussGlyph,
    titleKey: 'landing.how.step3.title',
    bodyKey: 'landing.how.step3.body',
  },
];

type Feature = {
  icon: IconName;
  titleKey: string;
  bodyKey: string;
  badgeKey?: string;
  /**
   * Vibrant header-band background. A glossy top highlight is layered over a
   * saturated brand-adjacent gradient chosen to contrast its illustration.
   */
  band: string;
};

const bandGradient = (from: string, to: string) =>
  `radial-gradient(120% 90% at 28% 12%, rgba(0,0,0,0.15), rgba(0,0,0,0) 58%), linear-gradient(145deg, ${from} 0%, ${to} 100%)`;

const FEATURES: readonly Feature[] = [
  {
    icon: 'library',
    titleKey: 'landing.features.libraries.title',
    bodyKey: 'landing.features.libraries.body',
    band: bandGradient('#4f46e5', '#3730a3'), // indigo: darker
  },
  {
    icon: 'users-round',
    titleKey: 'landing.features.rooms.title',
    bodyKey: 'landing.features.rooms.body',
    band: bandGradient('#d97706', '#92400e'), // amber: darker
  },
  {
    icon: 'feather',
    titleKey: 'landing.features.reflections.title',
    bodyKey: 'landing.features.reflections.body',
    band: bandGradient('#0d9488', '#0f766e'), // teal: darker
  },
  {
    icon: 'eye-off',
    titleKey: 'landing.features.spoilers.title',
    bodyKey: 'landing.features.spoilers.body',
    band: bandGradient('#ec4899', '#be185d'), // rose: darker
  },
  {
    icon: 'book-open',
    titleKey: 'landing.features.catalog.title',
    bodyKey: 'landing.features.catalog.body',
    band: bandGradient('#7c3aed', '#5b21b6'), // violet: darker
  },
  {
    icon: 'external-link',
    titleKey: 'landing.features.buy.title',
    bodyKey: 'landing.features.buy.body',
    badgeKey: 'landing.features.buy.badge',
    band: bandGradient('#2f8fed', '#1d4ed8'), // sky: darker
  },
];

function SectionEyebrow({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <p className={`mb-4 flex items-center gap-2 ${className ?? ''}`}>
      <Annotation>{children}</Annotation>
      <SketchArrowGlyph className="h-4 w-7 shrink-0 text-[color:var(--hand)]" />
    </p>
  );
}

/** Reader-persona chips with a gentle traveling spotlight. One chip lights up at
 *  a time and cycles on its own — animating the section's promise that TowelBooks
 *  fits *whoever* you are. Hovering pauses the auto-cycle and follows the cursor;
 *  the cycle is skipped entirely under prefers-reduced-motion. */
function PersonaPills() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % PERSONA_TAG_KEYS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <ul
      className="mt-9 flex max-w-md list-none flex-wrap gap-2.5 p-0"
      onMouseLeave={() => setPaused(false)}
    >
      {PERSONA_TAG_KEYS.map((key, index) => (
        <li key={key}>
          <span
            className={`landing-persona-pill inline-flex items-center rounded-full px-4 py-2 text-sm font-medium${
              index === activeIndex ? ' landing-persona-pill--active' : ''
            }`}
            onMouseEnter={() => {
              setPaused(true);
              setActiveIndex(index);
            }}
          >
            {t(key)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function GuestLandingPage() {
  const { t } = useI18n();
  usePageTitle({ key: 'landing.meta.title' });

  const title = t('landing.hero.title');
  const commaIndex = title.indexOf(',');
  const titleFirstLine =
    commaIndex === -1 ? '' : title.slice(0, commaIndex + 1);
  const titleRemainder =
    commaIndex === -1 ? title : title.slice(commaIndex + 1).trim();
  const remainderSplit = titleRemainder.lastIndexOf(' ');
  const remainderHead =
    remainderSplit === -1 ? '' : titleRemainder.slice(0, remainderSplit + 1);
  const remainderLastWord =
    remainderSplit === -1
      ? titleRemainder
      : titleRemainder.slice(remainderSplit + 1);

  const socialTitle = t('landing.social.title');
  const socialCommaIndex = socialTitle.indexOf(',');
  const socialTitleFirstLine =
    socialCommaIndex === -1 ? '' : socialTitle.slice(0, socialCommaIndex + 1);
  const socialTitleRemainder =
    socialCommaIndex === -1
      ? socialTitle
      : socialTitle.slice(socialCommaIndex + 1).trim();
  const socialRemainderSplit = socialTitleRemainder.lastIndexOf(' ');
  const socialRemainderHead =
    socialRemainderSplit === -1
      ? ''
      : socialTitleRemainder.slice(0, socialRemainderSplit + 1);
  const socialRemainderLastWord =
    socialRemainderSplit === -1
      ? socialTitleRemainder
      : socialTitleRemainder.slice(socialRemainderSplit + 1);

  return (
    // The guest landing is locked to the dark theme regardless of the user's
    // global preference. data-theme="dark" scopes the dark design tokens (and
    // every `dark:` utility) to this subtree only — see design-tokens global.css.
    <div
      data-theme="dark"
      className="relative flex min-h-screen flex-col overflow-x-hidden bg-paper"
    >
      {/* Hero — locked to the light theme (a nested data-theme="light" subtree
          reverts the inherited dark tokens; see design-tokens global.css) so the
          opening section reads as a bright reading room above the dark page. */}
      <section
        data-theme="light"
        className="relative flex h-svh flex-col items-center justify-center overflow-hidden bg-paper px-6 pb-16 pt-28 sm:px-12 sm:pb-20 sm:pt-32 lg:px-24"
      >
        <img
          src="/assets/landing/hero-background-mobile.png"
          alt=""
          aria-hidden="true"
          className="landing-hero-bg pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-cover opacity-[0.20] sm:hidden"
        />
        <img
          src="/assets/landing/hero-background-desktop.png"
          alt=""
          aria-hidden="true"
          className="landing-hero-bg pointer-events-none absolute inset-0 z-0 hidden h-full w-full select-none object-cover opacity-[0.20] sm:block"
        />
        <HeroTextPortal />
        <div className="pointer-events-none absolute top-16 left-1/2 z-20 h-12 w-[212px] -translate-x-1/2 select-none sm:top-24">
          {/* Light hero: always the dark-ink wordmark (the page-level `dark:`
              variant still matches the ancestor, so it can't be relied on here). */}
          <img
            src="/assets/brand/wordmark.svg"
            alt="TowelBooks"
            width={212}
            height={48}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
        <div className="relative z-10 mx-auto -translate-y-6 flex max-w-5xl flex-col items-center text-center sm:-translate-y-8">
          <p className="mb-5 flex items-center gap-2">
            <Annotation>{t('landing.hero.eyebrow')}</Annotation>
            <SketchArrowGlyph className="h-4 w-7 shrink-0 text-[color:var(--hand)]" />
          </p>
          <h1
            style={{ fontFamily: 'var(--font-literary)' }}
            className="landing-hero-title text-balance font-normal leading-[1.02] text-ink tracking-tight"
          >
            {titleFirstLine ? (
              <>
                {titleFirstLine} <br className="sm:hidden" />
              </>
            ) : null}
            {remainderHead}
            <span className="relative inline-block whitespace-nowrap">
              {remainderLastWord}
              <SketchUnderline
                className="absolute -bottom-2 left-0 h-[0.4em] w-full"
                color="var(--hand)"
              />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink-2">
            {t('landing.hero.body')}
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center">
            <ButtonLink
              to={GUEST_LOGIN_PATH}
              variant="secondary"
              size="lg"
              className="landing-page-button min-w-[200px] justify-center backdrop-blur-[2px] bg-ink/[0.02]"
            >
              {t('landing.nav.login')}
            </ButtonLink>
            <ButtonLink
              to={REGISTER_PATH}
              size="lg"
              className="landing-page-button min-w-[200px] justify-center"
            >
              {t('landing.nav.signup')}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Made for the way you read — the dark editorial pill that bridges the
          light hero into the dark page. Reusing the landing-pill shell: the top
          cap is cream (melting into the hero), the bottom cap is the page's dark
          surface (melting into the promises band), so the pill blends on both
          edges with no seam. Reader personas fan out on the left; the
          illustration bleeds above the rounded top edge. */}
      <LandingPillSection
        bottomCapTone="forest"
        sectionClassName="flex flex-col rounded-[4rem] border-y-2 border-ink/10 px-6 py-20 sm:rounded-[6rem] sm:px-12 sm:py-24 lg:rounded-[8rem] lg:px-24 lg:py-28"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            {/* Left — editorial headline + persona pills */}
            <div>
              <SectionEyebrow>{t('landing.personas.eyebrow')}</SectionEyebrow>
              <h2 className="landing-personas-title text-balance font-normal leading-[1.0] text-ink">
                {t('landing.personas.title.lead')}{' '}
                <span className="landing-personas-accent">
                  {t('landing.personas.title.accent')}
                </span>{' '}
                {t('landing.personas.title.tail')}
              </h2>
              <PersonaPills />
            </div>

            {/* Right — illustration bleeding above the card, then the
                secondary headline, body, and call to action. */}
            <div className="relative flex flex-col">
              <div className="landing-personas-art relative mb-4 self-center lg:-mt-50 lg:self-end">
                <span className="landing-personas-glow" aria-hidden="true" />
                <img
                  src="/assets/landing/reader-towelbooks-no-bg.png"
                  alt={t('landing.personas.illustration.alt')}
                  width={900}
                  height={900}
                  className="relative z-[1] h-auto w-72 max-w-none [filter:drop-shadow(0_12px_26px_rgba(0,0,0,0.3))] sm:w-80 lg:w-[28rem]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="lg:max-w-sm lg:self-end">
                <h3 className="landing-personas-subtitle text-balance text-ink">
                  {t('landing.personas.subtitle')}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-ink-2">
                  {t('landing.personas.body')}
                </p>
                <ButtonLink
                  to={REGISTER_PATH}
                  size="lg"
                  prependIcon={SketchStartReadingIcon}
                  className="landing-page-button landing-personas-cta mt-6 w-full justify-center"
                >
                  {t('landing.personas.cta')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </LandingPillSection>

      {/* Promises band */}
      <LandingPillSection
        surfaceTone="forest"
        topCapTone="forest"
        bottomCapTone="paper"
        sectionClassName="rounded-b-[4rem] border-b border-white/10 px-6 py-16 sm:rounded-b-[6rem] sm:px-12 sm:py-20 lg:rounded-b-[8rem] lg:px-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionEyebrow className="text-white/80">
            {t('landing.promises.eyebrow')}
          </SectionEyebrow>
          <div className="grid gap-8 border-t border-white/20 pt-8 sm:grid-cols-3 sm:gap-10">
            {PROMISES.map((promise, index) => (
              <div key={promise.titleKey} className="flex items-start gap-4">
                <promise.Icon
                  className="h-10 w-10 shrink-0 text-white"
                  variant={index}
                />
                <div>
                  <h3 className="font-display text-lg font-medium text-white">
                    {t(promise.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/90">
                    {t(promise.bodyKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LandingPillSection>

      {/* How it works */}
      <section className="landing-how-section landing-paper-band bg-paper px-6 py-20 sm:px-12 sm:py-28 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="landing-how-intro max-w-2xl">
            <SectionEyebrow className="landing-how-eyebrow">
              {t('landing.how.eyebrow')}
            </SectionEyebrow>
            <h2 className="font-section-title leading-tight">
              {t('landing.how.title')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed">
              {t('landing.how.body')}
            </p>
          </div>
          <ol className="mt-12 flex list-none flex-col gap-8 p-0 lg:flex-row lg:flex-nowrap lg:items-stretch lg:gap-3">
            {STEPS.map((step, index) => (
              <Fragment key={step.titleKey}>
                {index > 0 ? (
                  <li
                    aria-hidden="true"
                    className="hidden shrink-0 items-center lg:flex"
                  >
                    <SketchArrow className="h-10 w-16 text-ink-4" />
                  </li>
                ) : null}
                <li className="relative min-w-0 flex-1 p-7">
                  {/* Surface bounded by the SketchFrame stroke (inset by pad=6,
                      radius=24) so the hand-drawn stroke is the card border. */}
                  <div className="absolute inset-[6px] rounded-3xl bg-vellum shadow-[var(--shadow-2)]" />
                  <SketchFrame
                    color="var(--hand)"
                    strokeWidth="heavy"
                    seed={index * 7 + 11}
                    pad={6}
                    radius={24}
                  />
                  <div className="relative z-[1]">
                    <span
                      className={`mb-5 flex h-11 w-11 items-center justify-center rounded-full ${step.badgeClassName}`}
                      aria-hidden="true"
                    >
                      <step.Icon className="h-6 w-6" />
                    </span>
                    <h3 className="font-display text-xl font-medium text-ink">
                      {t(step.titleKey)}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                      {t(step.bodyKey)}
                    </p>
                  </div>
                </li>
              </Fragment>
            ))}
          </ol>
        </div>
      </section>

      {/* A reading room, not a dashboard — same shell as the personas pill; both
          caps are cream here, so it floats between the two warm-paper bands. */}
      <LandingPillSection sectionClassName="landing-room-section rounded-[4rem] border-y-2 border-ink/10 px-6 py-28 sm:rounded-[6rem] sm:px-12 lg:rounded-[8rem] lg:px-24">
        <div className="relative z-[1] mx-auto max-w-3xl overflow-visible text-center">
          <div className="flex flex-col items-center">
            <SectionEyebrow className="justify-center">
              {t('landing.room.eyebrow')}
            </SectionEyebrow>
            <h2 className="font-section-title leading-tight text-ink">
              {t('landing.room.title')}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">
              {t('landing.room.body')}
            </p>
            <ButtonLink
              to={REGISTER_PATH}
              variant="secondary"
              size="lg"
              className="landing-page-button mt-7 w-full justify-center !text-2xl sm:w-auto sm:min-w-[18rem]"
            >
              {t('landing.room.cta')}
            </ButtonLink>
          </div>
        </div>
      </LandingPillSection>

      {/* Features grid — warm-paper band (#f4ecd8) sprinkled with shy,
          hand-drawn reading doodles peeking from the edges. */}
      <section className="relative overflow-hidden bg-[#f4ecd8] px-6 py-20 sm:px-12 sm:py-28 lg:px-24">
        <ReadingDoodles />
        <div className="relative z-[1] mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-section-title leading-tight text-[#1a1714]">
              {t('landing.features.title')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#3d362c]">
              {t('landing.features.body')}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.titleKey}
                className="landing-feature-card group relative p-[6px] transition-transform duration-300 ease-out hover:-translate-y-1.5"
              >
                {/* Hand-drawn border traces the card; the rounded surface inside
                    (inset 6px to meet the stroke) carries a vibrant header band
                    with the illustration, then the copy on the dark surface. */}
                <SketchFrame
                  color="var(--ink-4)"
                  seed={index * 13 + 5}
                  pad={6}
                  radius={24}
                  sloppiness="high"
                  strokeWidth="medium"
                />
                <div className="relative z-[1] flex h-full flex-col overflow-hidden rounded-3xl bg-vellum shadow-[var(--shadow-1)] transition-shadow duration-300 group-hover:shadow-[var(--shadow-3)]">
                  <div
                    className="relative flex h-32 items-center justify-center"
                    style={{ background: feature.band }}
                    aria-hidden="true"
                  >
                    <FeatureIllustration
                      name={feature.icon}
                      className="landing-feature-art pointer-events-none h-28 w-28 [filter:drop-shadow(0_5px_6px_rgba(16,17,18,0.28))]"
                    />
                  </div>
                  <div className="relative px-6 pb-7 pt-5">
                    {feature.badgeKey ? (
                      <span
                        style={{ fontFamily: 'var(--font-hand)' }}
                        className="absolute right-4 top-4 rotate-6 rounded-full bg-[#fbf6e9] px-3 py-0.5 text-[15px] leading-tight text-[color:var(--hand)] shadow-[var(--shadow-2)]"
                      >
                        {t(feature.badgeKey)}
                      </span>
                    ) : null}
                    <h3
                      style={{ fontFamily: 'var(--font-hand)' }}
                      className="pr-14 text-2xl font-normal leading-snug text-ink"
                    >
                      {t(feature.titleKey)}
                    </h3>
                    <p className="mt-2.5 text-sm leading-normal text-ink-2">
                      {t(feature.bodyKey)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social reading */}
      <div id="landing-social" className="scroll-mt-28">
        <LandingPillSection sectionClassName="rounded-[4rem] border-y-2 border-ink/10 px-6 py-20 sm:rounded-[6rem] sm:px-12 lg:rounded-[8rem] lg:px-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <SocialReadingVisual />
            </div>
            <div className="order-1 flex flex-col items-center text-center lg:order-2 lg:justify-center lg:py-4">
              <SectionEyebrow className="justify-center">
                {t('landing.social.eyebrow')}
              </SectionEyebrow>
              <h2 className="landing-social-title mx-auto max-w-xl text-balance font-section-title leading-tight text-ink">
                {socialTitleFirstLine ? (
                  <>
                    {socialTitleFirstLine}
                    <br />
                  </>
                ) : null}
                {socialRemainderHead}
                <span className="relative inline-block whitespace-nowrap">
                  {socialRemainderLastWord}
                  <SketchUnderline
                    className="absolute -bottom-2 left-0 h-[0.4em] w-full"
                    color="var(--hand)"
                  />
                </span>
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-ink-2">
                {t('landing.social.body')}
              </p>
              <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center">
                <ButtonLink
                  to={REGISTER_PATH}
                  variant="secondary"
                  size="lg"
                  className="landing-page-button landing-social-find-cta min-w-[200px] justify-center"
                  prependIcon={SketchFindRoomIcon}
                >
                  {t('landing.social.cta.exploreRooms')}
                </ButtonLink>
                <ButtonLink
                  to={REGISTER_PATH}
                  size="lg"
                  className="landing-page-button landing-social-start-cta min-w-[200px] justify-center"
                  prependIcon={SketchStartReadingIcon}
                >
                  {t('landing.social.cta.start')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </LandingPillSection>
      </div>

      {/* Closing CTA band */}
      <section className="bg-[#f4ecd8] px-6 py-20 sm:px-12 sm:py-24 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="relative px-8 py-16 text-center sm:px-12">
            {/* Surface bounded by the SketchFrame stroke (inset by pad=6,
                radius=28) so the hand-drawn stroke is the band border. */}
            <div className="absolute inset-[6px] rounded-[28px] bg-vellum shadow-[var(--shadow-2)]" />
            <SketchFrame
              color="var(--brick)"
              strokeWidth="bold"
              seed={71}
              pad={6}
              radius={28}
            />
            <Annotation className="absolute right-7 top-7 z-[1] hidden rotate-[-7deg] sm:block">
              {t('landing.closing.tag')}
            </Annotation>
            <div className="relative z-[1] flex flex-col items-center">
              <h2 className="mx-auto max-w-2xl font-section-title leading-tight text-ink">
                {t('landing.closing.title')}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                {t('landing.closing.body')}
              </p>
              <div className="mt-9 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center">
                <ButtonLink
                  to={GUEST_LOGIN_PATH}
                  variant="secondary"
                  size="lg"
                  className="landing-page-button min-w-[200px] justify-center"
                >
                  {t('landing.nav.login')}
                </ButtonLink>
                <ButtonLink
                  to={REGISTER_PATH}
                  size="lg"
                  className="landing-page-button min-w-[200px] justify-center"
                >
                  {t('landing.nav.signup')}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GuestSiteFooter className="bg-paper" />
    </div>
  );
}
