/**
 * Shared responsive shelf grid: auto-fill columns with a ~150px preferred
 * minimum so leftover width grows into the tracks (no empty right gutter).
 * Empty tracks stay in place (auto-fill, not auto-fit), so incomplete last
 * rows keep cards in the first columns without stretching them across the row.
 * Tracks may shrink only enough to keep two columns on narrow viewports.
 */
export const CATALOG_SHELF_GRID_CLASS_NAME =
  'grid grid-cols-[repeat(auto-fill,minmax(min(150px,calc((100%-1.5rem)/2)),1fr))] items-start justify-items-start gap-x-6 gap-y-10 sm:grid-cols-[repeat(auto-fill,minmax(min(150px,calc((100%-2rem)/2)),1fr))] sm:gap-x-8 sm:gap-y-12';
