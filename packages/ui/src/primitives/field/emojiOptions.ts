export const BASIC_EMOJI_OPTIONS = [
  '📚',
  '✨',
  '❤️',
  '😊',
  '🎉',
  '☕',
  '🌿',
  '📝',
  '🌙',
  '🔖',
  '💭',
  '🙂',
] as const;

export type BasicEmojiOption = (typeof BASIC_EMOJI_OPTIONS)[number];

const DEFAULT_EMOJI_LABELS: Record<BasicEmojiOption, string> = {
  '📚': 'Books',
  '✨': 'Sparkles',
  '❤️': 'Heart',
  '😊': 'Smiling face',
  '🎉': 'Party',
  '☕': 'Coffee',
  '🌿': 'Leaf',
  '📝': 'Memo',
  '🌙': 'Moon',
  '🔖': 'Bookmark',
  '💭': 'Thought',
  '🙂': 'Slight smile',
};

export function getDefaultEmojiLabel(emoji: BasicEmojiOption): string {
  return DEFAULT_EMOJI_LABELS[emoji];
}
