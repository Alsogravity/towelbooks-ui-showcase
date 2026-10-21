import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

export interface Tab<TKey extends string = string> {
  key: TKey;
  label: ReactNode;
}

export type TabsIndicator = 'slide' | 'border';

export interface TabsProps<TKey extends string = string> {
  tabs: Tab<TKey>[];
  activeKey: TKey;
  onChange: (key: TKey) => void;
  idPrefix?: string;
  ariaLabel?: string;
  className?: string;
  tabListClassName?: string;
  indicator?: TabsIndicator;
}

export function Tabs<TKey extends string = string>({
  tabs,
  activeKey,
  onChange,
  idPrefix = 'tab',
  ariaLabel = 'Tabs',
  className = '',
  tabListClassName = 'border-b border-rule',
  indicator = 'slide',
}: TabsProps<TKey>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef(new Map<TKey, HTMLButtonElement>());
  const dragStateRef = useRef<{
    pointerId: number;
    scrollLeft: number;
    startX: number;
    captured: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const isFirstRender = useRef(true);
  const isIndicatorFirstRender = useRef(true);
  const usesSlideIndicator = indicator === 'slide';

  useEffect(() => {
    const activeTabButton = tabRefs.current.get(activeKey);
    if (
      activeTabButton &&
      typeof activeTabButton.scrollIntoView === 'function'
    ) {
      const prefersReducedMotion =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
          : false;
      activeTabButton.scrollIntoView({
        behavior:
          isFirstRender.current || prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
    isFirstRender.current = false;
  }, [activeKey]);

  useLayoutEffect(() => {
    if (!usesSlideIndicator) {
      isIndicatorFirstRender.current = true;
      return;
    }

    const updateIndicator = () => {
      const activeTabButton = tabRefs.current.get(activeKey);
      const indicator = indicatorRef.current;
      if (!activeTabButton || !indicator) {
        return;
      }

      indicator.style.transform = `translateX(${activeTabButton.offsetLeft}px)`;
      indicator.style.width = `${activeTabButton.offsetWidth}px`;
      indicator.hidden = false;

      if (isIndicatorFirstRender.current) {
        indicator.classList.remove('tabs-indicator--animate');
        isIndicatorFirstRender.current = false;
        return;
      }

      indicator.classList.add('tabs-indicator--animate');
    };

    updateIndicator();

    const tabList = tabListRef.current;
    if (!tabList || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(tabList);

    for (const tab of tabs) {
      const tabButton = tabRefs.current.get(tab.key);
      if (tabButton) {
        resizeObserver.observe(tabButton);
      }
    }

    return () => resizeObserver.disconnect();
  }, [activeKey, tabs, usesSlideIndicator]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;

    if (
      !container ||
      event.pointerType !== 'mouse' ||
      event.button !== 0 ||
      container.scrollWidth <= container.clientWidth
    ) {
      return;
    }

    // Pointer capture is deferred until the drag threshold is crossed so a
    // plain click never captures (capture retargets `click` to the container,
    // which would leave tab buttons unresponsive).
    dragStateRef.current = {
      pointerId: event.pointerId,
      scrollLeft: container.scrollLeft,
      startX: event.clientX,
      captured: false,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    const dragState = dragStateRef.current;

    if (!container || !dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;

    if (Math.abs(deltaX) > 4) {
      suppressClickRef.current = true;

      if (!dragState.captured) {
        dragState.captured = true;
        container.setPointerCapture(event.pointerId);
      }
    }

    container.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const endPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    const shouldSuppressClick = suppressClickRef.current;

    if (!container || dragStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    const dragState = dragStateRef.current;
    dragStateRef.current = null;

    if (dragState.captured && container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }

    if (shouldSuppressClick) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const focusTab = (key: TKey) => {
    const tab = tabRefs.current.get(key);

    tab?.focus();
    if (typeof tab?.scrollIntoView === 'function') {
      const prefersReducedMotion =
        typeof window !== 'undefined' && typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
          : false;
      tab.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  };

  const selectTabAtIndex = (index: number) => {
    const nextTab = tabs[index];

    if (!nextTab) {
      return;
    }

    onChange(nextTab.key);
    focusTab(nextTab.key);
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (tabs.length === 0) {
      return;
    }

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectTabAtIndex(nextIndex);
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`tabs-scrollbar-hidden overflow-x-auto overscroll-x-contain touch-pan-x cursor-grab active:cursor-grabbing ${className}`}
      onClickCapture={handleClickCapture}
      onPointerCancel={endPointerDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPointerDrag}
    >
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className={[
          'flex w-full min-w-max',
          usesSlideIndicator ? 'relative' : '',
          tabListClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {usesSlideIndicator ? (
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="tabs-indicator"
            hidden
          />
        ) : null}
        {tabs.map((tab, index) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              id={`${idPrefix}-${tab.key}`}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(tab.key, node);
                  return;
                }

                tabRefs.current.delete(tab.key);
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${idPrefix}-${tab.key}-panel`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onClick={() => onChange(tab.key)}
              className={[
                'flex-1 whitespace-nowrap px-3 py-2.5 text-center app-text-body-sm font-medium tracking-wide transition-colors',
                'border-b-2 -mb-px',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 focus-visible:rounded-sm',
                usesSlideIndicator
                  ? isActive
                    ? 'border-transparent text-brick'
                    : 'border-transparent text-ink-3 hover:text-ink'
                  : isActive
                    ? 'border-brick text-brick'
                    : 'border-transparent text-ink-3 hover:text-ink',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type AnimatedTabPanelVariant = 'slide' | 'fade';

export interface AnimatedTabPanelProps {
  id: string;
  role?: string;
  'aria-labelledby': string;
  isActive: boolean;
  children: ReactNode;
  className?: string;
  lazy?: boolean;
  variant?: AnimatedTabPanelVariant;
}

export function AnimatedTabPanel({
  id,
  role = 'tabpanel',
  'aria-labelledby': ariaLabelledby,
  isActive,
  children,
  className = '',
  lazy = true,
  variant = 'slide',
}: AnimatedTabPanelProps) {
  const [hasBeenActive, setHasBeenActive] = useState(isActive);
  if (isActive && !hasBeenActive) {
    setHasBeenActive(true);
  }

  const shouldRender = !lazy || hasBeenActive;

  if (variant === 'fade') {
    return (
      <div
        id={id}
        role={role}
        aria-labelledby={ariaLabelledby}
        aria-hidden={!isActive}
        inert={!isActive ? true : undefined}
        className={[
          'tab-panel-fade',
          isActive ? 'tab-panel-fade--active' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {shouldRender ? children : null}
      </div>
    );
  }

  return (
    <div
      id={id}
      role={role}
      aria-labelledby={ariaLabelledby}
      aria-hidden={!isActive}
      inert={!isActive ? true : undefined}
      className={[
        'tab-panel-slide',
        isActive ? 'tab-panel-slide--active' : 'tab-panel-slide--inactive',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {shouldRender ? children : null}
    </div>
  );
}

export interface TabPanelsFadeProps {
  children: ReactNode;
  className?: string;
}

export function TabPanelsFade({
  children,
  className = '',
}: TabPanelsFadeProps) {
  return (
    <div className={['tab-panels-fade', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export interface TabPanelsSliderProps {
  activeKey: string;
  tabs: { key: string }[];
  children: ReactNode;
  className?: string;
}

export function TabPanelsSlider({
  activeKey,
  tabs,
  children,
  className = '',
}: TabPanelsSliderProps) {
  const activeIndex = tabs.findIndex((tab) => tab.key === activeKey);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className={`w-full overflow-x-clip overflow-y-visible ${className}`}>
      <div
        className="flex"
        style={{
          transform: `translateX(-${safeActiveIndex * 100}%)`,
          transition:
            'transform var(--motion-duration-slow) var(--motion-ease-standard)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
