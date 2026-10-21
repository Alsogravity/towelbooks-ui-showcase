import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';

import { LoadingState } from '../../../../../components/feedback';
import { Button, FormTextField } from '../../../../../components/primitives';
import { useI18n } from '../../../../../i18n';
import { sdk } from '../../../../../lib/sdk';

export type ReadingOptionDraft = {
  contributors: string;
  coverUrl: string | null;
  catalogWorkId: string;
  subtitle: string | null;
  title: string;
};

type ReadingOptionsFieldProps = {
  options: ReadingOptionDraft[];
  onChange: (options: ReadingOptionDraft[]) => void;
};

export function ReadingOptionsField({
  options,
  onChange,
}: ReadingOptionsFieldProps) {
  const { locale, t } = useI18n();
  const [draftQuery, setDraftQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const normalizedQuery = submittedQuery.trim();

  const searchQuery = useQuery({
    enabled: normalizedQuery.length > 0,
    queryKey: ['catalog', 'search', normalizedQuery, locale],
    queryFn: () =>
      sdk.catalog.search({
        pageSize: 8,
        query: normalizedQuery,
      }),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(draftQuery.trim());
  };

  const isSelected = (catalogWorkId: string) =>
    options.some((option) => option.catalogWorkId === catalogWorkId);

  const addOption = (option: ReadingOptionDraft) => {
    if (isSelected(option.catalogWorkId)) {
      return;
    }
    onChange([...options, option]);
  };

  const removeOption = (catalogWorkId: string) => {
    onChange(
      options.filter((option) => option.catalogWorkId !== catalogWorkId),
    );
  };

  return (
    <div className="space-y-4">
      {options.length > 0 ? (
        <ul className="space-y-2">
          {options.map((option) => (
            <li
              key={option.catalogWorkId}
              className="flex items-center gap-3 rounded-xl border border-rule/80 bg-paper px-3 py-2"
            >
              {option.coverUrl ? (
                <img
                  alt=""
                  className="h-12 w-9 shrink-0 rounded object-cover"
                  src={option.coverUrl}
                />
              ) : (
                <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-rule/30 text-base">
                  📚
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {option.title}
                </p>
                {option.contributors ? (
                  <p className="truncate text-xs text-ink-3">
                    {option.contributors}
                  </p>
                ) : null}
              </div>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => removeOption(option.catalogWorkId)}
              >
                {t('rooms.detail.polls.createDialog.reading.remove')}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <FormTextField
          autoComplete="off"
          id="create-poll-reading-search"
          label={t('rooms.detail.polls.createDialog.reading.searchPlaceholder')}
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
        />
        <Button
          isLoading={searchQuery.isFetching && normalizedQuery.length > 0}
          loadingLabel={t('rooms.detail.polls.createDialog.reading.searching')}
          type="submit"
          variant="secondary"
        >
          {t('rooms.detail.polls.createDialog.reading.search')}
        </Button>
      </form>

      {normalizedQuery.length === 0 ? null : searchQuery.isLoading ? (
        <LoadingState
          label={{
            key: 'rooms.detail.polls.createDialog.reading.searching',
            fallback: 'Searching the catalog...',
          }}
        />
      ) : searchQuery.data && searchQuery.data.items.length > 0 ? (
        <ul className="space-y-2">
          {searchQuery.data.items.map((candidate) => {
            const catalogWorkId = candidate.catalogWorkId;
            const selected = isSelected(catalogWorkId);

            return (
              <li
                key={catalogWorkId}
                className="flex items-center gap-3 rounded-xl border border-rule/60 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">
                    {candidate.display.title}
                  </p>
                  <p className="truncate text-xs text-ink-3">
                    {candidate.contributors.length > 0
                      ? candidate.contributors.join(', ')
                      : (candidate.display.subtitle ?? '')}
                  </p>
                </div>
                <Button
                  disabled={selected}
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    addOption({
                      contributors: candidate.contributors.join(', '),
                      coverUrl: candidate.coverUrl ?? null,
                      catalogWorkId,
                      subtitle: candidate.display.subtitle ?? null,
                      title: candidate.display.title,
                    })
                  }
                >
                  {selected
                    ? t('rooms.detail.polls.createDialog.reading.added')
                    : t('rooms.detail.polls.createDialog.reading.add')}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-3">
          {t('rooms.detail.polls.createDialog.reading.noResults')}
        </p>
      )}
    </div>
  );
}
