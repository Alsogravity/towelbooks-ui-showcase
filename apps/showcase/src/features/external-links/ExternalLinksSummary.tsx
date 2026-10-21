import { type ExternalLink } from '@towelbooks/schemas';
import { useState } from 'react';

import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { formatExternalLinksSummary } from './externalLinkDisplay';
import { ExternalLinksSheet } from './ExternalLinksSheet';

type ExternalLinksSummaryProps = {
  links: ExternalLink[];
  /** `plain` matches inline summary stats (icon without a circular background). */
  variant?: 'default' | 'plain';
};

export function ExternalLinksSummary({
  links,
  variant = 'default',
}: ExternalLinksSummaryProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const summary = formatExternalLinksSummary(links, (count) =>
    t('externalLinks.summary.andMore', {
      values: { count },
      fallback: `and ${count} more`,
    }),
  );

  if (!summary) {
    return null;
  }

  const isPlain = variant === 'plain';

  return (
    <>
      <button
        type="button"
        className={
          isPlain
            ? 'external-links-summary inline-flex max-w-full items-center gap-1.5 text-left text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40 focus-visible:rounded-sm'
            : 'external-links-summary inline-flex max-w-full items-center gap-2 text-left text-ink'
        }
        onClick={() => setIsOpen(true)}
        aria-label={t('externalLinks.summary.open', {
          fallback: 'View links',
        })}
      >
        {isPlain ? (
          <Icon
            name="link"
            size={16}
            className="text-ink-3"
            aria-hidden="true"
          />
        ) : (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/5">
            <Icon name="link" size={16} aria-hidden="true" />
          </span>
        )}
        <span
          className={
            isPlain
              ? 'text-app-body leading-app-compact truncate font-normal text-ink-3'
              : 'app-text-body truncate'
          }
        >
          {summary}
        </span>
      </button>

      <ExternalLinksSheet
        isOpen={isOpen}
        links={links}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
