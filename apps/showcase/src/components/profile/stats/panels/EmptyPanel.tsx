import { Icon, type IconName } from '../../../primitives';

export interface EmptyPanelProps {
  compact?: boolean;
  icon: IconName;
  message: string;
}

export function EmptyPanel({
  compact = false,
  icon,
  message,
}: EmptyPanelProps) {
  return (
    <div
      className={[
        'flex cursor-default select-none flex-col items-center justify-center text-center text-ink-4',
        compact ? 'min-h-0 py-8' : 'h-full min-h-[280px]',
      ].join(' ')}
    >
      <Icon
        name={icon}
        size={52}
        strokeWidth={1.6}
        className="mb-4 text-ink-3"
      />
      <p className="app-text-supporting-copy max-w-[28rem]">{message}</p>
    </div>
  );
}
