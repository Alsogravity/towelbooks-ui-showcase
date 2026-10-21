import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrientationPayload } from '@towelbooks/schemas';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { FilterSelectableOption } from '../../components/filters';
import { Button, Dialog } from '../../components/primitives';
import { LoadingState } from '../../components/feedback';
import { useI18n } from '../../i18n';
import { sdk } from '../../lib/sdk';

import { useRecordInAppMessageReceipt } from './useInAppMessages';
import { OrientationIllustration } from './orientationIllustration';
import { readingCategoryPreferencesQueryKey } from '../preferences/readingCategoryPreferencesQuery';
import { homeCatalogQueryRoot } from '../catalog/queryKeys';

export type OnboardingMessageRendererProps = {
  messageKey: string;
  onResolved: () => void;
  payload: OrientationPayload;
};

const FULLSCREEN_OVERLAY_CLASS_NAME =
  'app-dialog-overlay fixed inset-0 z-50 flex';
const FULLSCREEN_PANEL_CLASS_NAME =
  'app-dialog-panel relative flex h-full w-full flex-col overflow-hidden bg-vellum text-ink outline-none';
const READING_CATEGORY_PREFERENCE_COUNT = 3;

/**
 * Renders the canonical onboarding flow. Intro steps are informational; the
 * final reading-category step is mandatory and is the only terminal path.
 */
export function OnboardingMessageRenderer({
  messageKey,
  onResolved,
  payload,
}: OnboardingMessageRendererProps) {
  const { locale, t } = useI18n();
  const recordReceipt = useRecordInAppMessageReceipt();
  const queryClient = useQueryClient();
  const headingId = useId();
  const [index, setIndex] = useState(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completionInFlightRef = useRef(false);
  const completedRef = useRef(false);
  const seenRef = useRef(false);

  const step = payload.steps[index];
  const isPreferencesStep = step?.type === 'reading_category_preferences';
  const taxonomyQuery = useQuery({
    enabled: isPreferencesStep,
    queryKey: ['catalog', 'taxonomy', 'active', locale],
    queryFn: () => sdk.catalog.listTaxonomyCategories(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const replacePreferencesMutation = useMutation({
    mutationFn: (categoryIds: string[]) =>
      sdk.users.me.replaceReadingCategoryPreferences({ categoryIds }),
    onSuccess: async (savedPreferences) => {
      queryClient.setQueryData(
        readingCategoryPreferencesQueryKey(locale),
        savedPreferences,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: readingCategoryPreferencesQueryKey(locale),
        }),
        queryClient.invalidateQueries({ queryKey: homeCatalogQueryRoot }),
      ]);
    },
  });

  useEffect(() => {
    if (seenRef.current) {
      return;
    }

    seenRef.current = true;
    recordReceipt.mutate({ messageKey, action: 'seen' });
  }, [messageKey, recordReceipt]);

  if (!step) {
    return null;
  }

  const isFirst = index === 0;
  const isLast = index === payload.steps.length - 1;
  const isSavePending = isSubmitting || replacePreferencesMutation.isPending;

  function goTo(next: number) {
    setIndex(Math.min(payload.steps.length - 1, Math.max(0, next)));
  }

  function toggleCategory(categoryId: string, checked: boolean) {
    setSaveError(false);
    setSelectedCategoryIds((previous) => {
      if (checked) {
        return previous.includes(categoryId)
          ? previous
          : [...previous, categoryId];
      }

      return previous.filter((id) => id !== categoryId);
    });
  }

  async function completeOnboarding() {
    if (
      !isPreferencesStep ||
      selectedCategoryIds.length !== READING_CATEGORY_PREFERENCE_COUNT ||
      completionInFlightRef.current ||
      completedRef.current
    ) {
      return;
    }

    completionInFlightRef.current = true;
    setIsSubmitting(true);
    setSaveError(false);

    try {
      await replacePreferencesMutation.mutateAsync(selectedCategoryIds);
      await recordReceipt.mutateAsync({ messageKey, action: 'completed' });
      completedRef.current = true;
      onResolved();
    } catch {
      completionInFlightRef.current = false;
      setIsSubmitting(false);
      setSaveError(true);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' && !isLast) {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === 'ArrowLeft' && !isFirst) {
      event.preventDefault();
      goTo(index - 1);
    }
  }

  const introStep = step.type === 'intro' ? step : null;
  const title = introStep
    ? t(`inAppMessages.onboarding.${messageKey}.steps.${index}.title`, {
        fallback: introStep.title,
      })
    : t('inAppMessages.onboarding.preferences.heading');
  const body = introStep
    ? t(`inAppMessages.onboarding.${messageKey}.steps.${index}.body`, {
        fallback: introStep.body,
      })
    : t('inAppMessages.onboarding.preferences.helper', {
        values: { count: READING_CATEGORY_PREFERENCE_COUNT },
      });

  return (
    <Dialog
      aria-labelledby={headingId}
      closeOnBackdrop={false}
      closeOnEscape={false}
      onClose={() => undefined}
      overlayClassName={FULLSCREEN_OVERLAY_CLASS_NAME}
      panelClassName={FULLSCREEN_PANEL_CLASS_NAME}
    >
      <div className="flex h-full w-full flex-col" onKeyDown={handleKeyDown}>
        <header className="flex items-center justify-between px-5 py-4 sm:px-8">
          <p className="app-text-metadata text-ink-3" aria-live="polite">
            {t('inAppMessages.onboarding.progress', {
              values: { current: index + 1, total: payload.steps.length },
            })}
          </p>
        </header>

        <div
          className={`flex min-h-0 flex-1 justify-center px-6 py-4 ${
            isPreferencesStep
              ? 'items-stretch overflow-hidden'
              : 'items-center overflow-y-auto'
          }`}
        >
          <div
            className={`flex w-full max-w-2xl flex-col text-center ${
              isPreferencesStep ? 'min-h-0' : ''
            }`}
          >
            {introStep ? (
              <>
                <div className="relative mb-9 flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="absolute h-44 w-44 rounded-full bg-brick/10 blur-2xl"
                  />
                  <span className="relative flex h-36 w-36 items-center justify-center rounded-full bg-paper text-brick ring-1 ring-rule/70 sm:h-40 sm:w-40">
                    <OrientationIllustration
                      illustration={introStep.illustration}
                      className="h-24 w-24 sm:h-28 sm:w-28"
                    />
                  </span>
                </div>

                <h2
                  id={headingId}
                  className="app-text-dialog-title text-balance text-ink"
                >
                  {title}
                </h2>
                <p className="app-text-body mt-4 text-pretty text-ink-2">
                  {body}
                </p>
              </>
            ) : (
              <section className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col text-left">
                <h2
                  id={headingId}
                  className="app-text-dialog-title text-balance text-ink"
                >
                  {title}
                </h2>
                <p className="app-text-body mt-4 text-pretty text-ink-2">
                  {body}
                </p>

                <fieldset className="mt-8 flex min-h-0 flex-1 flex-col">
                  <legend className="sr-only">{title}</legend>
                  <p
                    className="app-text-supporting-copy mb-4 text-ink-3"
                    aria-live="polite"
                  >
                    {t('inAppMessages.onboarding.preferences.selectedCount', {
                      values: {
                        selected: selectedCategoryIds.length,
                        total: READING_CATEGORY_PREFERENCE_COUNT,
                      },
                    })}
                  </p>

                  {taxonomyQuery.isLoading ? (
                    <LoadingState
                      label={{
                        key: 'inAppMessages.onboarding.preferences.loading',
                      }}
                    />
                  ) : null}

                  {taxonomyQuery.isError ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p
                        className="app-text-supporting-copy text-brick"
                        role="alert"
                      >
                        {t('inAppMessages.onboarding.preferences.error')}
                      </p>
                      <Button
                        onClick={() => void taxonomyQuery.refetch()}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {t('inAppMessages.onboarding.preferences.retry')}
                      </Button>
                    </div>
                  ) : null}

                  {!taxonomyQuery.isLoading &&
                  !taxonomyQuery.isError &&
                  taxonomyQuery.data?.categories.length === 0 ? (
                    <p
                      className="app-text-supporting-copy text-ink-3"
                      role="status"
                    >
                      {t('inAppMessages.onboarding.preferences.empty')}
                    </p>
                  ) : null}

                  {taxonomyQuery.data?.categories.length ? (
                    <ul
                      aria-label={t(
                        'settings.preferences.readingCategories.options',
                      )}
                      className="m-0 flex min-h-0 flex-1 list-none flex-wrap gap-2 overflow-y-auto rounded-md border border-rule/60 p-3 dark:border-night-fg/30"
                      role="list"
                    >
                      {taxonomyQuery.data.categories.map((category) => {
                        const isSelected = selectedCategoryIds.includes(
                          category.id,
                        );
                        const isSelectionLimitReached =
                          selectedCategoryIds.length >=
                          READING_CATEGORY_PREFERENCE_COUNT;

                        return (
                          <li key={category.id}>
                            <FilterSelectableOption
                              appearance="removable-chip"
                              disabled={
                                isSavePending ||
                                (!isSelected && isSelectionLimitReached)
                              }
                              isSelected={isSelected}
                              label={category.displayName}
                              onToggle={() =>
                                toggleCategory(category.id, !isSelected)
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {saveError ? (
                    <p
                      className="app-text-supporting-copy mt-4 text-brick"
                      role="alert"
                    >
                      {t('inAppMessages.onboarding.preferences.saveError')}
                    </p>
                  ) : null}
                </fieldset>
              </section>
            )}
          </div>
        </div>

        <footer className="flex flex-col gap-5 border-t border-rule/60 px-6 py-5 sm:px-8">
          <div
            className="flex items-center justify-center gap-2"
            role="presentation"
          >
            {payload.steps.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIndex === index
                    ? 'w-8 bg-brick'
                    : dotIndex < index
                      ? 'w-4 bg-brick/40'
                      : 'w-4 bg-rule'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            {isFirst ? (
              <span aria-hidden="true" />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goTo(index - 1)}
                disabled={isSavePending}
              >
                {t('inAppMessages.onboarding.back')}
              </Button>
            )}

            {isPreferencesStep ? (
              <Button
                disabled={
                  selectedCategoryIds.length !==
                    READING_CATEGORY_PREFERENCE_COUNT || isSavePending
                }
                isLoading={isSavePending}
                loadingLabel={t(
                  'inAppMessages.onboarding.preferences.submitting',
                )}
                onClick={() => void completeOnboarding()}
              >
                {saveError
                  ? t('inAppMessages.onboarding.preferences.retrySubmit')
                  : t('inAppMessages.onboarding.preferences.submit')}
              </Button>
            ) : (
              <Button variant="primary" onClick={() => goTo(index + 1)}>
                {t('inAppMessages.onboarding.next')}
              </Button>
            )}
          </div>
        </footer>
      </div>
    </Dialog>
  );
}
