import { useLayoutEffect, useRef, useState } from 'react';

import type { TranslationSegment } from '../../i18n';

type NotificationRichMessageProps = {
  className?: string;
  createdAt: string;
  excerpt?: string | null;
  moreLabel?: string | null;
  segments: readonly TranslationSegment[];
  timestamp: string;
};

export function NotificationRichMessage({
  className,
  createdAt,
  excerpt = null,
  moreLabel = null,
  segments,
  timestamp,
}: NotificationRichMessageProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const hasExcerpt = typeof excerpt === 'string' && excerpt.length > 0;
  const [showMoreLabel, setShowMoreLabel] = useState(false);

  useLayoutEffect(() => {
    const element = textRef.current;

    if (!element || !hasExcerpt) {
      setShowMoreLabel(false);
      return;
    }

    const measureOverflow = () => {
      setShowMoreLabel(element.scrollHeight > element.clientHeight + 1);
    };

    measureOverflow();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureOverflow();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [createdAt, hasExcerpt, excerpt, moreLabel, segments, timestamp]);

  return (
    <p
      ref={textRef}
      className={[
        'text-sm leading-5 text-ink',
        hasExcerpt ? 'line-clamp-4' : null,
        className ?? null,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {segments.map((segment, index) => (
        <span
          className={segment.emphasis ? 'font-medium' : undefined}
          key={`${segment.key ?? 'segment'}-${index}`}
        >
          {segment.text}
        </span>
      ))}
      {hasExcerpt ? (
        <>
          <span>: </span>
          <span>{excerpt}</span>
          {showMoreLabel && moreLabel ? (
            <span className="text-ink-4"> ... {moreLabel}</span>
          ) : null}
        </>
      ) : null}
      <time className="text-ink-4" dateTime={createdAt}>
        {' '}
        {timestamp}
      </time>
    </p>
  );
}
