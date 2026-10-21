import { type RoomVisibility } from '@towelbooks/schemas';

import { AppControlRow } from '../../../components/application';
import {
  Icon,
  InfoTooltipButton,
  SegmentedControl,
} from '../../../components/primitives';
import { getRoomVisibilityLabel } from '../roomCopy';
import { useI18n } from '../../../i18n';

export interface RoomVisibilityFieldProps {
  errorMessage?: string;
  label: string;
  visibilityValue: RoomVisibility;
  onVisibilityChange: (nextValue: RoomVisibility) => void;
  variant?: 'card' | 'settings';
}

const visibilityOptions = [
  { id: 'private', icon: 'lock' },
  { id: 'public', icon: 'globe' },
] as const;

export function RoomVisibilityField({
  errorMessage,
  label,
  visibilityValue,
  onVisibilityChange,
  variant = 'card',
}: RoomVisibilityFieldProps) {
  const { t } = useI18n();

  if (variant === 'settings') {
    return (
      <>
        <AppControlRow
          className="!py-0"
          label={
            <span className="inline-flex items-center gap-1">
              {label}
              <InfoTooltipButton
                ariaLabel={t('rooms.create.visibility.infoAction')}
                dialogCloseLabel={t('common.close')}
                dialogTitle={label}
                mode="dialog"
                content={
                  <div className="space-y-3">
                    <section className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name="lock"
                          size={14}
                          className="shrink-0 text-ink-3"
                        />
                        <span className="text-sm font-semibold text-ink">
                          {t('rooms.create.visibility.dialog.private.title')}
                        </span>
                      </div>
                      <p className="supporting-copy text-xs text-ink-2">
                        {t('rooms.create.visibility.dialog.private.body')}
                      </p>
                    </section>
                    <section className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name="globe"
                          size={14}
                          className="shrink-0 text-ink-3"
                        />
                        <span className="text-sm font-semibold text-ink">
                          {t('rooms.create.visibility.dialog.public.title')}
                        </span>
                      </div>
                      <p className="supporting-copy text-xs text-ink-2">
                        {t('rooms.create.visibility.dialog.public.body')}
                      </p>
                    </section>
                  </div>
                }
              />
            </span>
          }
          mobileLayout="inline"
          control={
            <SegmentedControl
              ariaLabel={label}
              name="room-visibility"
              onChange={onVisibilityChange}
              value={visibilityValue}
              iconSize={20}
              segmentSize="content"
              options={visibilityOptions.map((option) => {
                const optionLabel = getRoomVisibilityLabel(
                  t,
                  option.id as RoomVisibility,
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

  return (
    <>
      <p id="room-visibility-label" className="app-text-label text-ink-2">
        <span className="inline-flex items-center gap-1">
          {label}
          <InfoTooltipButton
            ariaLabel={t('rooms.create.visibility.infoAction')}
            content={
              <div className="space-y-3">
                <section className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      name="lock"
                      size={14}
                      className="shrink-0 text-ink-3"
                    />
                    <span className="text-sm font-semibold text-ink">
                      {t('rooms.create.visibility.dialog.private.title')}
                    </span>
                  </div>
                  <p className="supporting-copy text-xs text-ink-2">
                    {t('rooms.create.visibility.dialog.private.body')}
                  </p>
                </section>
                <section className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      name="globe"
                      size={14}
                      className="shrink-0 text-ink-3"
                    />
                    <span className="text-sm font-semibold text-ink">
                      {t('rooms.create.visibility.dialog.public.title')}
                    </span>
                  </div>
                  <p className="supporting-copy text-xs text-ink-2">
                    {t('rooms.create.visibility.dialog.public.body')}
                  </p>
                </section>
              </div>
            }
            dialogCloseLabel={t('common.close')}
            dialogTitle={t('rooms.create.visibility.dialog.title')}
            mode="dialog"
          />
        </span>
      </p>
      <div
        className="flex flex-row gap-3"
        role="group"
        aria-labelledby="room-visibility-label"
      >
        {visibilityOptions.map((visibilityOption) => (
          <button
            key={visibilityOption.id}
            type="button"
            onClick={() =>
              onVisibilityChange(visibilityOption.id as RoomVisibility)
            }
            aria-pressed={visibilityValue === visibilityOption.id}
            className={[
              'flex flex-1 flex-col gap-2 rounded-xl border p-4 text-left transition-all',
              visibilityValue === visibilityOption.id
                ? 'border-brick bg-brick-soft text-ink'
                : 'border-rule text-ink-4 hover:bg-paper-2 hover:text-ink',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <div
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg',
                  visibilityValue === visibilityOption.id
                    ? 'bg-brick-soft text-brick'
                    : 'border border-rule bg-paper-2 text-ink-3',
                ].join(' ')}
              >
                <Icon name={visibilityOption.icon} size={14} />
              </div>
              <span className="text-sm font-semibold text-ink">
                {getRoomVisibilityLabel(
                  t,
                  visibilityOption.id as RoomVisibility,
                )}
              </span>
            </div>
          </button>
        ))}
      </div>
      {errorMessage ? (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </>
  );
}
