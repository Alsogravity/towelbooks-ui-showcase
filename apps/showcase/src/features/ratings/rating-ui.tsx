import { Link } from 'react-router';

import { getProfilePath } from '../../app/profileRoutes';
import { Card, Icon } from '../../components/primitives';

import type { Rating } from '@towelbooks/schemas';
import type { ReactNode } from 'react';

const INACTIVE_STAR_CLASS_NAME =
  'text-[color-mix(in_srgb,var(--gold-soft)_55%,var(--ink-4))]';
const ACTIVE_STAR_CLASS_NAMES = [
  'text-[color-mix(in_srgb,var(--gold)_45%,var(--gold-soft))]',
  'text-[color-mix(in_srgb,var(--gold)_58%,var(--gold-soft))]',
  'text-[color-mix(in_srgb,var(--gold)_72%,var(--gold-soft))]',
  'text-[color-mix(in_srgb,var(--gold)_86%,var(--gold-soft))]',
  'text-gold',
] as const;

export function getRatingStarClassName(
  index: number,
  isActive: boolean,
): string {
  return isActive ? ACTIVE_STAR_CLASS_NAMES[index] : INACTIVE_STAR_CLASS_NAME;
}

export function RatingCard({
  actions,
  formatDate,
  ratingLabel,
  rating,
}: {
  actions?: ReactNode;
  formatDate: (value: string | Date) => string;
  ratingLabel: string;
  rating: Rating;
}) {
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Link
            className="font-medium text-brick hover:text-brick-2 hover:underline"
            to={getProfilePath({ username: rating.author.username })}
          >
            @{rating.author.username}
          </Link>
          <p className="text-xs text-ink-4">{formatDate(rating.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <RatingStars label={ratingLabel} rating={rating.rating} size={14} />
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
      {rating.note ? (
        <p className="text-sm leading-6 text-ink-2">{rating.note}</p>
      ) : null}
    </Card>
  );
}

function RatingStars({
  label,
  rating,
  size,
}: {
  label: string;
  rating: number;
  size: number;
}) {
  return (
    <div aria-label={label} className="flex items-center gap-1" role="img">
      {Array.from({ length: 5 }, (_, index) => {
        const isActive = rating >= index + 1;

        return (
          <Icon
            key={index}
            className={[
              getRatingStarClassName(index, isActive),
              isActive ? 'fill-current' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            name="star"
            size={size}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}
