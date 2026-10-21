import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  RoomMeeting,
  RoomMeetingLocationType,
  CreateRoomMeetingRequest,
} from '@towelbooks/schemas';
import { sdk } from '../../../../lib/sdk';
import { useI18n } from '../../../../i18n';
import {
  getEndLocalDateTimeParts,
  getLocalDateTimePartsState,
  getStartLocalDateTimeParts,
  resolveBrowserTimezone,
  timezoneLocalDateTimePartsToUtcIso,
  timezoneLocalDateTimeRangeFromUtcIso,
  validateLocalDateTimeRange,
  type LocalDateTimeRangeErrorCodes,
} from '../../../../lib/datetime';

export type MeetingDraft = {
  title: string;
  description: string;
  startsDate: string;
  startsTime: string;
  endsDate: string;
  endsTime: string;
  timezone: string;
  locationType: RoomMeetingLocationType;
  meetingUrl: string;
  locationText: string;
  readingId: string | null;
};

export function getMeetingsKey(roomId: string) {
  return ['rooms', roomId, 'meetings'] as const;
}

export function getReadingsKey(roomId: string, locale: string) {
  return ['rooms', roomId, 'readings', locale] as const;
}

function resolveDefaultTimezone(): string {
  return resolveBrowserTimezone();
}

function createEmptyDraft(): MeetingDraft {
  return {
    title: '',
    description: '',
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
    timezone: resolveDefaultTimezone(),
    locationType: 'online',
    meetingUrl: '',
    locationText: '',
    readingId: null,
  };
}

function draftFromMeeting(meeting: RoomMeeting): MeetingDraft {
  const schedule = timezoneLocalDateTimeRangeFromUtcIso(
    meeting.startsAt,
    meeting.endsAt,
    meeting.timezone,
  );

  return {
    title: meeting.title,
    description: meeting.description ?? '',
    startsDate: schedule.startsDate,
    startsTime: schedule.startsTime,
    endsDate: schedule.endsDate,
    endsTime: schedule.endsTime,
    timezone: meeting.timezone,
    locationType: meeting.locationType,
    meetingUrl: meeting.meetingUrl ?? '',
    locationText: meeting.locationText ?? '',
    readingId: meeting.readingId ?? null,
  };
}

function getMeetingScheduleErrors(
  draft: MeetingDraft,
): LocalDateTimeRangeErrorCodes {
  return validateLocalDateTimeRange({
    startsDate: draft.startsDate,
    startsTime: draft.startsTime,
    endsDate: draft.endsDate,
    endsTime: draft.endsTime,
  });
}

export function isMeetingDraftValid(
  draft: MeetingDraft,
  scheduleErrors: LocalDateTimeRangeErrorCodes,
): boolean {
  const hasUrl = draft.meetingUrl.trim().length > 0;
  const hasText = draft.locationText.trim().length > 0;
  const hasCompleteSchedule =
    getLocalDateTimePartsState(
      getStartLocalDateTimeParts({
        startsDate: draft.startsDate,
        startsTime: draft.startsTime,
        endsDate: draft.endsDate,
        endsTime: draft.endsTime,
      }),
    ) === 'complete' &&
    getLocalDateTimePartsState(
      getEndLocalDateTimeParts({
        startsDate: draft.startsDate,
        startsTime: draft.startsTime,
        endsDate: draft.endsDate,
        endsTime: draft.endsTime,
      }),
    ) === 'complete';
  const locationValid =
    draft.locationType === 'online'
      ? hasUrl
      : draft.locationType === 'in_person'
        ? hasText
        : hasUrl && hasText;

  return (
    draft.title.trim().length > 0 &&
    draft.timezone.trim().length > 0 &&
    hasCompleteSchedule &&
    !scheduleErrors.startsAt &&
    !scheduleErrors.endsAt &&
    locationValid
  );
}

function buildRequestBody(draft: MeetingDraft): CreateRoomMeetingRequest {
  const description = draft.description.trim();
  const meetingUrl = draft.meetingUrl.trim();
  const locationText = draft.locationText.trim();
  const timezone = draft.timezone.trim();

  return {
    title: draft.title.trim(),
    description: description.length > 0 ? description : null,
    startsAt: timezoneLocalDateTimePartsToUtcIso(
      {
        date: draft.startsDate,
        time: draft.startsTime,
      },
      timezone,
    )!,
    endsAt: timezoneLocalDateTimePartsToUtcIso(
      {
        date: draft.endsDate,
        time: draft.endsTime,
      },
      timezone,
    )!,
    timezone,
    locationType: draft.locationType,
    meetingUrl:
      draft.locationType === 'in_person' || meetingUrl.length === 0
        ? null
        : meetingUrl,
    locationText:
      draft.locationType === 'online' || locationText.length === 0
        ? null
        : locationText,
    readingId: draft.readingId,
  };
}

export function useRoomMeetingsTabState(roomId: string) {
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<RoomMeeting | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<RoomMeeting | null>(null);
  const [draft, setDraft] = useState<MeetingDraft>(createEmptyDraft);
  const scheduleErrors = getMeetingScheduleErrors(draft);

  const upcomingQuery = useQuery({
    queryKey: [...getMeetingsKey(roomId), 'upcoming'],
    queryFn: () => sdk.rooms.listMeetings(roomId, { scope: 'upcoming' }),
  });

  const pastQuery = useQuery({
    queryKey: [...getMeetingsKey(roomId), 'past'],
    queryFn: () => sdk.rooms.listMeetings(roomId, { scope: 'past' }),
  });

  const readingsQuery = useQuery({
    queryKey: getReadingsKey(roomId, locale),
    queryFn: () => sdk.readings.listForRoom(roomId),
  });

  const invalidateMeetings = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getMeetingsKey(roomId) }),
      queryClient.invalidateQueries({
        queryKey: ['rooms', roomId, 'activity-events'],
      }),
    ]);
  };

  const updateDraft = (patch: Partial<MeetingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const createMutation = useMutation({
    mutationFn: () => sdk.rooms.createMeeting(roomId, buildRequestBody(draft)),
    onSuccess: async () => {
      setIsCreateOpen(false);
      setDraft(createEmptyDraft());
      await invalidateMeetings();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      sdk.rooms.updateMeeting(
        roomId,
        editingMeeting!.id,
        buildRequestBody(draft),
      ),
    onSuccess: async () => {
      setEditingMeeting(null);
      setDraft(createEmptyDraft());
      await invalidateMeetings();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => sdk.rooms.cancelMeeting(roomId, cancelTarget!.id),
    onSuccess: async () => {
      setCancelTarget(null);
      await invalidateMeetings();
    },
  });

  const openCreate = () => {
    setDraft(createEmptyDraft());
    setIsCreateOpen(true);
  };

  const openEdit = (meeting: RoomMeeting) => {
    setEditingMeeting(meeting);
    setDraft(draftFromMeeting(meeting));
  };

  return {
    cancelMutation,
    cancelTarget,
    createMutation,
    draft,
    editingMeeting,
    isCreateOpen,
    isDraftValid: isMeetingDraftValid(draft, scheduleErrors),
    isLoading:
      upcomingQuery.isLoading || pastQuery.isLoading || readingsQuery.isLoading,
    mutationError:
      createMutation.error ?? updateMutation.error ?? cancelMutation.error,
    openCreate,
    openEdit,
    pastMeetings: pastQuery.data?.items ?? [],
    queryError: upcomingQuery.error ?? pastQuery.error ?? readingsQuery.error,
    readings: readingsQuery.data?.items ?? [],
    refetch: () => {
      void upcomingQuery.refetch();
      void pastQuery.refetch();
      void readingsQuery.refetch();
    },
    scheduleErrors,
    setCancelTarget,
    setEditingMeeting,
    setIsCreateOpen,
    updateDraft,
    updateMutation,
    upcomingMeetings: upcomingQuery.data?.items ?? [],
  };
}
