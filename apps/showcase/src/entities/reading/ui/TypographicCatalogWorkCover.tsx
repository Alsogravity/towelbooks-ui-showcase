import React from 'react';

import { CATALOG_COVER_ASPECT_CLASS } from './catalogCoverLayout';

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export const COVER_THEMES = [
  { bg: '#2F4A36', fg: '#F4ECD8', accent: '#B8893E' }, // forest
  { bg: '#8B2E1F', fg: '#F4ECD8', accent: '#B8893E' }, // brick
  { bg: '#1A1714', fg: '#F4ECD8', accent: '#B8893E' }, // ink
  { bg: '#B8893E', fg: '#1A1714', accent: '#8B2E1F' }, // gilt
  { bg: '#3D362C', fg: '#EADFC4', accent: '#C25844' }, // sepia
  { bg: '#EADFC4', fg: '#1A1714', accent: '#8B2E1F' }, // cream
  { bg: '#23332A', fg: '#D6DDC9', accent: '#B8893E' }, // dark forest
] as const;

export type TypographicCatalogWorkCoverSize =
  'xs' | 'sm' | 'md' | 'lg' | 'fluid' | 'header' | 'headerCompact';

const COVER_THEME_CLASS_NAMES = [
  'bg-[#2F4A36] text-[#F4ECD8] [--cover-accent:#B8893E]',
  'bg-[#8B2E1F] text-[#F4ECD8] [--cover-accent:#B8893E]',
  'bg-[#1A1714] text-[#F4ECD8] [--cover-accent:#B8893E]',
  'bg-[#B8893E] text-[#1A1714] [--cover-accent:#8B2E1F]',
  'bg-[#3D362C] text-[#EADFC4] [--cover-accent:#C25844]',
  'bg-[#EADFC4] text-[#1A1714] [--cover-accent:#8B2E1F]',
  'bg-[#23332A] text-[#D6DDC9] [--cover-accent:#B8893E]',
] as const;

/** Scales ornament, title, and padding with cover width via container queries. */
const PROPORTIONAL_COVER_TYPE_CLASS_NAMES = {
  shell: 'px-[clamp(4px,8cqw,14.4px)] py-[clamp(6px,10cqw,18px)]',
  frame: 'py-[clamp(2px,4cqw,7.2px)]',
  ornament: 'text-[clamp(0.3125rem,9cqw,1.125rem)]',
  body: 'py-[clamp(2.5px,5cqw,9px)]',
  title: 'text-[clamp(0.75rem,12cqw,1.5rem)]',
  footer: 'pt-[clamp(2.5px,5cqw,9px)]',
  author: 'text-[clamp(0.3125rem,9cqw,1.125rem)]',
} as const;

const COVER_SIZE_CLASS_NAMES: Record<
  TypographicCatalogWorkCoverSize,
  {
    body: string;
    frame: string;
    ornament: string;
    root: string;
    shell: string;
    title: string;
    footer: string;
    author: string;
  }
> = {
  xs: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'w-[56px] max-w-full',
    ),
    ...PROPORTIONAL_COVER_TYPE_CLASS_NAMES,
  },
  sm: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'w-[118px] max-w-full',
    ),
    ...PROPORTIONAL_COVER_TYPE_CLASS_NAMES,
  },
  md: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'w-[150px] max-w-full',
    ),
    ...PROPORTIONAL_COVER_TYPE_CLASS_NAMES,
  },
  lg: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'w-[180px] max-w-full',
    ),
    ...PROPORTIONAL_COVER_TYPE_CLASS_NAMES,
  },
  fluid: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'h-auto w-full max-w-full',
    ),
    shell: 'px-[clamp(4px,8cqw,16px)] py-[clamp(6px,10cqw,20px)]',
    frame: 'py-[clamp(2px,4cqw,8px)]',
    ornament: 'text-[clamp(0.3125rem,9cqw,1.125rem)]',
    body: 'py-[clamp(2.5px,5cqw,12px)]',
    title: 'text-[clamp(0.75rem,12cqw,1.5rem)]',
    footer: 'pt-[clamp(2.5px,5cqw,12px)]',
    author: 'text-[clamp(0.3125rem,9cqw,1.125rem)]',
  },
  header: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'w-28 max-w-full sm:w-32 lg:w-40',
    ),
    ...PROPORTIONAL_COVER_TYPE_CLASS_NAMES,
  },
  headerCompact: {
    root: classNames(
      '@container',
      CATALOG_COVER_ASPECT_CLASS,
      'w-28 max-w-full',
    ),
    ...PROPORTIONAL_COVER_TYPE_CLASS_NAMES,
  },
};

export interface TypographicCatalogWorkCoverProps extends React.HTMLAttributes<HTMLDivElement> {
  author?: string | null;
  ornament?: string;
  showDividers?: boolean;
  size?: TypographicCatalogWorkCoverSize;
  shadow?: boolean;
  theme?: number;
  title: string;
}

export function TypographicCatalogWorkCover({
  author,
  ornament = '❦',
  showDividers = true,
  size = 'md',
  shadow = true,
  theme = 0,
  title,
  className,
  style: _style,
  ...props
}: TypographicCatalogWorkCoverProps) {
  const themeClassName =
    COVER_THEME_CLASS_NAMES[theme % COVER_THEME_CLASS_NAMES.length];
  const sizeClassNames = COVER_SIZE_CLASS_NAMES[size];

  return (
    <div
      className={classNames(
        'relative flex shrink-0 flex-col items-stretch justify-between rounded-[1px] font-display overflow-hidden',
        themeClassName,
        sizeClassNames.root,
        sizeClassNames.shell,
        shadow ? 'shadow-book' : 'shadow-none',
        className,
      )}
      {...props}
    >
      <div
        className={classNames(
          showDividers
            ? 'border-y border-[var(--cover-accent)] text-center'
            : 'text-center',
          sizeClassNames.frame,
        )}
      >
        <div
          className={classNames(
            'font-sans font-semibold uppercase tracking-[0.15em] text-[var(--cover-accent)] truncate',
            sizeClassNames.ornament,
          )}
        >
          {ornament}
        </div>
      </div>

      <div
        className={classNames(
          'flex flex-1 items-center justify-center text-center min-h-0 overflow-hidden',
          sizeClassNames.body,
        )}
      >
        <div
          className={classNames(
            'text-balance font-semibold italic leading-[1.1] line-clamp-4',
            sizeClassNames.title,
          )}
        >
          {title}
        </div>
      </div>

      <div
        className={classNames(
          showDividers
            ? 'border-t border-[var(--cover-accent)] text-center'
            : 'text-center',
          sizeClassNames.footer,
        )}
      >
        <div
          className={classNames(
            'font-sans font-medium uppercase tracking-[0.1em] opacity-[0.85] truncate',
            sizeClassNames.author,
          )}
        >
          {author || ''}
        </div>
      </div>
    </div>
  );
}
