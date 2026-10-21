import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ROOM_NAME_MAX_LENGTH } from '@towelbooks/schemas';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PageShell } from '../../../components/layout/PageShell';
import {
  Alert,
  Button,
  ButtonLink,
  FormField,
  Input,
} from '../../../components/primitives';
import {
  createCreateRoomSchema,
  type CreateRoomForm,
  type CreateRoomFormInput,
} from '../../../features/rooms/roomCopy';
import { RoomVisibilityField } from '../../../features/rooms/ui/RoomVisibilityField';
import { RoomJoinPolicyField } from '../../../features/rooms/ui/RoomJoinPolicyField';
import {
  applyApiValidationErrors,
  handleApiProblem,
} from '../../../features/errors';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';

const createRoomErrorMessageKeys = {
  ROOM_CREATION_LIMIT_REACHED: 'rooms.create.error.limitReached',
} as const;

export function CreateRoomPage() {
  usePageTitle({ key: 'page.rooms.create.title', fallback: 'Create room' });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const createRoomSchema = createCreateRoomSchema(t);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomFormInput, undefined, CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      visibility: 'private',
      joinPolicy: 'invite_only',
    },
  });
  const visibilityValue = (useWatch({
    control,
    name: 'visibility',
  }) ?? 'private') as CreateRoomForm['visibility'];
  const joinPolicyValue = (useWatch({
    control,
    name: 'joinPolicy',
  }) ?? 'invite_only') as NonNullable<CreateRoomForm['joinPolicy']>;

  const onSubmit = async (data: CreateRoomForm) => {
    setServerError(null);
    try {
      const room = await sdk.rooms.create({
        ...data,
        ...(data.visibility === 'public' && data.joinPolicy
          ? { joinPolicy: data.joinPolicy }
          : {}),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms', 'discover'] }),
      ]);
      navigate(`/rooms/${room.id}`);
    } catch (error: unknown) {
      if (applyApiValidationErrors(error, setError) > 0) {
        return;
      }

      setServerError(
        handleApiProblem(error, {
          fallbackKey: 'rooms.create.error.submit',
          messageKeys: createRoomErrorMessageKeys,
          t,
        }).message,
      );
    }
  };

  return (
    <PageShell
      background="paper"
      className="relative z-10 flex flex-1 flex-col lg:h-full lg:min-h-0"
    >
      <PageContainer
        size="narrow"
        padding="none"
        className="flex min-h-[100dvh] flex-col justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:flex-1 lg:py-10"
      >
        <div className="w-full">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="mb-2 text-sm font-medium uppercase tracking-widest text-ink-3">
              {t('rooms.create.eyebrow')}
            </span>
            <h1 className="app-text-page-title text-ink">
              {t('rooms.create.title')}
            </h1>
          </div>

          <div className="mx-auto w-full max-w-md">
            {serverError && (
              <Alert variant="error" className="mb-8">
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                label={t('rooms.create.labels.name')}
                htmlFor="room-name"
                hideLabel
                error={errors.name?.message}
              >
                <Input
                  {...register('name')}
                  floatingLabel
                  id="room-name"
                  maxLength={ROOM_NAME_MAX_LENGTH}
                  type="text"
                  placeholder={t('rooms.create.labels.name')}
                  className="bg-vellum border-rule focus:border-brick"
                />
              </FormField>

              <div className="space-y-2">
                <input type="hidden" {...register('visibility')} />
                <RoomVisibilityField
                  errorMessage={errors.visibility?.message}
                  label={t('rooms.create.labels.visibility')}
                  visibilityValue={visibilityValue}
                  onVisibilityChange={(nextValue) => {
                    setValue('visibility', nextValue, { shouldDirty: true });
                    if (nextValue === 'private') {
                      setValue('joinPolicy', 'invite_only', {
                        shouldDirty: true,
                      });
                    }
                  }}
                />
              </div>

              {visibilityValue === 'public' ? (
                <div className="space-y-2">
                  <input type="hidden" {...register('joinPolicy')} />
                  <RoomJoinPolicyField
                    controlLayout="stacked"
                    errorMessage={errors.joinPolicy?.message}
                    joinPolicyValue={joinPolicyValue}
                    label={t('rooms.create.labels.joinPolicy')}
                    onJoinPolicyChange={(nextValue) => {
                      setValue('joinPolicy', nextValue, { shouldDirty: true });
                    }}
                    variant="settings"
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  size="lg"
                  className="w-full justify-center"
                >
                  {t('rooms.create.submit')}
                </Button>
                <ButtonLink
                  to="/rooms"
                  variant="ghost"
                  className="w-full justify-center"
                >
                  {t('rooms.create.cancel')}
                </ButtonLink>
              </div>
            </form>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
