import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';

const SOCIAL_IMAGE_SRC = '/assets/landing/reading-room-hero.png';

// Mobile: a clean alternating vertical stack with comfortable widths so the
// bubbles never overlap or clip on narrow screens. From `sm:` upward we restore
// the artful, slightly-overlapping scatter tuned for the wider layout.
const FLOATING_COMMENTS = [
  {
    key: 'landing.social.comments.1',
    className:
      'top-[4%] left-[4%] max-w-[62%] -rotate-2 ' +
      'sm:top-[9%] sm:left-[5%] sm:max-w-[44%]',
  },
  {
    key: 'landing.social.comments.2',
    className:
      'top-[19%] right-[4%] max-w-[62%] rotate-[2.5deg] ' +
      'sm:top-[16%] sm:right-[4%] sm:max-w-[46%]',
  },
  {
    key: 'landing.social.comments.5',
    className:
      'top-[34%] left-[5%] max-w-[60%] -rotate-[1.5deg] ' +
      'sm:top-[28%] sm:left-[30%] sm:max-w-[40%]',
  },
  {
    key: 'landing.social.comments.3',
    className:
      'top-[49%] right-[5%] max-w-[60%] -rotate-1 ' +
      'sm:top-[38%] sm:right-auto sm:left-[3%] sm:max-w-[48%]',
  },
  {
    key: 'landing.social.comments.4',
    className:
      'top-[64%] left-[4%] max-w-[60%] rotate-3 ' +
      'sm:top-[50%] sm:left-auto sm:right-[6%] sm:max-w-[42%]',
  },
] as const;

const COMPOSER_ICONS = [
  'pencil-line',
  'highlighter',
  'message-circle',
] as const;

export function SocialReadingVisual() {
  const { t } = useI18n();

  return (
    <figure className="landing-hero-visual relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="relative aspect-[4/5] min-h-[22rem] overflow-hidden rounded-3xl shadow-[var(--shadow-3)] sm:min-h-[26rem]">
        <img
          src={SOCIAL_IMAGE_SRC}
          alt={t('landing.social.visual.alt')}
          className="absolute inset-0 h-full w-full object-cover"
          width={1086}
          height={1448}
          decoding="async"
          loading="lazy"
        />
        <div
          className="landing-hero-visual__scrim pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {FLOATING_COMMENTS.map((comment) => (
            <p
              key={comment.key}
              className={`landing-hero-comment absolute text-pretty text-sm leading-snug text-ink ${comment.className}`}
            >
              {t(comment.key)}
            </p>
          ))}
        </div>
        <div
          className="landing-hero-composer pointer-events-none absolute inset-x-4 bottom-4"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-night-fg/10 bg-night/90 px-4 py-3 text-night-fg shadow-[var(--shadow-2)] backdrop-blur-sm">
            <p className="min-w-0 flex-1 truncate text-sm text-night-fg/70">
              {t('landing.social.composer.placeholder')}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {COMPOSER_ICONS.map((name) => (
                <span
                  key={name}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-night-fg/55"
                >
                  <Icon name={name} size={16} aria-hidden />
                </span>
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brick text-[color:var(--accent-fg)]">
                <Icon name="send" size={16} aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
