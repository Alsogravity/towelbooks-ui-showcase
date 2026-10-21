import { useEffect, type ReactNode } from 'react';

import { ButtonLink } from '../primitives';
import { useRegisterPageHeaderBackAction } from './PageHeaderBackActionContext';

interface PageHeaderProps {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  description?: ReactNode;
  leadingAction?: ReactNode;
  showDesktopBackAction?: boolean;
  title: ReactNode;
  titleClassName?: string;
}

export function PageHeader({
  actions,
  backHref,
  backLabel,
  description,
  leadingAction,
  showDesktopBackAction = true,
  title,
  titleClassName,
}: PageHeaderProps) {
  const registerPageHeaderBackAction = useRegisterPageHeaderBackAction();

  useEffect(() => {
    if (!backHref || !backLabel) {
      registerPageHeaderBackAction(null);
      return;
    }

    registerPageHeaderBackAction({
      label: backLabel,
      to: backHref,
    });

    return () => {
      registerPageHeaderBackAction(null);
    };
  }, [backHref, backLabel, registerPageHeaderBackAction]);

  const resolvedLeadingAction =
    backHref && backLabel && showDesktopBackAction ? (
      <ButtonLink
        to={backHref}
        aria-label={backLabel}
        icon="chevron-left"
        title={backLabel}
        variant="ghost"
      />
    ) : (
      leadingAction
    );

  return (
    <header className="hidden items-start justify-between gap-4 lg:flex lg:items-end">
      <div className="min-w-0 flex-1">
        <div className="hidden min-w-0 flex-1 lg:flex lg:items-center lg:gap-3">
          {resolvedLeadingAction ? (
            <div className="shrink-0">{resolvedLeadingAction}</div>
          ) : null}
          <h1
            className={`app-text-page-title min-w-0 text-ink ${titleClassName ?? ''}`}
          >
            {title}
          </h1>
        </div>
        {description ? (
          <p className="app-text-page-description mt-2 max-w-2xl text-ink-2">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="hidden shrink-0 self-start lg:flex lg:self-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
