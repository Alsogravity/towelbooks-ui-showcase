import { CommentsSection } from './CommentsSection';

interface ReadingCommentsPanelProps {
  roomId: string;
  readingId?: string;
}

export function ReadingCommentsPanel({
  roomId,
  readingId,
}: ReadingCommentsPanelProps) {
  const commentsQueryKeyPrefix = ['rooms', roomId, 'notes'] as const;
  const targetId = readingId ?? roomId;
  const targetType = readingId ? 'reading' : 'room';

  return (
    <CommentsSection
      copy={{
        emptyBody: readingId
          ? {
              key: 'notes.panel.emptyBody.reading',
              fallback:
                'Notes for this reading will appear here once the room starts annotating.',
            }
          : {
              key: 'notes.panel.emptyBody.room',
              fallback:
                'Room-wide notes will appear here once the room starts annotating.',
            },
      }}
      headingId={`reading-comments-title-${readingId ?? roomId}`}
      queryKeyPrefix={commentsQueryKeyPrefix}
      targetId={targetId}
      targetType={targetType}
    />
  );
}
