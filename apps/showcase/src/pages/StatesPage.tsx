import { useState } from 'react';
import { Button, Icon } from '@towelbooks/ui';
import { Page } from '../components/Page';
import { useI18n } from '../i18n';
import { BookPreview } from '../entities/BookPreview';
import { books } from '../demo/data';
export function StatesPage() {
  const { ui } = useI18n();
  const [state, setState] = useState<'normal' | 'loading' | 'empty' | 'error'>(
    'normal',
  );
  return (
    <Page title={ui('previews')} description={ui('previewBody')}>
      <div className="filter-list">
        {(['normal', 'loading', 'empty', 'error'] as const).map((value) => (
          <Button
            key={value}
            variant={state === value ? 'primary' : 'secondary'}
            aria-pressed={state === value}
            onClick={() => setState(value)}
          >
            {ui(value)}
          </Button>
        ))}
      </div>
      {state === 'normal' ? (
        <div className="book-grid">
          <BookPreview book={books[0]!} />
        </div>
      ) : (
        <div
          className="empty-state"
          role={state === 'error' ? 'alert' : 'status'}
        >
          <Icon
            name={state === 'error' ? 'triangle-alert' : 'book-open'}
            size={38}
          />
          <h2 className="app-text-section-title">
            {ui(
              state === 'loading'
                ? 'loadingBody'
                : state === 'empty'
                  ? 'emptyBody'
                  : 'errorBody',
            )}
          </h2>
          {state !== 'loading' && (
            <Button variant="secondary" onClick={() => setState('normal')}>
              {ui(state === 'error' ? 'retry' : 'explore')}
            </Button>
          )}
        </div>
      )}
    </Page>
  );
}
