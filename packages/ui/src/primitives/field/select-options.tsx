import {
  Children,
  Fragment,
  isValidElement,
  type SelectHTMLAttributes,
  type ReactNode,
} from 'react';

import type { IconName } from '../Icon';

export interface SelectOptionItem {
  disabled: boolean;
  groupLabel?: ReactNode;
  icon?: IconName;
  id: string;
  label: ReactNode;
  selected: boolean;
  value: string;
}

interface OptionElementProps {
  children?: ReactNode;
  disabled?: boolean;
  icon?: IconName;
  label?: string;
  selected?: boolean;
  value?: number | string;
}

interface OptGroupElementProps {
  children?: ReactNode;
  disabled?: boolean;
  label?: ReactNode;
}

function textFromNode(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textFromNode).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textFromNode(node.props.children);
  }

  return '';
}

export function selectValueFromProp(
  value: SelectHTMLAttributes<HTMLSelectElement>['value'],
) {
  if (Array.isArray(value)) {
    return value[0] === undefined ? undefined : String(value[0]);
  }

  return value === undefined ? undefined : String(value);
}

export function collectSelectOptions(children: ReactNode, baseId: string) {
  const options: SelectOptionItem[] = [];

  function walk(
    nodes: ReactNode,
    groupLabel?: ReactNode,
    groupDisabled = false,
  ) {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) {
        return;
      }

      if (child.type === Fragment) {
        walk(
          (child.props as { children?: ReactNode }).children,
          groupLabel,
          groupDisabled,
        );
        return;
      }

      if (child.type === 'optgroup') {
        const optGroupProps = child.props as OptGroupElementProps;
        walk(
          optGroupProps.children,
          optGroupProps.label,
          groupDisabled || Boolean(optGroupProps.disabled),
        );
        return;
      }

      if (child.type !== 'option') {
        return;
      }

      const optionProps = child.props as OptionElementProps;
      const textValue = textFromNode(optionProps.children);
      const label = optionProps.children ?? optionProps.label ?? textValue;
      const value =
        optionProps.value === undefined ? textValue : String(optionProps.value);

      options.push({
        disabled: groupDisabled || Boolean(optionProps.disabled),
        groupLabel,
        icon: optionProps.icon,
        id: `${baseId}-option-${options.length}`,
        label,
        selected: Boolean(optionProps.selected),
        value,
      });
    });
  }

  walk(children);
  return options;
}

function firstEnabledOption(options: SelectOptionItem[]) {
  return options.find((option) => !option.disabled) ?? options[0];
}

export function lastEnabledOptionIndex(options: SelectOptionItem[]) {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export function initialSelectValue(
  options: SelectOptionItem[],
  value: SelectHTMLAttributes<HTMLSelectElement>['value'],
  defaultValue: SelectHTMLAttributes<HTMLSelectElement>['defaultValue'],
  required = false,
) {
  if (required && value === undefined && defaultValue === undefined) {
    return options.find((option) => option.selected)?.value ?? '';
  }

  return (
    selectValueFromProp(value) ??
    selectValueFromProp(defaultValue) ??
    options.find((option) => option.selected)?.value ??
    firstEnabledOption(options)?.value ??
    ''
  );
}

export function nextEnabledIndex(
  options: SelectOptionItem[],
  currentIndex: number,
  direction: 1 | -1,
) {
  if (options.length === 0) {
    return -1;
  }

  for (let step = 1; step <= options.length; step += 1) {
    const candidate =
      (currentIndex + step * direction + options.length) % options.length;

    if (!options[candidate]?.disabled) {
      return candidate;
    }
  }

  return currentIndex;
}
