import type { ReactNode } from 'react';

import { ButtonLink, Icon } from '../../components/primitives';

const CARD_CLASS =
  'relative flex flex-col rounded-2xl border border-ink/10 bg-white p-8 dark:bg-white/5 sm:p-10';

interface Cta {
  label: string;
  to?: string;
  disabled?: boolean;
}

interface PricingCardProps {
  icon?: ReactNode;
  price: string;
  description: string;
  features: string[];
  cta: Cta;
  badge?: string;
}

export function PricingCard({
  icon,
  price,
  description,
  features,
  cta,
  badge,
}: PricingCardProps) {
  const content = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {icon ? (
          <div className="flex items-center gap-3">
            {icon}
            <p className="app-text-stat-value font-light text-ink">{price}</p>
          </div>
        ) : (
          <p className="app-text-stat-value font-light text-ink">{price}</p>
        )}
        <p className="mt-2 text-sm text-ink-2">{description}</p>
        <ul className="mt-6 flex flex-col gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-ink-2">
              <Icon name="check" size={16} className="shrink-0 text-ink-3" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        {cta.to && !cta.disabled ? (
          <ButtonLink to={cta.to} size="lg" className="w-full justify-center">
            {cta.label}
          </ButtonLink>
        ) : (
          <div className="w-full rounded-full border border-ink/10 px-4 py-3 text-center text-sm text-ink-3">
            {cta.label}
          </div>
        )}
      </div>
    </div>
  );

  if (badge) {
    return (
      <div
        className={`${CARD_CLASS} flex flex-col relative overflow-hidden h-full`}
      >
        <div className="flex flex-col justify-between pointer-events-none select-none blur-sm h-full">
          {content}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            style={{ fontFamily: 'var(--font-hand)' }}
            className="-rotate-6 rounded-full bg-[#fbf6e9] px-8 py-3 text-app-section-title leading-tight text-[color:var(--hand)] shadow-[var(--shadow-2)]"
          >
            {badge}
          </span>
        </div>
      </div>
    );
  }

  return <div className={`${CARD_CLASS} flex flex-col h-full`}>{content}</div>;
}
