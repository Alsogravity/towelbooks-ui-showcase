import { Switch } from '@towelbooks/ui';
import { useEffect, useRef, useState } from 'react';

import {
  settingsDescriptionClassName,
  settingsRowLabelClassName,
} from './settingsTypography';

import type { ReactNode } from 'react';

type SettingsSwitchProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void | PromiseLike<unknown>;
  label: ReactNode;
  labelAccessory?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  loadingLabel?: string;
};

/**
 * Checkbox styled as a switch; only the switch control toggles, while text stays informational.
 */
function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

export function SettingsSwitch({
  id,
  checked,
  onChange,
  label,
  labelAccessory,
  description,
  disabled = false,
  loadingLabel,
}: SettingsSwitchProps) {
  const [isPending, setIsPending] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleCheckedChange = (nextChecked: boolean) => {
    let result: ReturnType<typeof onChange>;

    try {
      result = onChange(nextChecked);
    } catch {
      return;
    }

    if (!isPromiseLike(result)) {
      return;
    }

    setIsPending(true);
    void result.then(
      () => {
        if (isMountedRef.current) {
          setIsPending(false);
        }
      },
      () => {
        if (isMountedRef.current) {
          setIsPending(false);
        }
      },
    );
  };
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div
      aria-busy={isPending || undefined}
      className="flex flex-row items-center justify-between gap-3 py-4 sm:gap-6"
    >
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex min-w-0 items-center gap-1">
          <span id={labelId} className={settingsRowLabelClassName}>
            {label}
          </span>
          {labelAccessory ? (
            <span className="shrink-0">{labelAccessory}</span>
          ) : null}
        </span>
        {description && (
          <span
            id={descriptionId}
            className={`block ${settingsDescriptionClassName}`}
          >
            {description}
          </span>
        )}
      </span>
      <div className="shrink-0">
        <Switch
          id={id}
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          checked={checked}
          disabled={disabled}
          isLoading={isPending}
          loadingLabel={loadingLabel}
          onCheckedChange={handleCheckedChange}
        />
      </div>
    </div>
  );
}
