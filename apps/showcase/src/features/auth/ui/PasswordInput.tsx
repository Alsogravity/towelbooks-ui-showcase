import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';

import { Icon, Input } from '../../../components/primitives';

interface PasswordInputProps extends Omit<
  ComponentPropsWithoutRef<typeof Input>,
  'type'
> {
  hidePasswordLabel: string;
  showPasswordLabel: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', hidePasswordLabel, showPasswordLabel, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const toggleLabel = isPasswordVisible
      ? hidePasswordLabel
      : showPasswordLabel;

    return (
      <Input
        {...props}
        ref={ref}
        appendButton={{
          ariaLabel: toggleLabel,
          children: (
            <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={18} />
          ),
          className: 'text-ink-3 opacity-70 hover:text-ink hover:opacity-100',
          onClick: () => setIsPasswordVisible((currentValue) => !currentValue),
          pressed: isPasswordVisible,
          title: toggleLabel,
        }}
        className={className}
        type={isPasswordVisible ? 'text' : 'password'}
      />
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
