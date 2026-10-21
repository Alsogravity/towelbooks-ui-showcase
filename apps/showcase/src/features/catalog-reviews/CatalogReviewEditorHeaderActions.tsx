import { Icon } from '../../components/primitives';
import { useI18n } from '../../i18n';
import { CatalogReviewStatusActions } from './CatalogReviewStatusActions';

export interface CatalogReviewEditorHeaderActionsProps {
  canDelete: boolean;
  canPublish: boolean;
  canSaveDraft: boolean;
  canUpdate: boolean;
  displayMode: 'edit' | 'readonly';
  isDeleting: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  onDelete: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onUpdate: () => void;
  onDisplayModeChange: (mode: 'edit' | 'readonly') => void;
}

export function CatalogReviewEditorHeaderActions({
  canDelete,
  canPublish,
  canSaveDraft,
  canUpdate,
  displayMode,
  isDeleting,
  isPublishing,
  isSaving,
  onDelete,
  onPublish,
  onSaveDraft,
  onUpdate,
  onDisplayModeChange,
}: CatalogReviewEditorHeaderActionsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-4">
      <fieldset aria-label={t('catalog.catalogReviewEditor.mode.ariaLabel')}>
        <div className="inline-flex items-center gap-1 rounded-[18px] border border-rule bg-paper-2/80 p-1 backdrop-blur-sm">
          <label
            className="block cursor-pointer"
            title={t('catalog.catalogReviewEditor.mode.edit')}
          >
            <input
              checked={displayMode === 'edit'}
              className="peer sr-only"
              name="displayMode"
              onChange={() => onDisplayModeChange('edit')}
              type="radio"
              value="edit"
            />
            <span
              className={[
                'flex h-9 w-12 items-center justify-center rounded-[14px] text-ink-3 transition-colors',
                'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brick',
                'hover:bg-paper hover:text-ink',
                'peer-checked:bg-paper peer-checked:text-ink peer-checked:shadow-2',
              ].join(' ')}
            >
              <Icon name="pencil-line" size={16} className="text-inherit" />
              <span className="sr-only">
                {t('catalog.catalogReviewEditor.mode.edit')}
              </span>
            </span>
          </label>
          <label
            className="block cursor-pointer"
            title={t('catalog.catalogReviewEditor.mode.readonly')}
          >
            <input
              checked={displayMode === 'readonly'}
              className="peer sr-only"
              name="displayMode"
              onChange={() => onDisplayModeChange('readonly')}
              type="radio"
              value="readonly"
            />
            <span
              className={[
                'flex h-9 w-12 items-center justify-center rounded-[14px] text-ink-3 transition-colors',
                'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brick',
                'hover:bg-paper hover:text-ink',
                'peer-checked:bg-paper peer-checked:text-ink peer-checked:shadow-2',
              ].join(' ')}
            >
              <Icon name="eye" size={16} className="text-inherit" />
              <span className="sr-only">
                {t('catalog.catalogReviewEditor.mode.readonly')}
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div aria-hidden className="h-8 w-px bg-rule" />

      <CatalogReviewStatusActions
        canDelete={canDelete}
        canPublish={canPublish}
        canSaveDraft={canSaveDraft}
        canUpdate={canUpdate}
        isDeleting={isDeleting}
        isPublishing={isPublishing}
        isSaving={isSaving}
        onDelete={onDelete}
        onPublish={onPublish}
        onSaveDraft={onSaveDraft}
        onUpdate={onUpdate}
      />
    </div>
  );
}
