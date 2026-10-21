export const PROFILE_STAT_PREVIEW_LIMIT = 6;

export function shouldShowProfilePreviewNotice(
  totalCount: number | undefined,
  shownCount: number,
): boolean {
  return totalCount != null && shownCount > 0 && totalCount > shownCount;
}

export function shouldShowProfilePreviewEyebrow(
  totalCount: number | undefined,
): boolean {
  return totalCount != null && totalCount > PROFILE_STAT_PREVIEW_LIMIT;
}
