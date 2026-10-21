import { ReadingCommentsPanel } from '../../../../features/comments/comments-panel/ReadingCommentsPanel';

interface ReadingCommentsSectionProps {
  roomId: string;
  readingId: string;
}

export function ReadingCommentsSection({
  roomId,
  readingId,
}: ReadingCommentsSectionProps) {
  return (
    <section className="border-t border-rule/80 pt-6">
      <ReadingCommentsPanel roomId={roomId} readingId={readingId} />
    </section>
  );
}
