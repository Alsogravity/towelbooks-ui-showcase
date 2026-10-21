import {
  EXTERNAL_LINK_TITLE_MAX_LENGTH,
  EXTERNAL_LINKS_MAX_COUNT,
  SOURCE_URL_MAX_LENGTH,
  type ExternalLink,
  type ExternalLinkInput,
  isValidExternalLinkUrl,
  normalizeExternalLinkUrl,
} from '@towelbooks/schemas';
import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  FormTextField,
  Icon,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

type DraftLink = ExternalLinkInput & { clientId: string };

type ExternalLinksEditorProps = {
  initialLinks: ExternalLink[];
  onChange: (links: ExternalLinkInput[]) => void;
  serverError?: string | null;
};

function toDraftLinks(links: ExternalLink[]): DraftLink[] {
  return links.map((link) => ({
    clientId: link.id,
    title: link.title,
    url: link.url,
  }));
}

function toLinkInputs(drafts: DraftLink[]): ExternalLinkInput[] {
  return drafts.map(({ title, url }) => ({ title, url }));
}

export function ExternalLinksEditor({
  initialLinks,
  onChange,
  serverError,
}: ExternalLinksEditorProps) {
  const { t } = useI18n();
  const [drafts, setDrafts] = useState<DraftLink[]>(() =>
    toDraftLinks(initialLinks),
  );
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const editingDraft = drafts.find(
    (draft) => draft.clientId === editingClientId,
  );
  const canAdd = drafts.length < EXTERNAL_LINKS_MAX_COUNT;
  const isDialogOpen = editingClientId !== null;

  const commitDrafts = (nextDrafts: DraftLink[]) => {
    setDrafts(nextDrafts);
    onChange(toLinkInputs(nextDrafts));
  };

  const openEditor = (draft?: DraftLink) => {
    if (draft) {
      setEditingClientId(draft.clientId);
      setEditTitle(draft.title);
      setEditUrl(draft.url);
    } else {
      const clientId = `new-${crypto.randomUUID()}`;
      setEditingClientId(clientId);
      setEditTitle('');
      setEditUrl('');
    }
    setTitleError(null);
    setUrlError(null);
  };

  const closeEditor = () => {
    setEditingClientId(null);
    setEditTitle('');
    setEditUrl('');
    setTitleError(null);
    setUrlError(null);
  };

  const moveDraft = (clientId: string, direction: -1 | 1) => {
    const index = drafts.findIndex((draft) => draft.clientId === clientId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= drafts.length) {
      return;
    }
    const next = [...drafts];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item!);
    commitDrafts(next);
  };

  const saveEditor = () => {
    const title = editTitle.trim();
    const url = normalizeExternalLinkUrl(editUrl);

    let nextTitleError: string | null = null;
    let nextUrlError: string | null = null;

    if (!title) {
      nextTitleError = t('externalLinks.edit.titleRequired', {
        fallback: 'Title is required.',
      });
    } else if (title.length > EXTERNAL_LINK_TITLE_MAX_LENGTH) {
      nextTitleError = t('externalLinks.edit.titleTooLong', {
        fallback: `Title must be at most ${EXTERNAL_LINK_TITLE_MAX_LENGTH} characters.`,
      });
    }

    if (!url || !isValidExternalLinkUrl(url)) {
      nextUrlError = t('externalLinks.edit.urlInvalid', {
        fallback: 'Invalid URL.',
      });
    }

    setTitleError(nextTitleError);
    setUrlError(nextUrlError);

    if (nextTitleError || nextUrlError) {
      return;
    }

    const nextDraft: DraftLink = {
      clientId: editingClientId ?? `new-${crypto.randomUUID()}`,
      title,
      url,
    };
    const existingIndex = drafts.findIndex(
      (draft) => draft.clientId === editingClientId,
    );

    if (existingIndex >= 0) {
      const next = [...drafts];
      next[existingIndex] = nextDraft;
      commitDrafts(next);
    } else {
      commitDrafts([...drafts, nextDraft]);
    }
    closeEditor();
  };

  const removeEditingLink = () => {
    if (!editingClientId) {
      return;
    }
    commitDrafts(drafts.filter((draft) => draft.clientId !== editingClientId));
    closeEditor();
  };

  return (
    <>
      <section
        className="flex flex-col gap-4"
        aria-label={t('externalLinks.editor.title', { fallback: 'Links' })}
      >
        {drafts.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {drafts.map((draft, index) => (
              <li key={draft.clientId} className="flex items-center gap-2 py-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => openEditor(draft)}
                >
                  <span className="app-text-row-title block truncate text-ink">
                    {draft.title}
                  </span>
                  <span className="app-text-metadata block truncate text-ink-3">
                    {draft.url}
                  </span>
                </button>
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveDraft(draft.clientId, -1)}
                    aria-label={t('externalLinks.editor.moveUp', {
                      fallback: 'Move up',
                    })}
                  >
                    <Icon name="arrow-up" size={16} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={index === drafts.length - 1}
                    onClick={() => moveDraft(draft.clientId, 1)}
                    aria-label={t('externalLinks.editor.moveDown', {
                      fallback: 'Move down',
                    })}
                  >
                    <Icon name="chevron-down" size={16} aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {canAdd ? (
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2.5 text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick/40"
            onClick={() => openEditor()}
          >
            <span
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-current"
              aria-hidden="true"
            >
              <Icon name="plus" size={14} />
            </span>
            <span className="app-text-body">
              {t('externalLinks.editor.add', { fallback: 'Add link' })}
            </span>
          </button>
        ) : null}

        {serverError ? (
          <p className="app-text-body text-danger" role="alert">
            {serverError}
          </p>
        ) : null}
      </section>

      {isDialogOpen ? (
        <Dialog
          onClose={closeEditor}
          size="sm"
          title={
            editingDraft
              ? t('externalLinks.edit.title', { fallback: 'Edit link' })
              : t('externalLinks.add.title', { fallback: 'Add link' })
          }
          closeButtonLabel={t('common.close', { fallback: 'Close' })}
          showCloseButton
        >
          {({ close }) => (
            <>
              <DialogBody className="!gap-4">
                <FormTextField
                  id="external-link-title"
                  label={t('externalLinks.edit.titleLabel', {
                    fallback: 'Title',
                  })}
                  value={editTitle}
                  maxLength={EXTERNAL_LINK_TITLE_MAX_LENGTH}
                  error={titleError ?? undefined}
                  onChange={(event) => {
                    setEditTitle(event.target.value);
                    setTitleError(null);
                  }}
                />

                <FormTextField
                  id="external-link-url"
                  label={t('externalLinks.edit.urlLabel', {
                    fallback: 'Link',
                  })}
                  value={editUrl}
                  maxLength={SOURCE_URL_MAX_LENGTH}
                  error={urlError ?? undefined}
                  onChange={(event) => {
                    setEditUrl(event.target.value);
                    setUrlError(null);
                  }}
                />

                {editingDraft ? (
                  <Button
                    type="button"
                    variant="text"
                    className="![color:var(--danger)] hover:![color:var(--danger-strong)] active:![color:var(--danger-strong)]"
                    onClick={removeEditingLink}
                  >
                    {t('externalLinks.edit.remove', {
                      fallback: 'Remove link',
                    })}
                  </Button>
                ) : null}
              </DialogBody>
              <DialogActions>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => close()}
                >
                  {t('common.cancel', { fallback: 'Cancel' })}
                </Button>
                <Button type="button" onClick={saveEditor}>
                  {t('common.done', { fallback: 'Done' })}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}
    </>
  );
}
