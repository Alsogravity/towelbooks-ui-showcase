import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

import { Icon, type IconName } from './Icon';

const breakpointMediaQueries: Record<string, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

function parseResponsiveDisplay(value: string): {
  mode: string;
  breakpoints: [string, string][];
} {
  const parts = value.trim().split(/\s+/);
  const mode = parts[0];
  const breakpoints: [string, string][] = [];

  for (let i = 1; i < parts.length; i++) {
    const match = parts[i].match(/^(.+?):(.+)$/);
    if (match) {
      breakpoints.push([match[1], match[2]]);
    }
  }

  return { mode, breakpoints };
}

function getResponsiveValue(parsed: {
  mode: string;
  breakpoints: [string, string][];
}) {
  let current = parsed.mode;

  for (const [bp, value] of parsed.breakpoints) {
    const mq = breakpointMediaQueries[bp];
    if (
      mq &&
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(mq).matches
    ) {
      current = value;
    }
  }

  return current;
}

function subscribeToBreakpoints(
  breakpoints: [string, string][],
  callback: () => void,
) {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => undefined;
  }

  const listeners = breakpoints
    .map(([bp]) => {
      const mq = breakpointMediaQueries[bp];
      if (!mq) return null;
      const mql = window.matchMedia(mq);
      mql.addEventListener('change', callback);
      return mql;
    })
    .filter(Boolean);

  return () => {
    listeners.forEach((mql) => mql!.removeEventListener('change', callback));
  };
}

const segmentedControlContainerClassName =
  'inline-flex items-center gap-1 rounded-[18px] border border-rule bg-paper-2/80 p-1';

const segmentedControlSegmentBaseClassName = [
  'flex items-center justify-center rounded-[14px] text-ink-3 transition-colors',
  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brick',
  'hover:bg-paper hover:text-ink',
].join(' ');

const segmentedControlSelectedSurfaceClassName =
  'peer-checked:bg-paper peer-checked:shadow-2';

const segmentedControlSelectionToneClassName = {
  primary: 'peer-checked:font-semibold peer-checked:text-brick',
  surface: 'peer-checked:text-ink',
} as const;

export type SegmentedControlSelectionTone =
  keyof typeof segmentedControlSelectionToneClassName;

const segmentedControlSegmentSizeClassName = {
  content: 'h-11 whitespace-nowrap px-4 text-sm',
  icon: 'h-11 w-11',
} as const;

export type SegmentedControlSegmentSize =
  keyof typeof segmentedControlSegmentSizeClassName;

export type SegmentedControlDisplayMode =
  'icon-label' | 'icon-only' | 'label-only' | 'icon-active-label';

export type SegmentedControlOption<T extends string = string> = {
  ariaLabel: string;
  content?: ReactNode;
  icon?: IconName;
  label?: string;
  title?: string;
  value: T;
};

export type SegmentedControlProps<T extends string = string> = {
  ariaLabel: string;
  className?: string;
  iconSize?: number;
  name: string;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  segmentSize?: SegmentedControlSegmentSize;
  selectionTone?: SegmentedControlSelectionTone;
  segmentDisplay?:
    SegmentedControlDisplayMode | `${SegmentedControlDisplayMode} ${string}`;
  value: T;
};

export function SegmentedControl<T extends string = string>({
  ariaLabel,
  className = '',
  iconSize = 17,
  name,
  onChange,
  options,
  segmentSize = 'icon',
  selectionTone = 'surface',
  segmentDisplay = 'icon-label',
  value,
}: SegmentedControlProps<T>) {
  const parsed = useMemo(
    () =>
      segmentDisplay && /\s/.test(segmentDisplay)
        ? parseResponsiveDisplay(segmentDisplay)
        : null,
    [segmentDisplay],
  );

  const getSnapshot = useCallback(
    () =>
      parsed ? getResponsiveValue(parsed) : (segmentDisplay ?? 'icon-label'),
    [parsed, segmentDisplay],
  );

  const resolvedDisplay = useSyncExternalStore(
    useCallback(
      (cb: () => void) =>
        parsed
          ? subscribeToBreakpoints(parsed.breakpoints, cb)
          : () => undefined,
      [parsed],
    ),
    getSnapshot,
    () => segmentDisplay ?? 'icon-label',
  ) as SegmentedControlDisplayMode;

  const isIconActiveLabel = resolvedDisplay === 'icon-active-label';

  return (
    <fieldset aria-label={ariaLabel} className={className}>
      <div
        className={[
          segmentedControlContainerClassName,
          isIconActiveLabel ? 'transition-[width] duration-500 ease-out' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <label
              key={option.value}
              className="relative block cursor-pointer"
              title={option.title}
            >
              <input
                aria-label={option.ariaLabel}
                checked={isActive}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                name={name}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              <span
                className={[
                  segmentedControlSegmentBaseClassName,
                  segmentedControlSelectedSurfaceClassName,
                  segmentedControlSelectionToneClassName[selectionTone],
                  segmentedControlSegmentSizeClassName[segmentSize],
                ].join(' ')}
              >
                {resolvedDisplay === 'icon-label' || !resolvedDisplay ? (
                  (option.content ?? (
                    <>
                      {option.icon ? (
                        <Icon
                          name={option.icon}
                          size={iconSize}
                          strokeWidth={1.7}
                          className="text-inherit shrink-0"
                        />
                      ) : null}
                      {option.label ? (
                        <span className="ml-2">{option.label}</span>
                      ) : null}
                    </>
                  ))
                ) : (
                  <>
                    {resolvedDisplay === 'label-only' ? null : (
                      <Icon
                        name={option.icon!}
                        size={iconSize}
                        strokeWidth={1.7}
                        className="text-inherit shrink-0"
                      />
                    )}
                    {resolvedDisplay === 'icon-active-label' ? (
                      <span
                        className={[
                          'grid transition-all ease-out',
                          isActive
                            ? 'duration-400 grid-cols-[1fr] opacity-100'
                            : 'duration-200 grid-cols-[0fr] opacity-0',
                        ].join(' ')}
                      >
                        <span className="overflow-hidden ml-2 whitespace-nowrap">
                          {option.label}
                        </span>
                      </span>
                    ) : resolvedDisplay === 'icon-only' ? null : (
                      <span>{option.label}</span>
                    )}
                  </>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
