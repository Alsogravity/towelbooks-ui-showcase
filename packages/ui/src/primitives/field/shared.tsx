import { type ChangeEvent, type ForwardedRef, type ReactNode } from 'react';

interface CharacterCountProps {
  currentLength: number;
  maxLength: number;
  showCharacterCounter?: boolean;
}

export function stringLength(value: unknown) {
  return typeof value === 'string' ? value.length : 0;
}

export function mergeAriaIds(...values: Array<string | undefined>) {
  const ids = values.filter(Boolean);

  return ids.length > 0 ? ids.join(' ') : undefined;
}

export function changeEventFor<
  T extends HTMLInputElement | HTMLTextAreaElement,
>(target: T) {
  return {
    currentTarget: target,
    target,
  } as ChangeEvent<T>;
}

export function resolveFloatingFieldState({
  floatingLabel,
  floatingLabelText,
  placeholder,
  resolvedValue,
}: {
  floatingLabel: boolean;
  floatingLabelText?: string;
  placeholder?: string;
  resolvedValue?: string | number | readonly string[];
}) {
  const floatingText = floatingLabelText ?? placeholder;
  const hasFloatingLabel = floatingLabel && Boolean(floatingText);
  const usesDistinctPlaceholder =
    hasFloatingLabel &&
    Boolean(floatingLabelText) &&
    Boolean(placeholder) &&
    floatingLabelText !== placeholder;
  const hasControlledFloatingValue =
    hasFloatingLabel &&
    typeof resolvedValue === 'string' &&
    resolvedValue.length > 0;

  return {
    floatingText,
    hasControlledFloatingValue,
    hasFloatingLabel,
    usesDistinctPlaceholder,
  };
}

export function resolveActiveInputPlaceholder({
  hasFloatingLabel,
  hasValue,
  isFocused,
  placeholder,
  usesDistinctPlaceholder,
}: {
  hasFloatingLabel: boolean;
  hasValue: boolean;
  isFocused: boolean;
  placeholder?: string;
  usesDistinctPlaceholder: boolean;
}) {
  if (!hasFloatingLabel) {
    return placeholder;
  }

  if (usesDistinctPlaceholder) {
    return isFocused && !hasValue ? placeholder : ' ';
  }

  return ' ';
}

function shouldRenderCharacterCounter({
  currentLength,
  maxLength,
  showCharacterCounter,
}: CharacterCountProps) {
  if (!Number.isFinite(maxLength) || maxLength <= 0) {
    return false;
  }

  return showCharacterCounter === true || currentLength >= maxLength;
}

export function CharacterCounter({
  currentLength,
  maxLength,
  showCharacterCounter,
}: CharacterCountProps) {
  if (
    !shouldRenderCharacterCounter({
      currentLength,
      maxLength,
      showCharacterCounter,
    })
  ) {
    return null;
  }

  return (
    <span className="vui-field__counter" aria-live="polite">
      {currentLength}/{maxLength}
    </span>
  );
}

interface FieldFooterProps {
  currentLength: number;
  error?: ReactNode;
  errorId?: string;
  hint?: ReactNode;
  hintId?: string;
  maxLength?: number;
  showCharacterCounter?: boolean;
}

export function FieldFooter({
  currentLength,
  error,
  errorId,
  hint,
  hintId,
  maxLength,
  showCharacterCounter,
}: FieldFooterProps) {
  const message = error ?? hint;

  if (!message && typeof maxLength !== 'number') {
    return null;
  }

  return (
    <div className="vui-field-footer">
      {error ? (
        <span id={errorId} className="vui-field-footer__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="vui-field-footer__hint">
          {hint}
        </span>
      ) : null}
      {typeof maxLength === 'number' && (
        <CharacterCounter
          currentLength={currentLength}
          maxLength={maxLength}
          showCharacterCounter={showCharacterCounter}
        />
      )}
    </div>
  );
}

export function assignForwardedRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}
