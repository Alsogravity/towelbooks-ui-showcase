import {
  CATALOG_REVIEW_BODY_MAX_LENGTH,
  CATALOG_REVIEW_TITLE_MAX_LENGTH,
} from '@towelbooks/schemas';
import { useLayoutEffect, useRef } from 'react';

import { useI18n } from '../../i18n';

import type { CatalogReviewEditorFormValues } from './catalogReviewEditorCopy';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

type CatalogReviewFormProps = {
  errors: FieldErrors<CatalogReviewEditorFormValues>;
  isDisabled: boolean;
  register: UseFormRegister<CatalogReviewEditorFormValues>;
};

export function CatalogReviewForm({
  errors,
  isDisabled,
  register,
}: CatalogReviewFormProps) {
  const { t } = useI18n();
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const { ref: registerTitleRef, ...registerTitleRest } = register('title');
  const { ref: registerBodyRef, ...registerBodyRest } = register('body');

  useLayoutEffect(() => {
    [titleRef.current, bodyRef.current].forEach((el) => {
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    });
  }, []);

  return (
    <div className="space-y-16">
      <header className="space-y-6 text-center">
        <div className="group relative">
          <label htmlFor="catalog-review-title" className="sr-only">
            {t('catalog.catalogReviewEditor.labels.title')}
          </label>
          <textarea
            id="catalog-review-title"
            disabled={isDisabled}
            maxLength={CATALOG_REVIEW_TITLE_MAX_LENGTH}
            placeholder={t('catalog.catalogReviewEditor.placeholders.title')}
            rows={1}
            autoComplete="off"
            className={[
              'w-full resize-none border-none bg-transparent p-0 text-center font-display text-h1 font-semibold leading-[1.1] tracking-[-0.01em] text-ink outline-none placeholder:text-ink-4 focus:ring-0',
              errors.title ? 'text-brick' : '',
            ].join(' ')}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            {...registerTitleRest}
            ref={(e) => {
              registerTitleRef(e);
              titleRef.current = e;
            }}
          />
          {errors.title?.message && (
            <p className="mt-2 text-sm text-brick">{errors.title.message}</p>
          )}
        </div>
        <div className="mx-auto h-1 w-12 rounded-full bg-brick/20" />
      </header>

      <div className="relative">
        <div className="group relative mx-auto">
          <label htmlFor="catalog-review-body" className="sr-only">
            {t('catalog.catalogReviewEditor.labels.body')}
          </label>
          <textarea
            id="catalog-review-body"
            disabled={isDisabled}
            maxLength={CATALOG_REVIEW_BODY_MAX_LENGTH}
            placeholder={t('catalog.catalogReviewEditor.placeholders.body')}
            className={[
              'min-h-[30rem] w-full resize-none border-none bg-transparent p-0 text-xl leading-relaxed text-ink-2 outline-none placeholder:text-ink-4 focus:ring-0',
              errors.body ? 'text-brick' : '',
            ].join(' ')}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            {...registerBodyRest}
            ref={(e) => {
              registerBodyRef(e);
              bodyRef.current = e;
            }}
          />
          {errors.body?.message && (
            <p className="mt-2 text-sm text-brick">{errors.body.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-rule/30 to-transparent" />
      </div>
    </div>
  );
}
