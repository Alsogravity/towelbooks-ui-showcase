import { Link } from 'react-router';

import { BrowseSection } from '../../../components/layout';
import { Icon } from '../../../components/primitives';
import { CatalogWorkCandidateRow } from '../../../entities/reading/ui';
import { useI18n } from '../../../i18n';

import type { ContinueCatalogWork } from '../content';
import type { ReactNode } from 'react';

export function ContinueReadingSection({
  children,
  seeAllLabel,
  seeAllTo,
  title,
}: {
  children: ReactNode;
  seeAllLabel: string;
  seeAllTo: string;
  title: string;
}) {
  return (
    <BrowseSection
      title={title}
      titleAction={{ ariaLabel: seeAllLabel, to: seeAllTo }}
    >
      {children}
    </BrowseSection>
  );
}

export function ContinueReadingGrid({
  items,
}: {
  items: ContinueCatalogWork[];
}) {
  const { t } = useI18n();

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
      {items.map((book) => (
        <li key={book.href} className="min-w-0">
          <Link
            aria-label={t('dashboard.continueReading.itemLink', {
              values: { title: book.title },
            })}
            className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 focus-visible:rounded-sm"
            to={book.href}
          >
            <CatalogWorkCandidateRow
              author={
                book.author?.trim() || t('myLibrary.common.noContributor')
              }
              bottomRight={
                book.roomName ? (
                  <span className="app-text-metadata flex min-w-0 max-w-full items-center gap-1.5 leading-snug text-ink-2">
                    <Icon name="users-glyph" size={16} className="text-ink-3" />
                    <span className="min-w-0 truncate">{book.roomName}</span>
                  </span>
                ) : null
              }
              actions={
                book.progress !== undefined ? (
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-baseline justify-between">
                      {book.chapterLabel ? (
                        <span className="app-text-metadata font-medium text-ink-2">
                          {book.chapterLabel}
                        </span>
                      ) : null}
                      <span className="app-text-metadata font-mono text-ink-3">
                        {Math.round(book.progress * 100)}%
                      </span>
                    </div>
                    <progress
                      className="app-progress app-progress--xs app-progress--brick w-full"
                      max={100}
                      value={Math.round(book.progress * 100)}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={Math.round(book.progress * 100)}
                    />
                  </div>
                ) : null
              }
              className="h-full w-full"
              coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
              coverGeometry={book.coverGeometry}
              coverThumbnailUrl={book.coverThumbnailUrl}
              coverUrl={book.coverUrl}
              themeSeed={book.href}
              title={book.title}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RoomReadingsGrid({ items }: { items: ContinueCatalogWork[] }) {
  const { t } = useI18n();

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="list">
      {items.map((book) => (
        <li key={book.href} className="min-w-0">
          <Link
            aria-label={t('dashboard.continueReading.itemLink', {
              values: { title: book.title },
            })}
            className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2 focus-visible:rounded-sm"
            to={book.href}
          >
            <CatalogWorkCandidateRow
              author={
                book.author?.trim() || t('myLibrary.common.noContributor')
              }
              bottomRight={
                book.roomName ? (
                  <span className="app-text-metadata flex min-w-0 max-w-full items-center gap-1.5 leading-snug text-ink-2">
                    <Icon name="users-glyph" size={16} className="text-ink-3" />
                    <span className="min-w-0 truncate">{book.roomName}</span>
                  </span>
                ) : null
              }
              className="h-full w-full"
              coverDelivery={{ loading: 'lazy', preferredVariant: 'detail' }}
              coverGeometry={book.coverGeometry}
              coverThumbnailUrl={book.coverThumbnailUrl}
              coverUrl={book.coverUrl}
              themeSeed={book.href}
              title={book.title}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
