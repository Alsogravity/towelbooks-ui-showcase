import { type LibraryItemDetail } from '@towelbooks/schemas';

import { LibraryItemReadingSessionsSection } from './LibraryItemReadingSessionsSection';

interface LibraryItemDetailSessionsPanelProps {
  canManage: boolean;
  item: LibraryItemDetail;
  libraryId: string;
}

export function LibraryItemDetailSessionsPanel({
  canManage,
  item,
  libraryId,
}: LibraryItemDetailSessionsPanelProps) {
  return (
    <LibraryItemReadingSessionsSection
      canManage={canManage}
      catalogEditions={item.work.catalogEditions}
      item={item}
      libraryId={libraryId}
    />
  );
}
