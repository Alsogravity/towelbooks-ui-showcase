import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { classNames } from '../className';
import { Icon, type IconName } from './Icon';

type FormLayoutProps = ComponentPropsWithoutRef<'div'>;

export type FormGridColumns = 'responsive-2';

export interface FormGridProps extends FormLayoutProps {
  columns?: FormGridColumns;
}

export type FormActionsAlign = 'start' | 'end' | 'between';

export interface FormActionsProps extends FormLayoutProps {
  align?: FormActionsAlign;
}

export function FormStack({ className = '', ...props }: FormLayoutProps) {
  return <div className={classNames('vui-form-stack', className)} {...props} />;
}

export function FormRows({ className = '', ...props }: FormLayoutProps) {
  return <div className={classNames('vui-form-rows', className)} {...props} />;
}

export function FormGrid({
  className = '',
  columns = 'responsive-2',
  ...props
}: FormGridProps) {
  return (
    <div
      className={classNames(
        'vui-form-grid',
        `vui-form-grid--${columns}`,
        className,
      )}
      {...props}
    />
  );
}

export function FormActions({
  align = 'end',
  className = '',
  ...props
}: FormActionsProps) {
  return (
    <div
      className={classNames(
        'vui-form-actions',
        `vui-form-actions--${align}`,
        className,
      )}
      {...props}
    />
  );
}

export type FieldSetProps = ComponentPropsWithoutRef<'fieldset'>;

export function FieldSet({ className = '', ...props }: FieldSetProps) {
  return (
    <fieldset className={classNames('vui-field-set', className)} {...props} />
  );
}

export type FieldLegendProps = ComponentPropsWithoutRef<'legend'>;

export function FieldLegend({ className = '', ...props }: FieldLegendProps) {
  return (
    <legend className={classNames('vui-field-legend', className)} {...props} />
  );
}

export interface FormSectionProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  icon?: IconName;
  title?: ReactNode;
  titleClassName?: string;
  titleId?: string;
  withDivider?: boolean;
}

export function FormSection({
  children,
  className = '',
  contentClassName = '',
  description,
  icon,
  title,
  titleClassName = '',
  titleId,
  withDivider = false,
}: FormSectionProps) {
  return (
    <div className={classNames('vui-form-section', className)}>
      {title ? (
        <div className="vui-form-section__header">
          <div className="vui-form-section__title-row">
            {icon ? (
              <span className="vui-form-section__icon" aria-hidden="true">
                <Icon name={icon} />
              </span>
            ) : null}
            <p
              className={classNames('vui-form-section__title', titleClassName)}
              id={titleId}
            >
              {title}
            </p>
            {withDivider ? (
              <span className="vui-form-section__divider" aria-hidden="true" />
            ) : null}
          </div>
          {description ? (
            <div className="vui-form-section__description">{description}</div>
          ) : null}
        </div>
      ) : null}
      <div
        className={classNames('vui-form-section__content', contentClassName)}
      >
        {children}
      </div>
    </div>
  );
}
