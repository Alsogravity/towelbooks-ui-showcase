import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from 'react';

import { syncComposerTextareaHeight } from './composerTextareaHeight';
import {
  changeEventFor,
  FieldFooter,
  mergeAriaIds,
  resolveFloatingFieldState,
  resolveActiveInputPlaceholder,
  stringLength,
} from './shared';
import { classNames } from '../../className';

import type { TextareaProps } from './types';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      className = '',
      controlAccessory,
      controlClassName,
      defaultValue,
      error,
      floatingLabel = false,
      floatingLabelText,
      hint,
      maxLength,
      onChange,
      onFocus,
      onBlur,
      showCharacterCounter,
      value,
      variant = 'default',
      placeholder,
      rows,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const composerMinRows = rows ?? 3;
    const hasControlAccessory = controlAccessory != null;
    const [currentLength, setCurrentLength] = useState(() =>
      stringLength(value ?? defaultValue),
    );
    const hintId = hint && !error ? `${generatedId}-hint` : undefined;
    const errorId = error ? `${generatedId}-error` : undefined;

    const syncComposerHeight = useCallback(
      (element: HTMLTextAreaElement | null) => {
        if (!hasControlAccessory || !element) {
          return;
        }

        syncComposerTextareaHeight(element, composerMinRows);
      },
      [composerMinRows, hasControlAccessory],
    );

    const setTextareaRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      setCurrentLength(stringLength(value ?? defaultValue));
    }, [defaultValue, value]);

    useLayoutEffect(() => {
      syncComposerHeight(textareaRef.current);
    }, [defaultValue, syncComposerHeight, value]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        const target = event.currentTarget;

        setCurrentLength(target.value.length);
        onChange?.(changeEventFor(target));
        syncComposerHeight(target);
      },
      [onChange, syncComposerHeight],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const resolvedValue = value ?? defaultValue;
    const { floatingText, hasFloatingLabel, usesDistinctPlaceholder } =
      resolveFloatingFieldState({
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

    const textareaElement = (
      <textarea
        {...props}
        rows={rows}
        ref={controlAccessory ? setTextareaRef : ref}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        aria-describedby={mergeAriaIds(ariaDescribedBy, hintId, errorId)}
        aria-invalid={error ? true : props['aria-invalid']}
        placeholder={inputPlaceholder}
        className={classNames(
          'vui-field',
          !!controlAccessory && 'vui-field--composer',
          variant !== 'default' && `vui-field--${variant}`,
          hasFloatingLabel && 'vui-field--has-label',
          className,
        )}
      />
    );

    return (
      <span className={classNames('vui-field-wrapper', wrapperClassName)}>
        <span
          className={classNames(
            'vui-field__control',
            hasFloatingLabel && 'vui-field__control--floating-textarea',
            controlClassName,
          )}
        >
          {controlAccessory ? (
            <span
              className={classNames(
                'vui-field-composer',
                variant !== 'default' && `vui-field-composer--${variant}`,
              )}
            >
              <span className="vui-field-composer__body">
                {textareaElement}
                {hasFloatingLabel && floatingText ? (
                  <span className="vui-field__label">{floatingText}</span>
                ) : null}
              </span>
              <div className="vui-field-composer__toolbar">
                <div className="vui-field__accessory">{controlAccessory}</div>
              </div>
            </span>
          ) : (
            <>
              {textareaElement}
              {hasFloatingLabel && floatingText ? (
                <span className="vui-field__label">{floatingText}</span>
              ) : null}
            </>
          )}
        </span>
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

Textarea.displayName = 'Textarea';
