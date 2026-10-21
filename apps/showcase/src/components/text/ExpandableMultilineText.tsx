import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { useI18n } from '../../i18n';

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

const LINE_CLAMP_CLASS: Record<number, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
  5: 'line-clamp-5',
  6: 'line-clamp-6',
};

export type ExpandableMultilineTextProps = {
  text: string;
  collapsedLines?: number;
  className?: string;
  preserveLineBreaks?: boolean;
  textClassName?: string;
};

export function ExpandableMultilineText({
  text,
  collapsedLines = 3,
  className = '',
  preserveLineBreaks = true,
  textClassName = '',
}: ExpandableMultilineTextProps) {
  const { t } = useI18n();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  const measureOverflow = useCallback(() => {
    const element = textRef.current;
    if (!element || isExpanded) {
      return;
    }

    setCanExpand(element.scrollHeight > element.clientHeight + 1);
  }, [isExpanded]);

  useLayoutEffect(() => {
    measureOverflow();
  }, [measureOverflow, text, collapsedLines]);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element || isExpanded || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureOverflow();
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isExpanded, measureOverflow]);

  const lineClampClass =
    LINE_CLAMP_CLASS[collapsedLines] ?? `line-clamp-${collapsedLines}`;

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={classNames(
          textClassName,
          preserveLineBreaks && 'whitespace-pre-wrap',
          !isExpanded && lineClampClass,
        )}
      >
        {text}
      </p>
      {canExpand ? (
        <button
          type="button"
          aria-expanded={isExpanded}
          className="mt-2 text-sm font-medium text-brick hover:underline"
          onClick={() => {
            setIsExpanded((current) => !current);
          }}
        >
          {isExpanded ? t('common.text.viewLess') : t('common.text.viewMore')}
        </button>
      ) : null}
    </div>
  );
}
