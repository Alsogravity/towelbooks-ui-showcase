import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router';

import { Icon } from '../primitives';
import { SectionHeader } from './SectionHeader';
import { SectionTitleLink } from './SectionTitleLink';
import {
  FilterChipGroup,
  type FilterChipOption,
} from '../primitives/FilterChip';

import type { CSSProperties, ReactNode } from 'react';

export type BrowseSectionFilter = FilterChipOption;

interface BrowseSectionFooterLink {
  label: ReactNode;
  onClick?: never;
  to: string;
}

interface BrowseSectionFooterButton {
  label: ReactNode;
  onClick: () => void;
  to?: never;
}

export type BrowseSectionFooterAction =
  BrowseSectionFooterLink | BrowseSectionFooterButton;

export interface BrowseSectionTitleAction {
  ariaLabel: string;
  to: string;
}

export interface BrowseSectionProps {
  children: ReactNode;
  className?: string;
  /** Gap between section content and footer when both are present. */
  contentFooterGap?: 'default' | 'tight';
  description?: ReactNode;
  filters?: BrowseSectionFilter[];
  filtersLabel?: string;
  footerAction?: BrowseSectionFooterAction;
  title: ReactNode;
  titleAction?: BrowseSectionTitleAction;
}

export function BrowseSection({
  children,
  className,
  contentFooterGap = 'default',
  description,
  filters,
  filtersLabel,
  footerAction,
  title,
  titleAction,
}: BrowseSectionProps) {
  const contentFooterWrapperClassName =
    contentFooterGap === 'tight'
      ? 'flex min-w-0 flex-col gap-2'
      : 'flex min-w-0 flex-col gap-4';

  return (
    <section
      className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}
    >
      {titleAction ? (
        <div className="flex flex-col gap-1.5">
          <SectionTitleLink
            ariaLabel={titleAction.ariaLabel}
            title={title}
            to={titleAction.to}
          />
          {description ? (
            <p className="supporting-copy text-ink-2">{description}</p>
          ) : null}
        </div>
      ) : (
        <SectionHeader title={title} description={description} />
      )}

      {filters && filters.length > 0 ? (
        <FilterChipGroup label={filtersLabel} options={filters} />
      ) : null}

      {footerAction ? (
        <div className={contentFooterWrapperClassName}>
          {children}
          <BrowseSectionFooter action={footerAction} />
        </div>
      ) : (
        <div className="min-w-0">{children}</div>
      )}
    </section>
  );
}

function BrowseSectionFooter({
  action,
}: {
  action: BrowseSectionFooterAction;
}) {
  const content = (
    <>
      <span>{action.label}</span>
      <Icon name="chevron-right" size={18} />
    </>
  );

  const sharedClassName =
    'flex items-center justify-between py-1 text-sm font-semibold text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2';

  if (action.to !== undefined) {
    return (
      <Link to={action.to} className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`${sharedClassName} w-full text-left`}
    >
      {content}
    </button>
  );
}

export interface BrowseSectionCarouselProps {
  ariaLabel?: string;
  children: ReactNode;
  /** Optional CSS aspect-ratio string for fixed-fit items. */
  itemAspectRatio?: string;
  /** Fixed width applied to each item; height remains content-driven when no aspect ratio is supplied. */
  itemWidth?: number;
  /** aria-label for the "scroll to next" chevron. When omitted, no chevrons render. */
  nextLabel?: string;
  /** aria-label for the "scroll to previous" chevron. When omitted, no chevrons render. */
  previousLabel?: string;
}

export function BrowseSectionCarousel({
  ariaLabel,
  children,
  itemAspectRatio,
  itemWidth = 180,
  nextLabel,
  previousLabel,
}: BrowseSectionCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [inset, setInset] = useState({ left: 0, right: 0 });
  const [isMediumViewport, setIsMediumViewport] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setHasOverflow(maxScrollLeft > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(maxScrollLeft <= 1 || el.scrollLeft >= maxScrollLeft - 1);
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
  }, [children, updateScrollState]);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setInset({
        left: rect.left,
        right: window.innerWidth - rect.right,
      });
      const w = window.innerWidth;
      setIsMediumViewport(w >= 640 && w < 1024);
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(document.body);
      return () => ro.disconnect();
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateScrollState, { passive: true });

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      resizeObserver?.disconnect();
    };
  }, [updateScrollState]);

  const scrollByDirection = (direction: 'previous' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, itemWidth + 16);
    el.scrollBy({
      behavior: 'smooth',
      left: direction === 'previous' ? -amount : amount,
    });
  };

  const itemStyle: CSSProperties = {
    width: `${itemWidth}px`,
    ...(itemAspectRatio ? { aspectRatio: itemAspectRatio } : {}),
  };

  const scrollerStyle: CSSProperties | undefined =
    hasOverflow && isMediumViewport
      ? {
          marginLeft: -inset.left,
          marginRight: -inset.right,
          paddingLeft: inset.left,
          paddingRight: inset.right,
        }
      : undefined;

  const showChevrons = previousLabel !== undefined && nextLabel !== undefined;
  const items = Array.isArray(children) ? children : [children];

  return (
    <div ref={wrapperRef} className="relative">
      <div
        ref={scrollerRef}
        role={ariaLabel ? 'group' : undefined}
        aria-label={ariaLabel}
        className="flex items-start gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={scrollerStyle}
      >
        {items.map((child, index) => (
          <div key={index} className="shrink-0" style={itemStyle}>
            {child}
          </div>
        ))}
      </div>

      {showChevrons ? (
        <>
          <button
            type="button"
            aria-label={previousLabel}
            disabled={atStart}
            onClick={() => scrollByDirection('previous')}
            className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-rule bg-paper text-ink shadow-md transition-opacity duration-200 hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0 lg:flex"
          >
            <Icon name="chevron-left" size={20} />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            disabled={atEnd}
            onClick={() => scrollByDirection('next')}
            className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-rule bg-paper text-ink shadow-md transition-opacity duration-200 hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-0 lg:flex"
          >
            <Icon name="chevron-right" size={20} />
          </button>
        </>
      ) : null}
    </div>
  );
}
