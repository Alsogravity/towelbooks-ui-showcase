import { type RoomVisibility } from '@towelbooks/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { getRoomVisibilityLabel } from '../../roomCopy';
import { useToast } from '../../../../components/feedback';
import { handleApiProblem } from '../../../../features/errors';
import { sdk } from '../../../../lib/sdk';
import { useI18n } from '../../../../i18n';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  Icon,
} from '../../../../components/primitives';

interface RoomVisibilityChangeDialogProps {
  roomId: string;
  currentVisibility: RoomVisibility;
  onClose: () => void;
}

export function RoomVisibilityChangeDialog({
  roomId,
  currentVisibility,
  onClose,
}: RoomVisibilityChangeDialogProps) {
  const { t } = useI18n();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVisibility, setSelectedVisibility] =
    useState<RoomVisibility>(currentVisibility);

  const updateMutation = useMutation({
    mutationFn: (visibility: RoomVisibility) =>
      sdk.rooms.update(roomId, { visibility }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['rooms', roomId] }),
        queryClient.invalidateQueries({
          queryKey: ['rooms', roomId, 'overview'],
        }),
        queryClient.invalidateQueries({ queryKey: ['rooms', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['rooms', 'discover'] }),
      ]);
      pushToast({
        title: t('rooms.detail.hero.visibility.saved', {
          fallback: 'Visibilidade atualizada.',
        }),
        variant: 'success',
      });
      onClose();
    },
    onError: (error) => {
      const { message } = handleApiProblem(error, {
        fallbackKey: 'rooms.detail.hero.visibility.error',
        t,
      });
      pushToast({ title: message, variant: 'error' });
    },
  });

  const options: Array<{
    id: RoomVisibility;
    icon: 'lock' | 'globe';
  }> = [
    { id: 'private', icon: 'lock' },
    { id: 'public', icon: 'globe' },
  ];

  return (
    <Dialog
      title={t('rooms.detail.hero.visibility.dialogTitle', {
        fallback: 'Alterar visibilidade da sala',
      })}
      onClose={onClose}
      closeButtonLabel={t('common.close')}
      showCloseButton
      size="sm"
    >
      <DialogBody>
        <div
          className="flex flex-col gap-3"
          role="radiogroup"
          aria-label={t('rooms.detail.hero.visibility.dialogTitle', {
            fallback: 'Alterar visibilidade da sala',
          })}
        >
          {options.map((option) => {
            const isSelected = selectedVisibility === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedVisibility(option.id)}
                className={[
                  'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-brick bg-brick-soft'
                    : 'border-rule hover:bg-paper-2',
                ].join(' ')}
              >
                <div
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-brick-soft text-brick'
                      : 'border border-rule bg-paper-2 text-ink-3',
                  ].join(' ')}
                >
                  <Icon name={option.icon} size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">
                    {getRoomVisibilityLabel(t, option.id)}
                  </span>
                  <span className="supporting-copy text-xs text-ink-2">
                    {option.id === 'private'
                      ? t('rooms.create.hints.private')
                      : t('rooms.create.hints.public')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </DialogBody>

      <DialogActions>
        <Button
          variant="tertiary"
          onClick={onClose}
          disabled={updateMutation.isPending}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={() => updateMutation.mutate(selectedVisibility)}
          disabled={
            selectedVisibility === currentVisibility || updateMutation.isPending
          }
          isLoading={updateMutation.isPending}
        >
          {t('rooms.detail.hero.visibility.save', { fallback: 'Salvar' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
