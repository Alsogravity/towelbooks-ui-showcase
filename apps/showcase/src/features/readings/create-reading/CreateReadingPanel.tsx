import { useState, type RefObject } from 'react';

import { MobilePanelShell } from '../../../components/overlay';
import {
  CreateReadingForm,
  type CreateReadingPanelHeader,
} from './CreateReadingForm';
import { useI18n } from '../../../i18n';

type CreateReadingPanelProps = {
  initialQuery?: string;
  roomId: string;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};

export function CreateReadingPanel({
  initialQuery,
  roomId,
  onClose,
  returnFocusRef,
}: CreateReadingPanelProps) {
  const { t } = useI18n();
  const [header, setHeader] = useState<CreateReadingPanelHeader>(() => ({
    title: t('rooms.readingForm.searchBook'),
  }));

  return (
    <MobilePanelShell
      back={header.back}
      closeLabel={t('common.close')}
      getReturnFocusElement={() => returnFocusRef.current}
      onClose={onClose}
      panelClassName="max-w-2xl"
      title={header.title}
      titleId="create-reading-panel-title"
    >
      <CreateReadingForm
        initialQuery={initialQuery}
        onCreated={onClose}
        onViewChange={setHeader}
        roomId={roomId}
      />
    </MobilePanelShell>
  );
}
