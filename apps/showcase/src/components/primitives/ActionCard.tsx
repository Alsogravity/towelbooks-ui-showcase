import {
  buttonClassName,
  type ButtonVariant,
  Icon,
  type IconName,
} from '@towelbooks/ui';
import { type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

import { Card } from './Card';

export interface ActionCardProps {
  buttonLabel: string;
  buttonVariant?: Extract<ButtonVariant, 'primary' | 'secondary'>;
  buttonIcon?: IconName;
  description: string;
  illustration: ReactNode;
  title?: string;
  to: LinkProps['to'];
  bleed?: boolean;
}

export function ActionCard({
  buttonLabel,
  buttonVariant = 'primary',
  buttonIcon,
  description,
  illustration,
  title,
  to,
  bleed = false,
}: ActionCardProps) {
  const content = (
    <>
      <div className="flex flex-1 flex-col gap-1.5">
        {title ? (
          <h3 className="app-text-card-title text-ink">{title}</h3>
        ) : null}
        <p className="app-text-supporting-copy text-ink-2">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className={buttonClassName({
          className: [
            'w-full justify-center',
            buttonIcon ? 'vui-button--prepend-icon-default' : '',
          ]
            .filter(Boolean)
            .join(' '),
          size: 'sm',
          variant: buttonVariant,
        })}
      >
        {buttonIcon ? (
          <Icon name={buttonIcon} size={20} className="vui-button__icon" />
        ) : null}
        <span className="vui-button__label">{buttonLabel}</span>
      </span>
    </>
  );

  return (
    <Card
      interactive
      padding={false}
      className="flex h-full flex-col overflow-hidden"
    >
      <Link
        to={to}
        className={
          bleed
            ? 'flex h-full flex-col no-underline focus-visible:outline-none'
            : 'flex h-full flex-col gap-4 p-4 no-underline focus-visible:outline-none'
        }
      >
        <div
          className={
            bleed
              ? 'vui-illustration-surface aspect-[4/3] w-full overflow-hidden'
              : 'vui-illustration-surface aspect-[4/3] w-full overflow-hidden rounded-md'
          }
        >
          {illustration}
        </div>
        {bleed ? (
          <div className="flex flex-1 flex-col gap-4 p-4">{content}</div>
        ) : (
          content
        )}
      </Link>
    </Card>
  );
}
