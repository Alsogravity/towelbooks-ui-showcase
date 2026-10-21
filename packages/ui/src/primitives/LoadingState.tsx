import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import { classNames } from '../className';

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function LoadingState({
  children,
  className = '',
  role = 'status',
  'aria-live': ariaLive = 'polite',
  ...props
}: LoadingStateProps) {
  const renderLabel = () => {
    if (typeof children === 'string') {
      return (
        <span className="vui-loading-state__label" aria-label={children}>
          <span style={{ display: 'none' }}>{children}</span>
          {children.split('').map((char, index) => {
            if (char === ' ') {
              return (
                <span
                  key={index}
                  className="vui-loading-state__char vui-loading-state__char--space"
                  aria-hidden="true"
                >
                  {'\u00A0'}
                </span>
              );
            }
            return (
              <span
                key={index}
                className="vui-loading-state__char"
                style={{ '--char-index': index } as CSSProperties}
                aria-hidden="true"
              >
                {char}
              </span>
            );
          })}
        </span>
      );
    }
    return (
      children && <span className="vui-loading-state__label">{children}</span>
    );
  };

  return (
    <div
      {...props}
      aria-live={ariaLive}
      className={classNames('vui-loading-state', className)}
      role={role}
    >
      <div className="vui-loading-state__book" aria-hidden="true">
        <div className="vui-loading-state__book-spine" />
        <div className="vui-loading-state__book-page vui-loading-state__book-page--left" />
        <div className="vui-loading-state__book-page vui-loading-state__book-page--right" />
        <div className="vui-loading-state__book-page vui-loading-state__book-page--flipping vui-loading-state__book-page--flipping-1" />
        <div className="vui-loading-state__book-page vui-loading-state__book-page--flipping vui-loading-state__book-page--flipping-2" />
        <div className="vui-loading-state__book-page vui-loading-state__book-page--flipping vui-loading-state__book-page--flipping-3" />
      </div>
      {renderLabel()}
    </div>
  );
}
