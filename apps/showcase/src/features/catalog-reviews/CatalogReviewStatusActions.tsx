import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
} from '../../components/primitives';
import { useI18n } from '../../i18n';

type CatalogReviewStatusActionsProps = {
  canDelete: boolean;
  canPublish: boolean;
  canSaveDraft: boolean;
  canUpdate: boolean;
  isDeleting: boolean;
  isPublishing: boolean;
  isSaving: boolean;
  onDelete: () => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onUpdate: () => void;
};

export function CatalogReviewStatusActions({
  canDelete,
  canPublish,
  canSaveDraft,
  canUpdate,
  isDeleting,
  isPublishing,
  isSaving,
  onDelete,
  onPublish,
  onSaveDraft,
  onUpdate,
}: CatalogReviewStatusActionsProps) {
  const { t } = useI18n();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        {canDelete ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving || isPublishing || isDeleting}
            onClick={() => setIsDeleteDialogOpen(true)}
            size="sm"
          >
            {isDeleting
              ? t('catalog.catalogReviewEditor.actions.deleting')
              : t('catalog.catalogReviewEditor.actions.delete')}
          </Button>
        ) : null}

        {canSaveDraft ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving || isPublishing || isDeleting}
            onClick={onSaveDraft}
            size="sm"
          >
            {isSaving
              ? t('catalog.catalogReviewEditor.actions.savingDraft')
              : t('catalog.catalogReviewEditor.actions.saveDraft')}
          </Button>
        ) : null}

        {canUpdate ? (
          <Button
            type="button"
            disabled={isSaving || isPublishing || isDeleting}
            onClick={onUpdate}
            size="sm"
          >
            {isSaving
              ? t('catalog.catalogReviewEditor.actions.updating')
              : t('catalog.catalogReviewEditor.actions.update')}
          </Button>
        ) : null}

        {canPublish ? (
          <Button
            type="button"
            disabled={isSaving || isPublishing || isDeleting}
            onClick={onPublish}
            size="sm"
          >
            {isPublishing
              ? t('catalog.catalogReviewEditor.actions.publishing')
              : t('catalog.catalogReviewEditor.actions.publish')}
          </Button>
        ) : null}
      </div>

      {isDeleteDialogOpen ? (
        <Dialog
          title={t('catalog.catalogReviewEditor.deleteDialog.title')}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          {({ close }) => (
            <>
              <DialogBody>
                <p className="text-sm leading-6 text-ink-2">
                  {t('catalog.catalogReviewEditor.deleteDialog.body')}
                </p>
              </DialogBody>
              <DialogActions>
                <Button
                  variant="secondary"
                  disabled={isDeleting}
                  onClick={() => close()}
                >
                  {t('catalog.catalogReviewEditor.deleteDialog.cancel')}
                </Button>
                <Button
                  variant="danger"
                  disabled={isDeleting}
                  onClick={() => close(() => onDelete())}
                >
                  {t('catalog.catalogReviewEditor.deleteDialog.confirm')}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      ) : null}
    </>
  );
}
