import { Navigate, useParams } from 'react-router';

import { LibraryDetailScreen } from './LibraryDetailScreen';

export function LibraryDetailPage() {
  const { libraryId } = useParams<{ libraryId: string }>();

  if (!libraryId) {
    return <Navigate to="/" replace />;
  }

  return <LibraryDetailScreen libraryId={libraryId} />;
}
