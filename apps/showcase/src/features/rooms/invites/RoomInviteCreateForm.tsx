import { ROOM_INVITE_ALLOWED_EMAILS_MAX } from '@towelbooks/schemas';
import { Controller } from 'react-hook-form';

import { AppSubsection } from '../../../components/application';
import {
  Button,
  Checkbox,
  FormSelectField,
  FormField,
  Input,
  Textarea,
} from '../../../components/primitives';
import { InviteAccessModeField } from './InviteAccessModeField';
import { type CreateInviteForm } from '../roomCopy';

import type { useI18n } from '../../../i18n';
import type { FormEventHandler } from 'react';
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormTrigger,
} from 'react-hook-form';

export const ROOM_INVITE_CREATE_FORM_ID = 'room-invite-create-form';

export const INVITE_EXPIRATION_PRESETS = [
  { hours: 24, labelKey: 'invites.form.expiresPresets.day' },
  { hours: 24 * 3, labelKey: 'invites.form.expiresPresets.threeDays' },
  { hours: 24 * 7, labelKey: 'invites.form.expiresPresets.week' },
  { hours: 24 * 30, labelKey: 'invites.form.expiresPresets.month' },
] as const;

export type RoomInviteCreateFormProps = {
  accessMode: CreateInviteForm['accessMode'];
  allowedEmailCount: number;
  control: Control<CreateInviteForm>;
  errors: FieldErrors<CreateInviteForm>;
  isSubmitting: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<CreateInviteForm>;
  showSubmitButton?: boolean;
  t: ReturnType<typeof useI18n>['t'];
  trigger: UseFormTrigger<CreateInviteForm>;
};

export function RoomInviteCreateForm({
  accessMode,
  allowedEmailCount,
  control,
  errors,
  isSubmitting,
  onSubmit,
  register,
  showSubmitButton = true,
  t,
  trigger,
}: RoomInviteCreateFormProps) {
  const maxUsesField = register('maxUses', { valueAsNumber: true });

  return (
    <div className="flex flex-col gap-5">
      <form
        id={ROOM_INVITE_CREATE_FORM_ID}
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-5"
      >
        <AppSubsection spacing="default">
          <InviteAccessModeField register={register} t={t} />

          {accessMode === 'restricted' ? (
            <>
              <FormField
                error={errors.allowedEmailsText?.message}
                hideLabel
                htmlFor="invite-allowed-emails"
                hint={t('invites.form.allowedEmailsHint')}
                label={t('invites.form.allowedEmailsLabel')}
              >
                <Textarea
                  id="invite-allowed-emails"
                  {...register('allowedEmailsText')}
                  floatingLabel
                  floatingLabelText={t('invites.form.allowedEmailsLabel')}
                  rows={6}
                  placeholder={t('invites.form.allowedEmailsPlaceholder')}
                />
                <p className="meta mt-1 text-ink-3">
                  {t('invites.form.allowedEmailsCount', {
                    values: {
                      count: allowedEmailCount,
                      max: ROOM_INVITE_ALLOWED_EMAILS_MAX,
                    },
                  })}
                </p>
              </FormField>

              <label className="flex items-center gap-2 rounded-[var(--radius-paper-3)] bg-paper-2 px-3 py-2 text-ink">
                <Controller
                  control={control}
                  name="sendEmailInvites"
                  render={({ field }) => (
                    <Checkbox
                      aria-label={t('invites.form.sendEmailInvitesLabel')}
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <span className="font-normal">
                  {t('invites.form.sendEmailInvitesLabel')}
                </span>
              </label>
            </>
          ) : null}

          <div
            className={
              accessMode === 'open' ? 'grid gap-5 sm:grid-cols-2' : 'grid gap-5'
            }
          >
            {accessMode === 'open' ? (
              <FormField
                error={errors.maxUses?.message}
                hideLabel
                htmlFor="invite-max-uses"
                label={t('invites.form.maxUsesLabel')}
              >
                <Input
                  id="invite-max-uses"
                  {...maxUsesField}
                  onChange={(event) => {
                    void maxUsesField.onChange(event);
                    void trigger('maxUses');
                  }}
                  floatingLabel
                  min={1}
                  max={50}
                  placeholder={t('invites.form.maxUsesLabel')}
                  type="number"
                />
              </FormField>
            ) : null}
            <FormSelectField
              error={errors.expiresInHours?.message}
              id="invite-expires"
              label={t('invites.form.expiresLabel')}
              {...register('expiresInHours', { valueAsNumber: true })}
            >
              {INVITE_EXPIRATION_PRESETS.map((preset) => (
                <option key={preset.hours} value={preset.hours}>
                  {t(preset.labelKey)}
                </option>
              ))}
            </FormSelectField>
          </div>
        </AppSubsection>

        {showSubmitButton ? (
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              loadingLabel={t('invites.form.submitting')}
            >
              {t('invites.form.submit')}
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
