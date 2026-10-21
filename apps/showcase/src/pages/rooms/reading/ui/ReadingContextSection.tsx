import { ExpandableMultilineText } from '../../../../components/text/ExpandableMultilineText';
import { useI18n } from '../../../../i18n';

interface ReadingContextSectionProps {
  description: string | null;
}

export function ReadingContextSection({
  description,
}: ReadingContextSectionProps) {
  const { t } = useI18n();

  return (
    <section className="scroll-mt-24">
      <div className="flex flex-col gap-4">
        <header className="flex items-center gap-4">
          <h2 className="app-text-section-title shrink-0 text-ink">
            {t('rooms.reading.context.eyebrow')}
          </h2>
          <div className="h-px w-full bg-rule/20" />
        </header>
        <ExpandableMultilineText
          collapsedLines={5}
          text={description || t('rooms.reading.context.empty')}
          textClassName="app-text-body break-words text-ink-2 lg:line-clamp-10"
        />
      </div>
    </section>
  );
}
