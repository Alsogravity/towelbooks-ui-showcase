import { EmptyState } from '../../../components/feedback';
import { Icon } from '../../../components/primitives';

type RoomDiscoverNoResultsEmptyStateProps = {
  className?: string;
};

export function RoomDiscoverNoResultsEmptyState({
  className,
}: RoomDiscoverNoResultsEmptyStateProps) {
  return (
    <EmptyState
      className={className}
      ornament={
        <Icon
          name="search-alert"
          size={44}
          strokeWidth={1.5}
          className="text-gold"
        />
      }
      title={{
        key: 'rooms.list.discover.empty.title',
        fallback: 'No public rooms found',
      }}
      body={{
        key: 'rooms.list.discover.empty.body',
        fallback:
          'Try different keywords, or clear the search to see your own rooms.',
      }}
    />
  );
}
