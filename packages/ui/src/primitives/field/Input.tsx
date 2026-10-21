import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type MouseEvent,
} from 'react';

import { classNames } from '../../className';
import { Icon } from '../Icon';
import {
  assignForwardedRef,
  changeEventFor,
  FieldFooter,
  mergeAriaIds,
  resolveFloatingFieldState,
  resolveActiveInputPlaceholder,
  stringLength,
} from './shared';

import type { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      appendButton,
      className = '',
      controlAccessory,
      clearable = false,
      clearButtonLabel = 'Clear input',
      defaultValue,
      disabled = false,
      error,
      floatingLabel = false,
      floatingLabelText,
      hint,
      maxLength,
      onChange,
      prependIcon,
      readOnly = false,
      showCharacterCounter,
      value,
      variant = 'default',
      placeholder,
      role,
      type: requestedType,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [currentLength, setCurrentLength] = useState(() =>
      stringLength(value ?? defaultValue),
    );
    const hintId = hint && !error ? `${generatedId}-hint` : undefined;
    const errorId = error ? `${generatedId}-error` : undefined;

    useEffect(() => {
      setCurrentLength(stringLength(value ?? defaultValue));
    }, [defaultValue, value]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.currentTarget;

        setCurrentLength(target.value.length);
        onChange?.(changeEventFor(target));
      },
      [onChange],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        assignForwardedRef(ref, node);
      },
      [ref],
    );

    const handleActionMouseDown = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
      },
      [],
    );

    const handleClear = useCallback(() => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      input.value = '';
      setCurrentLength(0);
      onChange?.(changeEventFor(input));
      input.focus();
    }, [onChange]);

    const hasAppendButton = appendButton != null;
    const usesCustomClear = clearable === true && !hasAppendButton;
    const inputType =
      usesCustomClear && requestedType === 'search' ? 'text' : requestedType;
    const inputRole =
      usesCustomClear && requestedType === 'search' && role === undefined
        ? 'searchbox'
        : role;
    const showClearButton =
      hasAppendButton !== true &&
      clearable === true &&
      currentLength > 0 &&
      disabled !== true &&
      readOnly !== true;
    const resolvedValue = value ?? defaultValue;
    const {
      floatingText,
      hasControlledFloatingValue,
      hasFloatingLabel,
      usesDistinctPlaceholder,
    } = resolveFloatingFieldState({
      floatingLabel,
      floatingLabelText,
      placeholder,
      resolvedValue,
    });
    const hasValue = currentLength > 0;
    const inputPlaceholder = resolveActiveInputPlaceholder({
      hasFloatingLabel,
      hasValue,
      isFocused,
      placeholder,
      usesDistinctPlaceholder,
    });

    return (
      <span className="vui-field-wrapper">
        <span className="vui-field__control">
          <input
            {...props}
            ref={setInputRef}
            role={inputRole}
            type={inputType}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            maxLength={maxLength}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            readOnly={readOnly}
            aria-describedby={mergeAriaIds(ariaDescribedBy, hintId, errorId)}
            aria-invalid={error ? true : props['aria-invalid']}
            placeholder={inputPlaceholder}
            className={classNames(
              'vui-field',
              clearable && 'vui-field--clearable',
              hasAppendButton && 'vui-field--with-append-button',
              prependIcon && 'vui-field--with-prepend-icon',
              variant !== 'default' && `vui-field--${variant}`,
              hasFloatingLabel && 'vui-field--has-label',
              hasControlledFloatingValue && 'vui-field--label-floating',
              className,
            )}
          />
          {hasFloatingLabel && floatingText ? (
            <span className="vui-field__label">{floatingText}</span>
          ) : null}
          {prependIcon ? (
            <span className="vui-field__icon">
              <Icon name={prependIcon} size={16} />
            </span>
          ) : null}
          {appendButton ? (
            <button
              type="button"
              aria-label={appendButton.ariaLabel}
              aria-pressed={appendButton.pressed}
              className={classNames(
                'vui-field__append-button',
                appendButton.className,
              )}
              disabled={disabled || appendButton.disabled}
              onClick={appendButton.onClick}
              onMouseDown={handleActionMouseDown}
              title={appendButton.title}
            >
              {appendButton.children}
            </button>
          ) : null}
          {clearable && !hasAppendButton ? (
            <button
              type="button"
              aria-label={clearButtonLabel}
              aria-hidden={showClearButton ? undefined : true}
              className={classNames(
                'vui-field__clear',
                showClearButton && 'vui-field__clear--visible',
              )}
              disabled={!showClearButton}
              onClick={handleClear}
              onMouseDown={handleActionMouseDown}
            >
              <Icon name="x" size={14} />
            </button>
          ) : null}
        </span>
        {controlAccessory ? (
          <div className="vui-field__accessory">{controlAccessory}</div>
        ) : null}
        <FieldFooter
          currentLength={currentLength}
          error={error}
          errorId={errorId}
          hint={hint}
          hintId={hintId}
          maxLength={maxLength}
          showCharacterCounter={showCharacterCounter}
        />
      </span>
    );
  },
);

Input.displayName = 'Input';
