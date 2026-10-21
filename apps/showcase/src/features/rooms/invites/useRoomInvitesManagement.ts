import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useToast } from '../../../components/feedback';
import { applyApiValidationErrors, createApiProblemToast } from '../../errors';
import { useI18n } from '../../../i18n';
import { sdk } from '../../../lib/sdk';
import {
  createInviteSchema,
  parseAllowedEmails,
  type CreateInviteForm,
} from '../roomCopy';
import { roomInviteDetailsQueryKey } from './useRoomInviteDetails';

import type { RoomInvite } from '../types';

const DEFAULT_EXPIRATION_HOURS = 24;
const INVITES_PAGE_SIZE = 20;

type CreatedInviteRevealState = {
  emailDeliverySummary: RoomInvite['emailDeliverySummary'];
  restrictionType: 'allowed_emails' | 'none';
  token: string;
};

export type InviteListState = {
  allInvites: RoomInvite[];
  total: number;
};

export type InviteListAction =
  { type: 'append'; items: RoomInvite[]; total: number } | { type: 'reset' };

export function inviteListReducer(
  state: InviteListState,
  action: InviteListAction,
): InviteListState {
  switch (action.type) {
    case 'append': {
      const byId = new Map(
        state.allInvites.map((invite) => [invite.id, invite]),
      );
      for (const item of action.items) {
        byId.set(item.id, {
          ...byId.get(item.id),
          ...item,
        });
      }
      return {
        allInvites: Array.from(byId.values()),
        total: action.total,
      };
    }
    case 'reset':
      return { allInvites: [], total: 0 };
  }
}

export function useRoomInvitesManagement(roomId: string, canManage: boolean) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [lastCreatedInvite, setLastCreatedInvite] =
    useState<CreatedInviteRevealState | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [pendingRevokeInviteId, setPendingRevokeInviteId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteListState, dispatchInviteList] = useReducer(inviteListReducer, {
    allInvites: [],
    total: 0,
  });

  const inviteSchema = createInviteSchema(t);

  const {
    data: invitesData,
    error: invitesError,
    isLoading: isLoadingInvites,
    isFetching: isFetchingInvites,
    refetch: refetchInvites,
  } = useQuery({
    queryKey: ['rooms', roomId, 'invites', currentPage],
    queryFn: () =>
      sdk.invites.listForRoom(roomId, {
        page: currentPage,
        pageSize: INVITES_PAGE_SIZE,
      }),
    enabled: Boolean(roomId) && canManage,
  });

  const prevScopeRef = useRef(`${roomId}::${canManage}`);

  useEffect(() => {
    if (prevScopeRef.current !== `${roomId}::${canManage}`) {
      prevScopeRef.current = `${roomId}::${canManage}`;
      dispatchInviteList({ type: 'reset' });
      setCurrentPage(1);
    }

    if (invitesData) {
      dispatchInviteList({
        type: 'append',
        items: invitesData.items,
        total: invitesData.total,
      });
    }
  }, [invitesData, roomId, canManage]);

  // Prefer freshly fetched page data when reducer state has not caught up yet.
  // Without this, the first paint after `isLoading` flips false can show the
  // empty-state "Create invite" control and race clicks into a no-op unmount.
  const allInvites =
    inviteListState.allInvites.length > 0
      ? inviteListState.allInvites
      : (invitesData?.items ?? []);
  const total =
    inviteListState.total > 0
      ? inviteListState.total
      : (invitesData?.total ?? 0);

  const hasMore = allInvites.length < total;
  const isLoadingMore = currentPage > 1 && isFetchingInvites;

  const loadMore = () => {
    if (hasMore && !isFetchingInvites) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    trigger,
    formState: { errors },
  } = useForm<CreateInviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      accessMode: 'open',
      allowedEmailsText: '',
      sendEmailInvites: false,
      maxUses: 1,
      expiresInHours: DEFAULT_EXPIRATION_HOURS,
    },
  });
  const accessMode = useWatch({ control, name: 'accessMode' });
  const allowedEmailsText = useWatch({
    control,
    name: 'allowedEmailsText',
  });
  const allowedEmailCount = parseAllowedEmails(allowedEmailsText).length;

  const createInviteMutation = useMutation({
    mutationFn: (data: CreateInviteForm) => {
      const allowedEmails =
        data.accessMode === 'restricted'
          ? parseAllowedEmails(data.allowedEmailsText)
          : undefined;
      return sdk.invites.create(roomId, {
        allowedEmails,
        expiresInHours: data.expiresInHours,
        maxUses: data.accessMode === 'restricted' ? undefined : data.maxUses,
        sendEmailInvites:
          data.accessMode === 'restricted' ? data.sendEmailInvites : undefined,
      });
    },
    onSuccess: (newInvite) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'invites'] });
      queryClient.invalidateQueries({
        queryKey: roomInviteDetailsQueryKey(roomId, newInvite.id),
      });
      dispatchInviteList({ type: 'reset' });
      setCurrentPage(1);
      reset({
        accessMode: 'open',
        allowedEmailsText: '',
        sendEmailInvites: false,
        maxUses: 1,
        expiresInHours: DEFAULT_EXPIRATION_HOURS,
      });
      setCopyStatus(null);
      if (newInvite.rawToken) {
        setLastCreatedInvite({
          emailDeliverySummary: newInvite.emailDeliverySummary,
          restrictionType: newInvite.restriction.type,
          token: newInvite.rawToken,
        });
      }
    },
    onError: (error: unknown) => {
      if (
        applyApiValidationErrors(error, setError, {
          allowedEmails: 'allowedEmailsText',
        }) > 0
      ) {
        return;
      }

      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'invites.form.error.create',
          t,
        }),
      );
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: (inviteId: string) => sdk.invites.revoke(roomId, inviteId),
    onSuccess: (_response, inviteId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'invites'] });
      queryClient.invalidateQueries({
        queryKey: roomInviteDetailsQueryKey(roomId, inviteId),
      });
    },
    onError: (error: unknown) => {
      pushToast(
        createApiProblemToast(error, {
          fallbackKey: 'invites.list.error.body',
          t,
        }),
      );
    },
  });

  const onSubmit = (data: CreateInviteForm) => {
    createInviteMutation.mutate(data);
  };

  const inviteUrl = lastCreatedInvite
    ? `${window.location.origin}/invites/accept?token=${lastCreatedInvite.token}`
    : null;

  const copyInviteLink = async () => {
    if (!inviteUrl) {
      return;
    }

    if (!navigator.clipboard) {
      setCopyStatus(t('invites.reveal.manualCopy'));
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus(t('invites.reveal.copied'));
    } catch {
      setCopyStatus(t('invites.reveal.copyFailed'));
    }
  };

  const handleRevokeInvite = (inviteId: string) => {
    setPendingRevokeInviteId(inviteId);
    revokeInviteMutation.mutate(inviteId, {
      onSettled: () => {
        setPendingRevokeInviteId((current) =>
          current === inviteId ? null : current,
        );
      },
    });
  };

  const dismissCreatedInvite = () => {
    setLastCreatedInvite(null);
    setCopyStatus(null);
  };

  return {
    control,
    copyInviteLink,
    copyStatus,
    accessMode,
    allowedEmailCount,
    createInviteMutation,
    createdInviteRestrictionType: lastCreatedInvite?.restrictionType ?? null,
    createdInviteEmailDeliverySummary:
      lastCreatedInvite?.emailDeliverySummary ?? null,
    dismissCreatedInvite,
    errors,
    handleRevokeInvite,
    handleSubmit,
    inviteUrl,
    invitesData,
    invitesError,
    isLoadingInvites,
    isLoadingMore,
    isRevokingInvite: revokeInviteMutation.isPending,
    loadMore,
    hasMore,
    allInvites,
    totalInvites: total,
    onSubmit,
    pendingRevokeInviteId,
    refetchInvites,
    register,
    t,
    trigger,
  };
}
