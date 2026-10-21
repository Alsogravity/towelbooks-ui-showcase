import { cloneElement, isValidElement, type ReactNode } from 'react';

import { AppControlRow } from '../../../components/application';

function mergeAriaIds(...values: Array<string | undefined>) {
  const ids = values.filter(Boolean);

  return ids.length > 0 ? ids.join(' ') : undefined;
}

type SettingsSelectRowProps = {
  htmlFor: string;
  label: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  controlClassName?: string;
};

export function SettingsSelectRow({
  htmlFor,
  label,
  description,
  children,
  className = '',
  controlClassName = 'w-auto shrink-0',
}: SettingsSelectRowProps) {
  const labelId = `${htmlFor}-label`;
  const descriptionId = description ? `${htmlFor}-description` : undefined;
  const control = isValidElement<{
    'aria-describedby'?: string;
    'aria-labelledby'?: string;
    variant?: 'default' | 'ghost';
  }>(children)
    ? cloneElement(children, {
        'aria-describedby': mergeAriaIds(
          children.props['aria-describedby'],
          descriptionId,
        ),
        'aria-labelledby': mergeAriaIds(
          children.props['aria-labelledby'],
          labelId,
        ),
        variant: children.props.variant ?? 'ghost',
      })
    : children;

  return (
    <AppControlRow
      className={className}
      control={control}
      controlClassName={controlClassName}
      description={description}
      descriptionId={descriptionId}
      label={label}
      labelId={labelId}
      mobileLayout="inline"
    />
  );
}
