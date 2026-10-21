import { RATING_NOTE_MAX_LENGTH } from '@towelbooks/schemas';

import { getRatingStarClassName } from './rating-ui';
import {
  Alert,
  Button,
  Card,
  FormField,
  Icon,
  Textarea,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

export function CatalogRatingEditorCard({
  dismissFormError,
  draftNote,
  draftRating,
  formError,
  isDeletingRating,
  isSavingRating,
  onClose,
  onDraftNoteChange,
  onDraftRatingChange,
  onSubmit,
  viewerRatingExists,
}: {
  dismissFormError: () => void;
  draftNote: string;
  draftRating: number;
  formError: string | null;
  isDeletingRating: boolean;
  isSavingRating: boolean;
  onClose: (() => void) | null;
  onDraftNoteChange: (value: string) => void;
  onDraftRatingChange: (value: number) => void;
  onSubmit: () => void;
  viewerRatingExists: boolean;
}) {
  const { t } = useI18n();

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="app-text-section-title text-ink">
            <span className="inline-flex items-center gap-2">
              <Icon name="star" size={24} strokeWidth={1.7} />
              {viewerRatingExists
                ? t('catalog.workDetail.ratings.form.editTitle')
                : t('catalog.workDetail.ratings.form.createTitle')}
            </span>
          </h2>
        </div>
        {viewerRatingExists && onClose ? (
          <Button
            aria-label={t('common.close')}
            className="!h-auto !w-auto !bg-transparent !border-none hover:!bg-transparent"
            icon="x"
            iconSize={18}
            variant="ghost"
            onClick={onClose}
          />
        ) : null}
      </div>

      <FormField label={t('catalog.workDetail.ratings.form.ratingLabel')}>
        <div
          aria-label={t('catalog.workDetail.ratings.form.ratingLabel')}
          className="flex flex-wrap items-center gap-2"
          role="radiogroup"
        >
          {Array.from({ length: 5 }, (_, index) => {
            const rating = index + 1;
            const isActive = draftRating >= rating;

            return (
              <button
                key={rating}
                aria-checked={draftRating === rating}
                aria-label={t('catalog.workDetail.ratings.ratingOption', {
                  values: { rating },
                })}
                className={[
                  'rounded-full p-1.5 transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-2',
                  getRatingStarClassName(index, isActive),
                ].join(' ')}
                disabled={isSavingRating || isDeletingRating}
                role="radio"
                type="button"
                onClick={() => onDraftRatingChange(rating)}
              >
                <Icon
                  className={isActive ? 'fill-current' : ''}
                  name="star"
                  size={22}
                  strokeWidth={1.8}
                />
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField
        htmlFor="catalog-rating-note"
        label={t('catalog.workDetail.ratings.form.bodyLabel')}
      >
        <Textarea
          id="catalog-rating-note"
          disabled={isSavingRating || isDeletingRating}
          maxLength={RATING_NOTE_MAX_LENGTH}
          placeholder={t('catalog.workDetail.ratings.form.bodyPlaceholder')}
          rows={5}
          value={draftNote}
          onChange={(event) => onDraftNoteChange(event.currentTarget.value)}
        />
      </FormField>

      {formError ? (
        <Alert variant="error">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 flex-1">{formError}</span>
            <button
              type="button"
              onClick={dismissFormError}
              className="shrink-0 rounded-sm px-1 text-sm text-ink-3 transition-colors hover:text-ink"
            >
              {t('common.close')}
            </button>
          </div>
        </Alert>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          isLoading={isSavingRating}
          loadingLabel={t('catalog.workDetail.ratings.form.submitting')}
          onClick={onSubmit}
        >
          {viewerRatingExists
            ? t('catalog.workDetail.ratings.form.update')
            : t('catalog.workDetail.ratings.form.submit')}
        </Button>
      </div>
    </Card>
  );
}
