import type { ReactNode } from 'react';

export type AuthFormPageTitleAlign = 'left' | 'center';

export type AuthFormPageProps = {
  children: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  titleAlign?: AuthFormPageTitleAlign;
};

const titleAlignClassName: Record<AuthFormPageTitleAlign, string> = {
  center: 'text-center',
  left: 'text-left',
};

export function AuthFormPage({
  children,
  description,
  eyebrow,
  title,
  titleAlign = 'center',
}: AuthFormPageProps) {
  const alignClassName = titleAlignClassName[titleAlign];

  return (
    <>
      {eyebrow ? (
        <p className={`eyebrow mb-3 ${alignClassName}`}>{eyebrow}</p>
      ) : null}
      <h2 className={`app-text-dialog-title mb-6 text-ink ${alignClassName}`}>
        {title}
      </h2>
      {description ? (
        <p className={`supporting-copy mb-6 text-ink-2 ${alignClassName}`}>
          {description}
        </p>
      ) : null}
      {children}
    </>
  );
}
