import { useState } from 'react';
import { Button, Dialog, Input, Textarea } from '@towelbooks/ui';
import type { Book, LibraryItem } from '../demo/data';
import { updateReading } from '../demo/data';
import { useDemo } from '../demo/DemoContext';
import { useI18n } from '../i18n';
export function ReadingEditor({
  book,
  item,
  onClose,
}: {
  book: Book;
  item: LibraryItem;
  onClose: () => void;
}) {
  const { ui } = useI18n();
  const { setLibrary, setNotice } = useDemo();
  const [page, setPage] = useState(String(item.page));
  const [note, setNote] = useState(item.note);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={ui('edit')}
      description={book.title}
      panelClassName="reading-dialog"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = Number(page);
          if (!Number.isInteger(value) || value < 0 || value > book.pages)
            return;
          setLibrary((items) => updateReading(items, book, value, note));
          setNotice(ui('saved'));
          onClose();
        }}
      >
        <label className="form-label">
          {ui('page')}
          <Input
            type="number"
            required
            min={0}
            max={book.pages}
            step={1}
            value={page}
            onChange={(e) => setPage(e.target.value)}
          />
        </label>
        <label className="form-label">
          {ui('note')}
          <Textarea
            maxLength={1000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose}>
            {ui('cancel')}
          </Button>
          <Button type="submit">{ui('save')}</Button>
        </div>
      </form>
    </Dialog>
  );
}
