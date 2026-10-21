import type { ReactNode } from 'react';
import { PageContainer, PageShell, SectionHeader } from './layout';
import { usePageTitle } from '../hooks/usePageTitle';
export function Page({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  usePageTitle(title);
  return (
    <PageShell background="paper">
      <PageContainer>
        <header className="page-heading">
          <div>
            <h1 className="app-text-page-title">{title}</h1>
            {description && (
              <p className="app-text-page-description text-ink-3 mt-3">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
        <div className="page-content">{children}</div>
      </PageContainer>
    </PageShell>
  );
}
export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="reading-section">
      <SectionHeader title={title} actions={action} />
      {children}
    </section>
  );
}
