import { resolveBannerPresetId } from '@towelbooks/schemas';
import { useState } from 'react';

import {
  Dialog,
  DialogBody,
  FormField,
  Icon,
} from '../../../components/primitives';
import {
  BannerPresetPicker,
  BannerPresetSurface,
} from '../../../features/banner-presets';
import { useI18n } from '../../../i18n';

const bannerPickerDialogPanelClassName =
  'app-dialog-panel relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-paper-3 bg-paper shadow-2xl outline-none md:max-w-4xl lg:max-w-5xl';

export function CreateRoomBannerField({
  bannerPresetId,
  onChange,
}: {
  bannerPresetId: string | null | undefined;
  onChange: (nextValue: string) => void;
}) {
  const { t } = useI18n();
  const [isBannerPickerOpen, setIsBannerPickerOpen] = useState(false);
  const resolvedBannerPresetId = resolveBannerPresetId(bannerPresetId);

  return (
    <>
      <FormField label={t('rooms.create.labels.banner')}>
        <div className="relative overflow-hidden rounded-2xl border border-rule transition-all">
          <BannerPresetSurface presetId={resolvedBannerPresetId} />
          <button
            type="button"
            onClick={() => setIsBannerPickerOpen(true)}
            className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-ink/20 bg-paper-2 text-ink-3 shadow-md transition-all hover:bg-paper-3 hover:text-ink active:scale-95"
            aria-label={t('rooms.create.banner.change')}
          >
            <Icon name="pencil-line" size={18} />
          </button>
        </div>
      </FormField>

      {isBannerPickerOpen ? (
        <Dialog
          title={t('rooms.create.banner.dialog.title')}
          onClose={() => setIsBannerPickerOpen(false)}
          closeButtonLabel={t('common.close')}
          panelClassName={bannerPickerDialogPanelClassName}
          showCloseButton
        >
          <DialogBody className="min-h-0 flex-1 overflow-y-auto p-0">
            <BannerPresetPicker
              value={resolvedBannerPresetId}
              onChange={(nextValue) => {
                onChange(nextValue);
                setIsBannerPickerOpen(false);
              }}
              layout="tabbed"
            />
          </DialogBody>
        </Dialog>
      ) : null}
    </>
  );
}
