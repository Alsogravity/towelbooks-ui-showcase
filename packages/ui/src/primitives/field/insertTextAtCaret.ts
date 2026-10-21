export type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;

export interface InsertTextAtCaretOptions {
  element: TextFieldElement;
  maxLength?: number;
  onValueChange: (nextValue: string) => void;
  text: string;
  value: string;
}

function focusWithSelection(
  element: TextFieldElement,
  selectionStart: number,
  selectionEnd = selectionStart,
) {
  requestAnimationFrame(() => {
    element.focus();
    element.setSelectionRange(selectionStart, selectionEnd);
  });
}

export function insertTextAtCaret({
  element,
  maxLength,
  onValueChange,
  text,
  value,
}: InsertTextAtCaretOptions): boolean {
  const currentValue = element.value ?? value;
  const start = element.selectionStart ?? currentValue.length;
  const end = element.selectionEnd ?? currentValue.length;
  const selectedLength = end - start;
  let insertText = text;

  if (maxLength !== undefined) {
    const remaining = maxLength - currentValue.length + selectedLength;

    if (remaining <= 0) {
      return false;
    }

    if (insertText.length > remaining) {
      insertText = insertText.slice(0, remaining);
    }
  }

  const nextValue =
    currentValue.slice(0, start) + insertText + currentValue.slice(end);

  onValueChange(nextValue);

  const caret = start + insertText.length;
  focusWithSelection(element, caret);

  return true;
}
