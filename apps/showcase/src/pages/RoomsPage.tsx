import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button, Textarea, Avatar } from '@towelbooks/ui';
import { Page, Section } from '../components/Page';
import { RoomPreview } from '../entities/RoomPreview';
import { BookPreview } from '../entities/BookPreview';
import { rooms, findBook } from '../demo/data';
import { useDemo } from '../demo/DemoContext';
import { useI18n } from '../i18n';
import { NotFoundPage } from './NotFoundPage';
export function RoomsPage() {
  const { roomId } = useParams();
  const { ui, locale } = useI18n();
  const { memberships, setMemberships, reflections, reflect } = useDemo();
  const [body, setBody] = useState('');
  const room = rooms.find((value) => value.id === roomId);
  if (roomId && !room) return <NotFoundPage />;
  if (!room)
    return (
      <Page title={ui('rooms')} description={ui('roomBody')}>
        <div className="room-grid">
          {rooms.map((value) => (
            <RoomPreview
              key={value.id}
              room={value}
              isMember={memberships.includes(value.id)}
            />
          ))}
        </div>
      </Page>
    );
  const member = memberships.includes(room.id);
  const book = findBook(room.bookId);
  return (
    <Page
      title={room.name}
      description={room.description[locale]}
      action={
        <Button
          variant={member ? 'secondary' : 'primary'}
          onClick={() =>
            setMemberships((items) =>
              member
                ? items.filter((id) => id !== room.id)
                : [...items, room.id],
            )
          }
        >
          {ui(member ? 'leave' : 'join')}
        </Button>
      }
    >
      <div className={`room-hero room-${room.theme}`}>
        <span className="app-text-metadata">{ui('public')}</span>
        <p className="app-text-stat-value">
          {room.members + (member ? 1 : 0)}{' '}
          <span className="app-text-body">{ui('members')}</span>
        </p>
      </div>
      <div className="room-detail-grid">
        <div>
          <Section title={ui('discussion')}>
            <article className="discussion-starter">
              <Avatar initial="C" size="sm" />
              <div>
                <h3 className="app-text-row-title">Clara · {room.name}</h3>
                <p className="app-text-body">{ui('discussionBody')}</p>
              </div>
            </article>
            {reflections
              .filter((value) => value.roomId === room.id)
              .map((value) => (
                <article className="discussion-starter" key={value.id}>
                  <Avatar initial="M" size="sm" />
                  <div>
                    <h3 className="app-text-row-title">Marina</h3>
                    <p className="app-text-body whitespace-pre-wrap break-words">
                      {value.body}
                    </p>
                  </div>
                </article>
              ))}
            {member ? (
              <form
                className="reflection-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  reflect(room.id, body);
                  setBody('');
                }}
              >
                <label className="form-label">
                  {ui('reply')}
                  <Textarea
                    required
                    maxLength={1000}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </label>
                <Button type="submit" disabled={!body.trim()}>
                  {ui('post')}
                </Button>
              </form>
            ) : (
              <p className="app-text-supporting-copy text-ink-3">
                {ui('join')}
              </p>
            )}
          </Section>
        </div>
        <aside>
          <Section title={ui('currentReading')}>
            {book && <BookPreview book={book} />}
            <Link to="/demo/rooms">← {ui('rooms')}</Link>
          </Section>
        </aside>
      </div>
    </Page>
  );
}
