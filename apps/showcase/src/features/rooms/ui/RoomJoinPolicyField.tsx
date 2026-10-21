import { type RoomJoinPolicy } from '@towelbooks/schemas';

import { AppControlRow } from '../../../components/application';
import {
  Icon,
  InfoTooltipButton,
  SegmentedControl,
} from '../../../components/primitives';
import { getRoomJoinPolicyLabel } from '../roomCopy';
import { useI18n } from '../../../i18n';

export interface RoomJoinPolicyFieldProps {
  errorMessage?: string;
  joinPolicyValue: RoomJoinPolicy;
  label: string;
  onJoinPolicyChange: (nextValue: RoomJoinPolicy) => void;
  controlLayout?: 'inline' | 'stacked';
  variant?: 'card' | 'settings';
}

const joinPolicyOptions = [
  { id: 'invite_only', icon: 'mail' },
  { id: 'request_to_join', icon: 'user-plus' },
  { id: 'open', icon: 'globe' },
] as const;

export function RoomJoinPolicyField({
  errorMessage,
  joinPolicyValue,
  label,
  onJoinPolicyChange,
  controlLayout = 'inline',
  variant = 'settings',
}: RoomJoinPolicyFieldProps) {
  const { t } = useI18n();

  if (variant !== 'settings') {
    return null;
  }

  return (
    <>
      <AppControlRow
        className={[
          '!py-0',
          controlLayout === 'stacked'
            ? '!flex-col !items-stretch !justify-start'
            : null,
        ]
          .filter(Boolean)
          .join(' ')}
        controlClassName={
          controlLayout === 'stacked'
            ? 'flex justify-start'
            : 'flex shrink-0 justify-start sm:justify-end'
        }
        label={
          <span className="inline-flex items-center gap-1">
            {label}
            <InfoTooltipButton
              ariaLabel={t('rooms.create.joinPolicy.infoAction')}
              dialogCloseLabel={t('common.close')}
              dialogTitle={label}
              mode="dialog"
              content={
                <div className="space-y-3">
                  {joinPolicyOptions.map((option) => (
                    <section key={option.id} className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name={option.icon}
                          size={14}
                          className="shrink-0 text-ink-3"
                        />
                        <span className="text-sm font-semibold text-ink">
                          {t(`rooms.joinPolicy.${option.id}`)}
                        </span>
                      </div>
                      <p className="supporting-copy text-xs text-ink-2">
                        {t(`rooms.joinPolicy.hints.${option.id}`)}
                      </p>
                    </section>
                  ))}
                </div>
              }
            />
          </span>
        }
        mobileLayout="stacked"
        control={
          <SegmentedControl
            ariaLabel={label}
            name="room-join-policy"
            onChange={onJoinPolicyChange}
            value={joinPolicyValue}
            segmentSize="content"
            segmentDisplay="icon-active-label md:icon-label"
            options={joinPolicyOptions.map((option) => {
              const optionLabel = getRoomJoinPolicyLabel(
                t,
                option.id as RoomJoinPolicy,
              );
              return {
                value: option.id,
                title: optionLabel,
                ariaLabel: optionLabel,
                icon: option.icon,
                label: optionLabel,
              };
            })}
          />
        }
      />
      {errorMessage ? (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </>
  );
}
