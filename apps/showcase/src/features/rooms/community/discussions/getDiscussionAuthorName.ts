type DiscussionAuthor = {
  displayName?: string | null;
  username: string;
};

export function getDiscussionAuthorName(author: DiscussionAuthor) {
  return author.displayName ?? `@${author.username}`;
}
