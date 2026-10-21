import { COMMENT_BODY_MAX_LENGTH } from '@towelbooks/schemas';
import { type FocusEventHandler, type FormEventHandler, type Ref } from 'react';

import {
  Button,
  FormFieldError,
  Textarea,
} from '../../../components/primitives';

interface CommentComposerProps {
  actionsAlign?: 'end' | 'between';
  bodyLabel: string;
  cancelLabel: string;
  className?: string;
  disabled?: boolean;
  error?: string | null;
  errorId?: string;
  fieldId?: string;
  isActive?: boolean;
  isSubmitting?: boolean;
  onBlurCapture?: FocusEventHandler<HTMLFormElement>;
  onCancel?: () => void;
  onChange: (value: string) => void;
  onFocusCapture?: FocusEventHandler<HTMLFormElement>;
  onSubmit: () => void;
  placeholder: string;
  rows?: number;
  submitDisabled?: boolean;
  submitLabel: string;
  submittingLabel: string;
  textareaRef?: Ref<HTMLTextAreaElement>;
  value: string;
}

export function CommentComposer({
  actionsAlign = 'end',
  bodyLabel,
  cancelLabel,
  className,
  disabled = false,
  error = null,
  errorId,
  fieldId,
  isActive = true,
  isSubmitting = false,
  onBlurCapture,
  onCancel,
  onChange,
  onFocusCapture,
  onSubmit,
  placeholder,
  rows = 1,
  submitDisabled = false,
  submitLabel,
  submittingLabel,
  textareaRef,
  value,
}: CommentComposerProps) {
  const actionsClassName =
    actionsAlign === 'between'
      ? 'flex items-center justify-between gap-3'
      : 'flex justify-end gap-4';

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className={className ?? 'space-y-3'}
      onBlurCapture={onBlurCapture}
      onFocusCapture={onFocusCapture}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          aria-label={bodyLabel}
          className="resize-none"
          disabled={disabled}
          id={fieldId}
          maxLength={COMMENT_BODY_MAX_LENGTH}
          placeholder={placeholder}
          rows={rows}
          value={value}
          variant="underlined"
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
        />
        {error ? <FormFieldError id={errorId}>{error}</FormFieldError> : null}
      </div>

      {isActive ? (
        <div className={actionsClassName}>
          {onCancel ? (
            <Button
              disabled={isSubmitting}
              size="sm"
              type="button"
              variant="text"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            disabled={submitDisabled}
            isLoading={isSubmitting}
            loadingLabel={submittingLabel}
            size="sm"
            type="submit"
          >
            {submitLabel}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
