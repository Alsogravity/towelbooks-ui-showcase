import type { ReactNode } from 'react';

interface LanguageFadeProps {
  children: ReactNode;
  className?: string;
}

export function LanguageFade({ children, className }: LanguageFadeProps) {
  return <span className={className}>{children}</span>;
}
