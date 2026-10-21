import type { ReactNode } from 'react';

interface SectionProps {
  as?: 'div' | 'section';
  className?: string;
  text: ReactNode;
  textClassName?: string;
  title?: ReactNode;
  titleAs?: 'h2' | 'h3';
  titleClassName?: string;
  titleId?: string;
}

export function Section({
  as: RootTag = 'section',
  className = '',
  text,
  textClassName = '',
  title,
  titleAs = 'h2',
  titleClassName = '',
  titleId,
}: SectionProps) {
  const TitleTag = titleAs;

  return (
    <RootTag className={['space-y-3', className].filter(Boolean).join(' ')}>
      {title ? (
        <TitleTag
          id={titleId}
          className={['app-text-section-title text-ink', titleClassName]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </TitleTag>
      ) : null}
      <p
        className={['app-text-supporting-copy text-ink-2', textClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {text}
      </p>
    </RootTag>
  );
}
