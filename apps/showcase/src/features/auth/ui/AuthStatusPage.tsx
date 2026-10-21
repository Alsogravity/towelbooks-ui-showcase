import type { ReactNode } from 'react';

export type AuthStatusPageProps = {
  children: ReactNode;
};

export function AuthStatusPage({ children }: AuthStatusPageProps) {
  return <div className="space-y-6">{children}</div>;
}
