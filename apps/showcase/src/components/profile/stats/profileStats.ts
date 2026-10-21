export interface ProfileSummaryStats {
  booksReadCount: number;
  roomsCount: number;
  followersCount: number;
  followingCount: number;
  libraryBooksCount: number;
  ratingsCount: number;
  catalogReviewsCount: number;
}

export type ProfileStatKey = keyof ProfileSummaryStats;

export type ProfileSummaryStatDialogKey =
  'catalogReviews' | 'booksRead' | 'ratings' | 'rooms';
