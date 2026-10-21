import { useState } from 'react';
import type { RoomMemberInvite } from '@towelbooks/schemas';

import { AppSubsection } from '../../../components/application';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../../components/feedback';
import {
  Avatar,
  Button,
  InlineConfirm,
  Input,
} from '../../../components/primitives';
import { handleApiProblem } from '../../errors';
import { useI18n } from '../../../i18n';
import { useRoomMemberInvitesManagement } from './useRoomMemberInvitesManagement';

type RoomMemberInvitesSectionVariant = 'form' | 'history' | 'full';

type RoomMemberInvitesSectionProps = {
  enabled: boolean;
  roomId: string;
  variant?: RoomMemberInvitesSectionVariant;
};

function MemberInviteRow({
  formatDate,
  invite,
  isRevoking,
  onRevoke,
}: {
  formatDate: ReturnType<typeof useI18n>['formatDate'];
  invite: RoomMemberInvite;
  isRevoking: boolean;
  onRevoke: (inviteId: string) => void;
}) {
  const { t } = useI18n();
  const [isConfirming, setIsConfirming] = useState(false);
  const displayName =
    invite.invitee.displayName?.trim() ||
    invite.invitee.username ||
    t('profile.defaultDisplayName');

  return (
    <article className="flex min-w-0 items-center justify-between gap-3 py-3 h-20">
      <Avatar
        background={invite.invitee.avatar.background}
        foreground={invite.invitee.avatar.foreground}
        imageAlt={displayName}
        imageUrl={invite.invitee.avatar.imageUrl}
        initial={invite.invitee.avatar.initial}
        size="lg"
        style={{ width: 56, height: 56 }}
        className={isConfirming ? 'hidden sm:flex' : undefined}
      />
      <div
        className={
          isConfirming ? 'hidden sm:block min-w-0 flex-1' : 'min-w-0 flex-1'
        }
      >
        <p className="app-text-row-title truncate text-ink leading-none">
          {displayName}
        </p>
        {invite.invitee.username ? (
          <p className="mt-0.5 truncate text-xs text-ink-3">
            {t('profile.handle', {
              values: { handle: invite.invitee.username },
            })}
          </p>
        ) : null}
        <p className="mt-0.5 text-xs text-ink-3">
          {new Date(invite.expiresAt) < new Date()
            ? t('rooms.memberInvites.expired', {
                values: { date: formatDate(invite.expiresAt) },
              })
            : t('rooms.memberInvites.expires', {
                values: { date: formatDate(invite.expiresAt) },
              })}
        </p>
      </div>
      <InlineConfirm
        confirmLabel={t('rooms.memberInvites.revoke.confirm')}
        confirmVariant="danger"
        isLoading={isRevoking}
        onConfirm={() => onRevoke(invite.id)}
        onConfirmingChange={setIsConfirming}
        triggerLabel={t('rooms.memberInvites.revoke.action')}
      />
    </article>
  );
}

const variantTitle: Record<
  RoomMemberInvitesSectionVariant,
  string | undefined
> = {
  form: undefined,
  full: 'rooms.memberInvites.section.title',
  history: undefined,
};

const variantDescription: Record<
  RoomMemberInvitesSectionVariant,
  string | undefined
> = {
  form: 'rooms.memberInvites.send.description',
  full: 'rooms.memberInvites.section.description',
  history: undefined,
};

const showForm: Record<RoomMemberInvitesSectionVariant, boolean> = {
  form: true,
  full: true,
  history: false,
};

const showList: Record<RoomMemberInvitesSectionVariant, boolean> = {
  form: false,
  full: true,
  history: true,
};

export function RoomMemberInvitesSection({
  enabled,
  roomId,
  variant = 'full',
}: RoomMemberInvitesSectionProps) {
  const { t, formatDate } = useI18n();
  const {
    createMutation,
    formError,
    identifier,
    invites,
    isError,
    isLoading,
    listError,
    pendingRevokeInviteId,
    refetch,
    revokeMutation,
    setIdentifier,
    submit,
  } = useRoomMemberInvitesManagement(roomId, enabled);

  const descriptionKey = variantDescription[variant];
  const titleKey = variantTitle[variant];
  const showForm_ = showForm[variant];
  const showList_ = showList[variant];

  const listContent = (
    <div className={showForm_ ? 'mt-4 border-t border-rule' : undefined}>
      {isLoading ? (
        <div className="py-6">
          <LoadingState
            label={{
              key: 'rooms.memberInvites.list.loading',
              fallback: 'Loading member invites...',
            }}
          />
        </div>
      ) : isError ? (
        <div className="py-6">
          <ErrorState
            title={{
              key: 'rooms.memberInvites.list.error.title',
              fallback: 'Unable to load member invites',
            }}
            body={{
              key: 'rooms.memberInvites.list.error.body',
              fallback: handleApiProblem(listError, {
                fallbackKey: 'rooms.memberInvites.list.error.body',
                t,
              }).message,
            }}
            action={
              <Button
                onClick={() => void refetch()}
                size="sm"
                type="button"
                variant="secondary"
              >
                {t('errors.action.retry')}
              </Button>
            }
          />
        </div>
      ) : invites.length === 0 ? (
        <div className="py-6">
          <EmptyState
            className="mb-0"
            icon="user-round-plus"
            title={{
              key: 'rooms.memberInvites.list.empty.title',
              fallback: 'No pending people invites',
            }}
            body={{
              key: 'rooms.memberInvites.list.empty.body',
              fallback:
                'Invite someone by username or email when they already have a TowelBooks account.',
            }}
          />
        </div>
      ) : (
        <div className="divide-y divide-rule">
          {invites.map((invite) => (
            <MemberInviteRow
              formatDate={formatDate}
              invite={invite}
              isRevoking={pendingRevokeInviteId === invite.id}
              key={invite.id}
              onRevoke={(inviteId) => revokeMutation.mutate(inviteId)}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (variant === 'history' && !isLoading && !isError && invites.length === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <EmptyState
          className="mb-0"
          icon="user-round-arrow-left"
          title={{
            key: 'rooms.memberInvites.list.empty.title',
            fallback: 'No pending people invites',
          }}
          body={{
            key: 'rooms.memberInvites.list.empty.body',
            fallback:
              'Invite someone by username or email when they already have a TowelBooks account.',
          }}
        />
      </section>
    );
  }

  return (
    <AppSubsection
      description={descriptionKey ? t(descriptionKey) : undefined}
      title={titleKey ? t(titleKey) : undefined}
    >
      {showForm_ ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Input
            aria-label={t('rooms.memberInvites.form.identifierLabel')}
            autoComplete="off"
            autoFocus={variant === 'form'}
            error={formError ?? undefined}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={t('rooms.memberInvites.form.identifierPlaceholder')}
            value={identifier}
          />
          <div className="flex justify-end">
            <Button
              isLoading={createMutation.isPending}
              loadingLabel={t('rooms.memberInvites.form.submitting')}
              type="submit"
            >
              {t('rooms.memberInvites.form.submit')}
            </Button>
          </div>
        </form>
      ) : null}

      {showList_ ? listContent : null}
    </AppSubsection>
  );
}
