import { createCustomIcon } from './createCustomIcon';

// Artwork authored on a 20×20 grid; scale into the shared 24×24 Lucide optical frame.
export const ImagePenIcon = createCustomIcon(
  'ImagePenIcon',
  <g transform="scale(1.2)">
    <path d="M17 7.5V7c0-1.7 0-2.55-.33-3.2a3.1 3.1 0 0 0-1.36-1.36C14.66 2 13.8 2 12.1 2H7.9C6.2 2 5.34 2 4.69 2.44A3.1 3.1 0 0 0 3.33 3.8C3 4.45 3 5.3 3 7v5.1c0 1.7 0 2.55.33 3.2a3.1 3.1 0 0 0 1.36 1.36c.65.34 1.5.34 3.2.34" />
    <path d="M3 12.4 6.8 9l2.9 2.9" />
    <circle cx="12.4" cy="7.3" r="1.4" />
    <path d="m11.4 17.7 1.7-.13a2.2 2.2 0 0 0 1.46-.68l3.4-3.4a1.45 1.45 0 0 0 0-2.05l-.62-.62a1.45 1.45 0 0 0-2.05 0l-3.4 3.4a2.2 2.2 0 0 0-.68 1.46z" />
    <path d="m15 11.2 1.8 1.8" />
  </g>,
);
