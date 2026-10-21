import { type ReactNode } from 'react';

import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { PageShell } from './PageShell';

interface FormPageLayoutProps {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function FormPageLayout({
  actions,
  backHref,
  backLabel,
  children,
  description,
  title,
}: FormPageLayoutProps) {
  return (
    <PageShell background="paper" minHeight>
      <PageContainer
        size="wide"
        className="box-border flex w-full min-w-0 flex-col gap-8 lg:min-h-[var(--page-shell-min-height,100dvh)]"
      >
        <PageHeader
          actions={actions}
          backHref={backHref}
          backLabel={backLabel}
          description={description}
          title={title}
        />

        <div className="w-full lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:py-8">
          <section className="mx-auto w-full max-w-2xl space-y-6">
            {children}
          </section>
        </div>
      </PageContainer>
    </PageShell>
  );
}
