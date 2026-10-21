import type { ReactNode } from 'react';

export type AuthPageFrameProps = {
  children: ReactNode;
};

export function AuthPageFrame({ children }: AuthPageFrameProps) {
  return (
    <div className="flex flex-col px-6 py-8 sm:px-10 sm:py-10">{children}</div>
  );
}
