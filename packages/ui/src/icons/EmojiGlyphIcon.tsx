import { createCustomIcon } from './createCustomIcon';

export const EmojiGlyphIcon = createCustomIcon(
  'EmojiGlyphIcon',
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="10" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="0.75" fill="currentColor" stroke="none" />
    <path d="M8.5 14.5c1.2 1.5 2.8 2.25 3.5 2.25s2.3-.75 3.5-2.25" />
  </>,
);
