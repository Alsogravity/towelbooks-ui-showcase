import { useRef, useState } from 'react';

import {
  Dialog,
  DialogBody,
  Icon,
  InfoTooltipButton,
  Select,
} from '../../../components/primitives';
import { SettingsSelectRow } from '../../../pages/settings/ui/SettingsSelectRow';

import type { useI18n } from '../../../i18n';
import type { UseFormRegister } from 'react-hook-form';
import type { CreateInviteForm } from '../roomCopy';

type InviteAccessModeFieldProps = {
  register: UseFormRegister<CreateInviteForm>;
  t: ReturnType<typeof useI18n>['t'];
};

export function InviteAccessModeField({
  register,
  t,
}: InviteAccessModeFieldProps) {
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <SettingsSelectRow
        className="py-0"
        htmlFor="invite-access-mode"
        label={
          <span className="inline-flex items-center gap-1">
            {t('invites.form.accessTitle')}
            <InfoTooltipButton
              ref={infoButtonRef}
              ariaLabel={t('invites.form.access.infoAriaLabel')}
              onClick={() => setIsDialogOpen(true)}
            />
          </span>
        }
      >
        <Select
          id="invite-access-mode"
          listboxClassName="min-w-[150px]"
          matchActivatorWidth={false}
          variant="ghost"
          {...register('accessMode')}
        >
          <option value="open">{t('invites.form.access.open')}</option>
          <option value="restricted">
            {t('invites.form.access.restricted')}
          </option>
        </Select>
      </SettingsSelectRow>

      {isDialogOpen ? (
        <Dialog
          closeButtonLabel={t('common.close')}
          getReturnFocusElement={() => infoButtonRef.current}
          onClose={() => setIsDialogOpen(false)}
          showCloseButton
          title={t('invites.form.access.dialog.title')}
        >
          <DialogBody className="space-y-0">
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="link" size={16} className="shrink-0 text-ink-3" />
                <h3 className="text-base font-semibold text-ink">
                  {t('invites.form.access.dialog.link.title')}
                </h3>
              </div>
              <p className="supporting-copy text-ink-2">
                {t('invites.form.access.dialog.link.body')}
              </p>
            </section>

            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="mail" size={16} className="shrink-0 text-ink-3" />
                <h3 className="text-base font-semibold text-ink">
                  {t('invites.form.access.dialog.email.title')}
                </h3>
              </div>
              <p className="supporting-copy text-ink-2">
                {t('invites.form.access.dialog.email.body')}
              </p>
            </section>
          </DialogBody>
        </Dialog>
      ) : null}
    </>
  );
}
