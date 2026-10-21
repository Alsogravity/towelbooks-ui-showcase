import { createCustomIcon } from './createCustomIcon';

// Geometry mirrors the canonical color mark (apps/web/public/assets/brand/mark.svg),
// scaled from its 64-grid into the Lucide 24-grid: two rounded pages, a faint
// center spine, and a bookmark centered on the right page.
export const BrandMarkIcon = createCustomIcon(
  'BrandMarkIcon',
  <>
    <path d="M12 3.45 H6.45 C3.68 3.45 2.18 5.14 2.18 7.65 V16.35 C2.18 18.86 3.68 20.55 6.45 20.55 H12 Z" />
    <path d="M12 3.45 H17.55 C20.32 3.45 21.83 5.14 21.83 7.65 V16.35 C21.83 18.86 20.32 20.55 17.55 20.55 H12 Z" />
    <path d="M12 4.2 V19.8" opacity="0.55" />
    <path
      d="M15.3 4.4 V11.5 L16.95 9.8 L18.6 11.5 V4.4 Z"
      fill="currentColor"
    />
  </>,
);
