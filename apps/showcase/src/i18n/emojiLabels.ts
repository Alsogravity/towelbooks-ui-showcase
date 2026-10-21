import type { BasicEmojiOption } from '@towelbooks/ui';

const BASIC_EMOJI_LABEL_KEYS = {
  '📚': 'common.emoji.books',
  '✨': 'common.emoji.sparkles',
  '❤️': 'common.emoji.heart',
  '😊': 'common.emoji.smilingFace',
  '🎉': 'common.emoji.party',
  '☕': 'common.emoji.coffee',
  '🌿': 'common.emoji.leaf',
  '📝': 'common.emoji.memo',
  '🌙': 'common.emoji.moon',
  '🔖': 'common.emoji.bookmark',
  '💭': 'common.emoji.thought',
  '🙂': 'common.emoji.slightSmile',
} as const satisfies Record<BasicEmojiOption, string>;

export function getBasicEmojiLabel(
  t: (key: string) => string,
  emoji: BasicEmojiOption,
): string {
  return t(BASIC_EMOJI_LABEL_KEYS[emoji]);
}

export function createBasicEmojiLabelGetter(
  t: (key: string) => string,
): (emoji: BasicEmojiOption) => string {
  return (emoji) => getBasicEmojiLabel(t, emoji);
}
