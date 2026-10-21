import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SelectHTMLAttributes,
} from 'react';

import { classNames } from '../../className';
import { Icon } from '../Icon';
import { MenuOverlay } from '../MenuOverlay';
import {
  collectSelectOptions,
  initialSelectValue,
  lastEnabledOptionIndex,
  nextEnabledIndex,
  selectValueFromProp,
  type SelectOptionItem,
} from './select-options';
import { assignForwardedRef } from './shared';

import type { SelectProps } from './types';

function selectChangeEventFor(select: HTMLSelectElement) {
  return {
    currentTarget: select,
    target: select,
  } as ChangeEvent<HTMLSelectElement>;
}

const OverlaySelect = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-required': ariaRequired,
      children,
      className = '',
      defaultValue,
      disabled,
      floatingLabel = false,
      floatingLabelText,
      id,
      listboxClassName,
      matchActivatorWidth = true,
      name,
      onChange,
      placeholder,
      placement = 'bottom-start',
      prependIcon,
      required,
      title,
      value,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const optionBaseId = `${generatedId}-select`;
    const triggerId = id ?? `${generatedId}-trigger`;
    const nativeId = id ? `${id}-native` : undefined;
    const listboxId = `${triggerId}-listbox`;
    const options = useMemo(
      () => collectSelectOptions(children, optionBaseId),
      [children, optionBaseId],
    );
    const isControlled = value !== undefined;
    const isRequired =
      required || ariaRequired === true || ariaRequired === 'true';
    const [selectedValue, setSelectedValue] = useState(() =>
      initialSelectValue(options, value, defaultValue, isRequired),
    );
    const currentValue = selectValueFromProp(value) ?? selectedValue;
    const selectedOption = options.find(
      (option) => option.value === currentValue,
    );
    const nativeSelectRef = useRef<HTMLSelectElement | null>(null);
    const changeHandledRef = useRef(false);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const shouldScrollActiveOptionRef = useRef(false);

    const setNativeSelectRef = useCallback(
      (node: HTMLSelectElement | null) => {
        nativeSelectRef.current = node;
        assignForwardedRef(ref, node);
      },
      [ref],
    );

    useEffect(() => {
      if (isControlled) {
        return;
      }

      if (!options.some((option) => option.value === selectedValue)) {
        setSelectedValue(
          initialSelectValue(options, undefined, defaultValue, isRequired),
        );
      }
    }, [defaultValue, isControlled, isRequired, options, selectedValue]);

    useEffect(() => {
      if (!open) {
        if (activeIndex !== -1) {
          setActiveIndex(-1);
        }
        shouldScrollActiveOptionRef.current = false;
        return;
      }

      if (activeIndex >= 0) {
        return;
      }

      const selectedIndex = options.findIndex(
        (option) => option.value === currentValue,
      );
      const firstEnabled = options.find((option) => !option.disabled);
      setActiveIndex(
        selectedIndex >= 0
          ? selectedIndex
          : firstEnabled
            ? options.indexOf(firstEnabled)
            : -1,
      );
    }, [activeIndex, currentValue, open, options]);

    useEffect(() => {
      if (!open || activeIndex < 0 || !shouldScrollActiveOptionRef.current) {
        return;
      }

      shouldScrollActiveOptionRef.current = false;

      const activeElement =
        nativeSelectRef.current?.ownerDocument.getElementById(
          options[activeIndex]?.id ?? '',
        );

      activeElement?.scrollIntoView?.({ block: 'nearest' });
    }, [activeIndex, open, options]);

    useEffect(() => {
      const select = nativeSelectRef.current;
      const form = select?.form;

      if (!form || isControlled) {
        return;
      }

      const handleReset = () => {
        window.requestAnimationFrame(() => {
          setSelectedValue(
            initialSelectValue(options, undefined, defaultValue, isRequired),
          );
        });
      };

      form.addEventListener('reset', handleReset);
      return () => form.removeEventListener('reset', handleReset);
    }, [defaultValue, isControlled, isRequired, options]);

    const handleNativeChange = useCallback(
      (event: ChangeEvent<HTMLSelectElement>) => {
        changeHandledRef.current = true;

        if (!isControlled) {
          setSelectedValue(event.currentTarget.value);
        }

        onChange?.(event);
      },
      [isControlled, onChange],
    );

    const commitValue = useCallback(
      (nextValue: string) => {
        const select = nativeSelectRef.current;

        if (!select || nextValue === currentValue) {
          return;
        }

        if (!isControlled) {
          setSelectedValue(nextValue);
        }

        changeHandledRef.current = false;
        select.value = nextValue;
        select.dispatchEvent(new Event('change', { bubbles: true }));

        if (!changeHandledRef.current) {
          onChange?.(selectChangeEventFor(select));
        }
      },
      [currentValue, isControlled, onChange],
    );

    const selectOption = useCallback(
      (option: SelectOptionItem) => {
        if (disabled || option.disabled) {
          return;
        }

        commitValue(option.value);
        setOpen(false);
      },
      [commitValue, disabled],
    );

    const handleTriggerKeyDown = useCallback(
      (
        event: KeyboardEvent<HTMLElement>,
        overlayKeyDown: (event: KeyboardEvent<HTMLElement>) => void,
      ) => {
        if (disabled) {
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const selectedIndex = options.findIndex(
            (option) => option.value === currentValue,
          );
          setOpen(true);
          shouldScrollActiveOptionRef.current = true;
          setActiveIndex(() =>
            nextEnabledIndex(
              options,
              selectedIndex >= 0 ? selectedIndex : -1,
              1,
            ),
          );
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const selectedIndex = options.findIndex(
            (option) => option.value === currentValue,
          );
          setOpen(true);
          shouldScrollActiveOptionRef.current = true;
          setActiveIndex(() =>
            nextEnabledIndex(
              options,
              selectedIndex >= 0 ? selectedIndex : options.length,
              -1,
            ),
          );
          return;
        }

        overlayKeyDown(event);
      },
      [currentValue, disabled, options],
    );

    const handleListboxKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          shouldScrollActiveOptionRef.current = true;
          setActiveIndex((current) => nextEnabledIndex(options, current, 1));
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          shouldScrollActiveOptionRef.current = true;
          setActiveIndex((current) =>
            nextEnabledIndex(
              options,
              current < 0 ? options.length : current,
              -1,
            ),
          );
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          shouldScrollActiveOptionRef.current = true;
          setActiveIndex(options.findIndex((option) => !option.disabled));
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          shouldScrollActiveOptionRef.current = true;
          setActiveIndex(lastEnabledOptionIndex(options));
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const activeOption = options[activeIndex];
          if (activeOption) {
            selectOption(activeOption);
          }
          return;
        }

        if (event.key === 'Tab') {
          setOpen(false);
        }
      },
      [activeIndex, options, selectOption],
    );

    const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;
    const effectivePrependIcon = prependIcon ?? selectedOption?.icon;

    const isGhost = variant === 'ghost';
    const floatingText = floatingLabelText ?? placeholder;
    const hasFloatingLabel = floatingLabel && Boolean(floatingText);
    const hasSelectedValue = currentValue !== '';
    const labelFloating = hasFloatingLabel && (open || hasSelectedValue);

    return (
      <span
        className={classNames('vui-select', isGhost && 'vui-select--ghost')}
      >
        <select
          {...props}
          ref={setNativeSelectRef}
          id={nativeId}
          name={name}
          value={currentValue}
          disabled={disabled}
          required={required}
          aria-hidden="true"
          aria-required={ariaRequired}
          className="vui-select__native"
          tabIndex={-1}
          onChange={handleNativeChange}
        >
          <option value="" hidden aria-hidden="true" />
          {children}
        </select>
        <MenuOverlay
          open={open}
          onOpenChange={setOpen}
          portalled
          activator={({ activatorProps, ref: activatorRef }) => (
            <span className="vui-field__control">
              <button
                ref={activatorRef}
                id={triggerId}
                type="button"
                role="combobox"
                className={classNames(
                  'vui-field',
                  'vui-select__trigger',
                  isGhost && 'vui-select__trigger--ghost',
                  hasFloatingLabel && 'vui-field--has-label',
                  labelFloating && 'vui-field--label-floating',
                  className,
                )}
                disabled={disabled}
                title={title}
                aria-controls={activatorProps['aria-controls']}
                aria-describedby={ariaDescribedBy}
                aria-disabled={disabled}
                aria-expanded={activatorProps['aria-expanded']}
                aria-haspopup="listbox"
                aria-invalid={ariaInvalid}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-required={ariaRequired ?? required}
                aria-activedescendant={open ? activeOption?.id : undefined}
                onClick={activatorProps.onClick}
                onKeyDown={(event) =>
                  handleTriggerKeyDown(event, activatorProps.onKeyDown)
                }
              >
                {hasFloatingLabel ? (
                  <span className="vui-field__label">{floatingText}</span>
                ) : null}
                <span className="vui-select__content">
                  {effectivePrependIcon && (
                    <Icon
                      name={effectivePrependIcon}
                      size={16}
                      className="vui-select__prepend-icon"
                    />
                  )}
                  <span className="vui-select__value">
                    {selectedOption?.label ?? ''}
                  </span>
                </span>
                <Icon
                  aria-hidden
                  className="vui-select__indicator"
                  name="chevron-down"
                  size={14}
                />
              </button>
            </span>
          )}
          placement={placement}
          matchActivatorWidth={matchActivatorWidth}
          popupRole="listbox"
          contentRole="listbox"
          contentId={listboxId}
          contentClassName={classNames(
            'vui-select__listbox',
            !matchActivatorWidth && 'vui-select__listbox--hug',
            listboxClassName,
          )}
          disabled={disabled}
          focusOnOpen="content"
          closeOnSelect
          contentProps={{
            'aria-activedescendant': activeOption?.id,
            'aria-labelledby': triggerId,
            onKeyDown: handleListboxKeyDown,
          }}
        >
          {options.map((option, index) => {
            const previousOption = options[index - 1];
            const showGroupLabel =
              option.groupLabel !== undefined &&
              option.groupLabel !== previousOption?.groupLabel;

            return (
              <Fragment key={option.id}>
                {showGroupLabel && (
                  <div className="vui-select__group-label" role="presentation">
                    {option.groupLabel}
                  </div>
                )}
                <div
                  id={option.id}
                  role="option"
                  className="vui-select__option"
                  aria-disabled={option.disabled}
                  aria-selected={option.value === currentValue}
                  data-active={index === activeIndex || undefined}
                  onClick={() => {
                    if (!option.disabled) {
                      selectOption(option);
                    }
                  }}
                >
                  <span className="vui-select__option-content">
                    {option.icon && (
                      <Icon
                        name={option.icon}
                        size={16}
                        className="vui-select__option-icon"
                      />
                    )}
                    {option.label}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </MenuOverlay>
      </span>
    );
  },
);

OverlaySelect.displayName = 'OverlaySelect';

const NativeSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className = '', ...props }, ref) => (
  <select ref={ref} className={classNames('vui-field', className)} {...props} />
));

NativeSelect.displayName = 'NativeSelect';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const { multiple, size } = props;

    if (multiple || (size !== undefined && size > 1)) {
      return <NativeSelect {...props} ref={ref} />;
    }

    return <OverlaySelect {...props} ref={ref} />;
  },
);

Select.displayName = 'Select';
