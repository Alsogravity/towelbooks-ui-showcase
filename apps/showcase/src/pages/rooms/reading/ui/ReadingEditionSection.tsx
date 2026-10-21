import { ReadingDetailFactsGrid } from './ReadingDetailFactsGrid';
import { useI18n } from '../../../../i18n';

import type { ReadingDetailFact } from '../readingDetailViewModel';
import type { Reading } from '@towelbooks/schemas';

interface ReadingEditionSectionProps {
  edition: Reading['catalogEdition'] | null;
  facts: ReadingDetailFact[];
}

export function ReadingEditionSection({
  edition,
  facts,
}: ReadingEditionSectionProps) {
  const { t } = useI18n();

  if (!edition) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="app-text-section-title mb-2 text-ink">
          {t('rooms.reading.edition.eyebrow')}
        </p>
        <h2 className="app-text-card-title text-ink">{edition.title}</h2>
        {edition.subtitle ? (
          <p className="app-text-metadata mt-1 text-ink-3">
            {edition.subtitle}
          </p>
        ) : null}
      </div>

      <ReadingDetailFactsGrid
        columnsClassName="grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        facts={facts}
      />
    </div>
  );
}
