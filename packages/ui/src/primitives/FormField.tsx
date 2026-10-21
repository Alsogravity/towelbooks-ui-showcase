import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { classNames } from '../className';
import { Input, Select, Textarea } from './Field';

import type { InputProps, SelectProps, TextareaProps } from './Field';

export interface FormFieldProps {
  children: ReactNode;
  error?: string;
  hideLabel?: boolean;
  hint?: string;
  htmlFor?: string;
  label: string;
}

export interface FormFieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

type StandardFormControlFieldProps = {
  error?: string;
  floatingLabel?: boolean;
  hideLabel?: boolean;
  hint?: string;
  id: string;
  label: string;
  placeholder?: string;
};

export type FormTextFieldProps = Omit<
  InputProps,
  'error' | 'floatingLabel' | 'hint' | 'id' | 'placeholder'
> &
  StandardFormControlFieldProps;

export type FormTextareaFieldProps = Omit<
  TextareaProps,
  'error' | 'floatingLabel' | 'hint' | 'id' | 'placeholder'
> &
  StandardFormControlFieldProps;

export type FormSelectFieldProps = Omit<
  SelectProps,
  | 'error'
  | 'floatingLabel'
  | 'floatingLabelText'
  | 'hint'
  | 'id'
  | 'placeholder'
> &
  StandardFormControlFieldProps;

interface FormFieldControlProps {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'false' | 'true';
  id?: string;
}

function mergeAriaIds(...values: Array<string | undefined>) {
  const ids = values.filter(Boolean);

  return ids.length > 0 ? ids.join(' ') : undefined;
}

export function FormFieldError({
  children,
  className = '',
  ...props
}: FormFieldErrorProps) {
  return (
    <p
      {...props}
      className={classNames('vui-form-field__error', className)}
      role="alert"
    >
      {children}
    </p>
  );
}

export function FormField({
  children,
  error,
  hideLabel = false,
  hint,
  htmlFor,
  label,
}: FormFieldProps) {
  const generatedId = useId();
  const resolvedHtmlFor =
    htmlFor ||
    (isValidElement<FormFieldControlProps>(children)
      ? children.props.id
      : undefined);
  const hintId = hint && !error ? `${generatedId}-hint` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const control = isValidElement<FormFieldControlProps>(children)
    ? cloneElement(children, {
        id: children.props.id ?? resolvedHtmlFor,
        'aria-describedby': mergeAriaIds(
          children.props['aria-describedby'],
          hintId,
          errorId,
        ),
        'aria-invalid': error ? true : children.props['aria-invalid'],
      })
    : children;

  return (
    <div className="vui-form-field">
      <label
        className={[
          'vui-form-field__label',
          hideLabel ? 'vui-form-field__label--hidden' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        htmlFor={resolvedHtmlFor}
      >
        {label}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="vui-form-field__hint">
          {hint}
        </p>
      )}
      {error && <FormFieldError id={errorId}>{error}</FormFieldError>}
    </div>
  );
}

function resolveFloatingPlaceholder(
  label: string,
  floatingLabel: boolean,
  placeholder: string | undefined,
) {
  return placeholder ?? (floatingLabel ? label : undefined);
}

export const FormTextField = forwardRef<HTMLInputElement, FormTextFieldProps>(
  (
    {
      error,
      floatingLabel = true,
      hideLabel,
      hint,
      id,
      label,
      placeholder,
      ...props
    },
    ref,
  ) => (
    <FormField
      error={error}
      hideLabel={hideLabel ?? floatingLabel}
      hint={hint}
      htmlFor={id}
      label={label}
    >
      <Input
        {...props}
        ref={ref}
        floatingLabel={floatingLabel}
        floatingLabelText={floatingLabel ? label : undefined}
        id={id}
        placeholder={resolveFloatingPlaceholder(
          label,
          floatingLabel,
          placeholder,
        )}
      />
    </FormField>
  ),
);

FormTextField.displayName = 'FormTextField';

export const FormTextareaField = forwardRef<
  HTMLTextAreaElement,
  FormTextareaFieldProps
>(
  (
    {
      error,
      floatingLabel = true,
      hideLabel,
      hint,
      id,
      label,
      placeholder,
      ...props
    },
    ref,
  ) => (
    <FormField
      error={error}
      hideLabel={hideLabel ?? floatingLabel}
      hint={hint}
      htmlFor={id}
      label={label}
    >
      <Textarea
        {...props}
        ref={ref}
        floatingLabel={floatingLabel}
        floatingLabelText={floatingLabel ? label : undefined}
        id={id}
        placeholder={resolveFloatingPlaceholder(
          label,
          floatingLabel,
          placeholder,
        )}
      />
    </FormField>
  ),
);

FormTextareaField.displayName = 'FormTextareaField';

export const FormSelectField = forwardRef<
  HTMLSelectElement,
  FormSelectFieldProps
>(
  (
    {
      error,
      floatingLabel = true,
      hideLabel,
      hint,
      id,
      label,
      placeholder,
      ...props
    },
    ref,
  ) => (
    <FormField
      error={error}
      hideLabel={hideLabel ?? floatingLabel}
      hint={hint}
      htmlFor={id}
      label={label}
    >
      <Select
        {...props}
        ref={ref}
        floatingLabel={floatingLabel}
        floatingLabelText={floatingLabel ? label : undefined}
        id={id}
        placeholder={resolveFloatingPlaceholder(
          label,
          floatingLabel,
          placeholder,
        )}
      />
    </FormField>
  ),
);

FormSelectField.displayName = 'FormSelectField';
