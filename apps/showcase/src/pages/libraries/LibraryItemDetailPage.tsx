import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { LibraryItemDetailContent } from './item-detail/ui/LibraryItemDetailContent';
import { ErrorState, LoadingState } from '../../components/feedback';
import {
  PageContainer,
  PageShell,
  PageStateShell,
} from '../../components/layout';
import { ButtonLink } from '../../components/primitives';
import { useAuth } from '../../features/auth/AuthContext';
import {
  libraryItemQueryKey,
  libraryQueryKey,
} from '../../features/libraries/queryInvalidation';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

export function LibraryItemDetailPage() {
  const { libraryId, libraryItemId } = useParams<{
    libraryId: string;
    libraryItemId: string;
  }>();
  const { locale, t } = useI18n();
  const { user } = useAuth();

  const libraryQuery = useQuery({
    enabled: !!libraryId,
    queryKey: libraryQueryKey(libraryId ?? ''),
    queryFn: () => sdk.libraries.get(libraryId!),
  });
  const canManage = libraryQuery.data?.ownerUserId === user?.id;

  const itemQuery = useQuery({
    enabled: !!libraryId && !!libraryItemId,
    queryKey: libraryItemQueryKey(
      libraryId ?? '',
      libraryItemId ?? '',
      locale,
      canManage ? 'owner' : 'viewer',
    ),
    queryFn: () => sdk.libraries.getItem(libraryId!, libraryItemId!),
  });

  const item = itemQuery.data;
  usePageTitle({ key: 'page.libraryItemDetail.title' });

  if (itemQuery.isLoading || libraryQuery.isLoading) {
    return (
      <PageStateShell>
        <LoadingState />
      </PageStateShell>
    );
  }

  if (itemQuery.isError || !item || !libraryId) {
    return (
      <PageStateShell>
        <ErrorState
          title={{
            key: canManage
              ? 'myLibrary.items.error.title'
              : 'libraries.items.error.other.title',
          }}
          body={{
            key: canManage
              ? 'myLibrary.items.error.body'
              : 'libraries.items.error.other.body',
          }}
          action={
            libraryId ? (
              <ButtonLink to={`/libraries/${libraryId}`}>
                {t('myLibrary.items.backToLibrary')}
              </ButtonLink>
            ) : undefined
          }
        />
      </PageStateShell>
    );
  }

  return (
    <PageShell background="paper" minHeight>
      <PageContainer size="comfortable" className="py-8 lg:py-12">
        <LibraryItemDetailContent
          canManage={canManage}
          key={item.id}
          item={item}
          libraryId={libraryId}
          owner={libraryQuery.data?.owner ?? null}
          ownerUserId={libraryQuery.data?.ownerUserId ?? ''}
        />
      </PageContainer>
    </PageShell>
  );
}
