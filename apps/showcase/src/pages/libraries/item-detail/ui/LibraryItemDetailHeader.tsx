import { useEffect } from 'react';
import { Link } from 'react-router';

import { getProfilePath } from '../../../../app/profileRoutes';
import { BackLink } from '../../../../components/layout';
import { useRegisterPageHeaderBackAction } from '../../../../components/layout/PageHeaderBackActionContext';
import { CatalogCoverMedia } from '../../../../entities/reading/ui';
import { useI18n } from '../../../../i18n';

import type { CatalogCoverSource } from '../../../../entities/reading/ui';
import type { LibraryOwnerIdentity } from '@towelbooks/schemas';

interface LibraryItemDetailHeaderProps {
  author: string | null;
  backTo: string;
  coverSources: CatalogCoverSource[];
  readingSummaryLabel: string;
  themeSeed: string;
  title: string;
  owner: LibraryOwnerIdentity | null;
  readOnly: boolean;
}

export function LibraryItemDetailHeader({
  author,
  backTo,
  coverSources,
  readingSummaryLabel,
  themeSeed,
  title,
  owner,
  readOnly,
}: LibraryItemDetailHeaderProps) {
  const { t } = useI18n();
  const registerBackAction = useRegisterPageHeaderBackAction();
  const backLabel = t('myLibrary.items.backToLibrary');

  useEffect(() => {
    registerBackAction({ label: backLabel, to: backTo });
    return () => registerBackAction(null);
  }, [backLabel, backTo, registerBackAction]);

  return (
    <>
      <BackLink label={backLabel} to={backTo} />

      <header className="mb-12">
        <div className="flex flex-row items-start gap-4 sm:gap-10">
          <div className="w-[112px] shrink-0 sm:w-full sm:max-w-[180px] lg:max-w-[220px]">
            <div className="relative overflow-hidden rounded-sm bg-vellum/20 shadow-book transition-shadow">
              <CatalogCoverMedia
                author={author}
                coverDelivery={{ loading: 'eager', preferredVariant: 'detail' }}
                fit="natural"
                imageClassName="w-full transition-transform hover:scale-[1.02]"
                size="fluid"
                sources={coverSources}
                theme={(themeSeed.codePointAt(0) ?? 0) % 7}
                title={title}
                typographic={{
                  className: 'w-full rounded-sm',
                }}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-4 text-left">
            <div className="space-y-1">
              <h1 className="app-text-entity-title break-words text-ink">
                {title}
              </h1>
              {author && (
                <p className="app-text-entity-subtitle text-ink-3">{author}</p>
              )}
            </div>

            {readOnly && owner ? (
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 app-text-supporting-copy text-ink-2">
                <span className="min-w-0 break-words">
                  <span>{t('myLibrary.items.visitorContext.from')} </span>
                  <Link
                    className="break-words text-brick hover:text-brick-2 hover:underline"
                    to={getProfilePath(owner)}
                  >
                    @{owner.username}
                  </Link>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule/60 bg-paper-2 px-2.5 py-1 app-text-caption text-ink-2">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-ink-3"
                  />
                  {t('myLibrary.items.visitorContext.readOnly')}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-start gap-3">
              <span className="inline-flex items-center rounded-full border border-rule/50 bg-paper-2 px-3 py-1 text-xs font-semibold text-ink-3 shadow-sm">
                {readingSummaryLabel}
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
