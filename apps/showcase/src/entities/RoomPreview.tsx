import { Link } from 'react-router';
import { Icon } from '@towelbooks/ui';
import { useI18n } from '../i18n';
import { rooms, findBook } from '../demo/data';
export function RoomPreview({
  room,
  isMember = false,
}: {
  room: (typeof rooms)[number];
  isMember?: boolean;
}) {
  const { ui, locale } = useI18n();
  return (
    <article className={`room-preview room-${room.theme}`}>
      <div className="room-band" aria-hidden="true">
        <Icon name="users-glyph" size={44} />
      </div>
      <div className="room-preview-body">
        <p className="app-text-caption text-ink-3">
          {ui('public')} · {room.members + (isMember ? 1 : 0)} {ui('members')}
        </p>
        <h3 className="app-text-entity-title">
          <Link to={`/demo/rooms/${room.id}`}>{room.name}</Link>
        </h3>
        <p className="app-text-body-sm text-ink-2">
          {room.description[locale]}
        </p>
        <p className="app-text-caption text-ink-3">
          {ui('currentReading')} · {findBook(room.bookId)?.title}
        </p>
      </div>
    </article>
  );
}
