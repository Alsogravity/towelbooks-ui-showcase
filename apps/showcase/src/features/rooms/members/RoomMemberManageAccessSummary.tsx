import { Tag } from '../../../components/primitives';
import { useI18n } from '../../../i18n';

import {
  getMemberAccessDisplay,
  getRoomMemberAccessSourceLabelKey,
  roomMemberAccessStatusVariant,
  sortAccessSources,
} from './roomMembersDisplay';

import type { RoomMember } from '../types';

type RoomMemberManageAccessSummaryProps = {
  member: RoomMember;
};

export function RoomMemberManageAccessSummary({
  member,
}: RoomMemberManageAccessSummaryProps) {
  const { formatDate, t } = useI18n();
  const display = getMemberAccessDisplay(member);

  if (display.kind === 'owner') {
    return (
      <p className="meta text-ink-3">
        {t('rooms.members.access.summary.owner')}
      </p>
    );
  }

  if (display.kind === 'admin') {
    return (
      <p className="meta text-ink-3">
        {t('rooms.members.access.display.admin')}
      </p>
    );
  }

  if (display.kind === 'none') {
    return (
      <p className="meta flex flex-wrap items-center gap-1.5 text-ink-3">
        <span>{t('rooms.members.access.summary.accessLabel')}</span>
        <Tag
          variant={roomMemberAccessStatusVariant.none}
          className="app-text-caption px-2 py-0.5"
        >
          {t('rooms.members.access.status.none')}
        </Tag>
      </p>
    );
  }

  if (display.kind === 'suspended') {
    const auditSources = sortAccessSources(
      member.access.grants
        .filter((grant) => grant.state === 'active')
        .map((grant) => grant.source),
    );

    return (
      <div className="meta flex flex-col gap-1.5 text-ink-3">
        <p className="flex flex-wrap items-center gap-1.5">
          <span>{t('rooms.members.access.summary.accessLabel')}</span>
          <Tag
            variant={roomMemberAccessStatusVariant.suspended}
            className="app-text-caption px-2 py-0.5"
          >
            {t('rooms.members.access.status.suspended')}
          </Tag>
          <span aria-hidden="true">·</span>
          <span>{t('rooms.members.access.summary.blocked')}</span>
          {auditSources.length > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{t('rooms.members.access.summary.sourcesLabel')}</span>
              {auditSources.map((source) => (
                <Tag
                  key={source}
                  variant="role"
                  className="app-text-caption px-2 py-0.5"
                >
                  {t(getRoomMemberAccessSourceLabelKey(source))}
                </Tag>
              ))}
            </>
          ) : null}
        </p>
      </div>
    );
  }

  const statusKey = `rooms.members.access.status.${display.kind}` as const;
  const expirationSummary =
    display.kind === 'active'
      ? display.expirationIso
        ? t('rooms.members.access.expiresOn', {
            values: { date: formatDate(display.expirationIso) },
          })
        : t('rooms.members.access.noExpiration')
      : display.expirationIso
        ? t('rooms.members.access.expiredOn', {
            values: { date: formatDate(display.expirationIso) },
          })
        : null;

  const sourceLabels =
    display.kind === 'active'
      ? display.activeSources.map((source) =>
          t(getRoomMemberAccessSourceLabelKey(source)),
        )
      : display.lastSource
        ? [t(getRoomMemberAccessSourceLabelKey(display.lastSource))]
        : [];

  return (
    <div className="meta flex flex-col gap-1.5 text-ink-3">
      <p className="flex flex-wrap items-center gap-1.5">
        <span>{t('rooms.members.access.summary.accessLabel')}</span>
        <Tag
          variant={roomMemberAccessStatusVariant[display.kind]}
          className="app-text-caption px-2 py-0.5"
        >
          {t(statusKey)}
        </Tag>
        {sourceLabels.length > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <span>
              {display.kind === 'active'
                ? t('rooms.members.access.summary.sourcesLabel')
                : t('rooms.members.access.summary.lastSourceLabel')}
            </span>
            {sourceLabels.map((label) => (
              <Tag
                key={label}
                variant="role"
                className="app-text-caption px-2 py-0.5"
              >
                {label}
              </Tag>
            ))}
          </>
        ) : null}
        {expirationSummary ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{expirationSummary}</span>
          </>
        ) : null}
      </p>
    </div>
  );
}
