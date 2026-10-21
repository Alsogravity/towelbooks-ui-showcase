import { useCallback, useState } from 'react';

import { ShareDialog } from './ShareDialog';
import { Button } from '../primitives';

type UseShareActionOptions = {
  actionLabel: string;
  getMessage: (fullUrl: string) => string;
  helperText?: string;
  subject: string;
  url: string;
};

export function useShareAction({
  actionLabel,
  getMessage,
  helperText,
  subject,
  url,
}: UseShareActionOptions) {
  const [isOpen, setIsOpen] = useState(false);

  const openShare = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeShare = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    closeShare,
    openShare,
    shareDialog: (
      <ShareDialog
        getMessage={getMessage}
        helperText={helperText}
        isOpen={isOpen}
        onClose={closeShare}
        subject={subject}
        url={url}
      />
    ),
    shareTriggerButton: (
      <Button
        aria-label={actionLabel}
        className="shrink-0"
        icon="share"
        size="sm"
        title={actionLabel}
        type="button"
        variant="icon"
        onClick={openShare}
      />
    ),
  };
}
