import { type Library, type LibraryDetail } from '@towelbooks/schemas';
import type { ReactNode, Ref } from 'react';
import { Link } from 'react-router';

import { PageHeader } from '../../../components/layout';
import { getProfilePath } from '../../../app/profileRoutes';
import { Button, Tag } from '../../../components/primitives';
import { getLibraryDisplayName } from '../../../features/libraries/libraryCopy';
import { useI18n } from '../../../i18n';

type LibraryPageHeaderProps = {
  action?: ReactNode;
  canManage: boolean;
  editButtonRef?: Ref<HTMLButtonElement>;
  library: Library | LibraryDetail | null;
  onEdit?: () => void;
};

type LibraryVisitorContextProps = {
  library: Library | LibraryDetail | null;
  canManage: boolean;
};

function isLibraryDetail(
  library: Library | LibraryDetail,
): library is LibraryDetail {
  return 'owner' in library;
}

function LibraryOwnerLink({ library }: { library: LibraryDetail }) {
  return (
    <span className="block min-w-0 break-words">
      <Link
        to={getProfilePath(library.owner)}
        className="break-words text-brick hover:text-brick-2 hover:underline"
      >
        @{library.owner.username}
      </Link>
    </span>
  );
}

export function LibraryVisitorContext({
  canManage,
  library,
}: LibraryVisitorContextProps) {
  if (canManage || library === null || !isLibraryDetail(library)) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-2 app-text-page-description text-ink-2 lg:hidden">
      <LibraryOwnerLink library={library} />
      {library.description ? (
        <span className="block min-w-0 break-words">{library.description}</span>
      ) : null}
    </div>
  );
}

export function LibraryPageHeader({
  action,
  canManage,
  editButtonRef,
  library,
  onEdit,
}: LibraryPageHeaderProps) {
  const { t } = useI18n();
  const showRichMetadata = library !== null && !library.isDefault;
  const canEditLibrary =
    canManage && library != null && library.type !== 'room' && onEdit != null;

  const visitorLibrary =
    !canManage && library !== null && isLibraryDetail(library) ? library : null;
  const showDescription = showRichMetadata || visitorLibrary !== null;
  const description = showDescription ? (
    <span className="flex min-w-0 flex-col gap-2">
      {visitorLibrary ? <LibraryOwnerLink library={visitorLibrary} /> : null}
      {library?.description ? (
        <span className="block min-w-0 break-words">{library.description}</span>
      ) : null}
      {showRichMetadata && library?.type === 'room' ? (
        <span className="flex flex-wrap gap-2">
          <Tag variant="role">{t('libraries.type.room')}</Tag>
        </span>
      ) : null}
    </span>
  ) : undefined;

  const actions =
    canEditLibrary || action ? (
      <div className="flex flex-wrap items-center gap-2">
        {canEditLibrary ? (
          <Button
            ref={editButtonRef}
            onClick={onEdit}
            variant="secondary"
            prependIcon="pencil-line"
          >
            {t('libraries.detail.edit')}
          </Button>
        ) : null}
        {action}
      </div>
    ) : undefined;

  return (
    <PageHeader
      title={getLibraryDisplayName(
        library,
        t,
        canManage ? 'myLibrary.header.title' : 'page.libraryDetail.title',
      )}
      description={description}
      actions={actions}
    />
  );
}
