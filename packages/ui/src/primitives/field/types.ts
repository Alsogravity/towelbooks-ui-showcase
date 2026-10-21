import type { IconName } from '../Icon';
import type { MenuOverlayPlacement } from '../MenuOverlay';
import type {
  InputHTMLAttributes,
  MouseEvent,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export interface InputActionButtonProps {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  pressed?: boolean;
  title?: string;
}

export interface TextFieldProps {
  controlAccessory?: ReactNode;
  error?: ReactNode;
  floatingLabel?: boolean;
  floatingLabelText?: string;
  hint?: ReactNode;
  maxLength?: number;
  showCharacterCounter?: boolean;
  variant?: 'default' | 'underlined';
}

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'maxLength'>,
    TextFieldProps {
  appendButton?: InputActionButtonProps;
  clearable?: boolean;
  clearButtonLabel?: string;
  prependIcon?: IconName;
}

export interface TextareaProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'maxLength'>,
    TextFieldProps {
  controlClassName?: string;
  wrapperClassName?: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  floatingLabel?: boolean;
  floatingLabelText?: string;
  listboxClassName?: string;
  matchActivatorWidth?: boolean;
  placement?: MenuOverlayPlacement;
  placeholder?: string;
  prependIcon?: IconName;
  variant?: 'default' | 'ghost';
}
