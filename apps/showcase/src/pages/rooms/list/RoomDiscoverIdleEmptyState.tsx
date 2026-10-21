import { EmptyState } from '../../../components/feedback';

type RoomDiscoverIdleEmptyStateProps = {
  className?: string;
};

export function RoomDiscoverIdleEmptyState({
  className,
}: RoomDiscoverIdleEmptyStateProps) {
  return (
    <EmptyState
      className={className}
      icon="search"
      title={{
        key: 'rooms.list.discover.idle.title',
        fallback: 'Search public rooms',
      }}
      body={{
        key: 'rooms.list.discover.idle.body',
        fallback:
          'Type a name or description to find public rooms you have not joined yet.',
      }}
    />
  );
}
