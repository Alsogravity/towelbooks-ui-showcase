'use client';

import { useCallback, type RefObject } from 'react';

import { classNames } from '../../className';
import { Icon } from '../Icon';
import { MenuOverlay } from '../MenuOverlay';
import {
  BASIC_EMOJI_OPTIONS,
  getDefaultEmojiLabel,
  type BasicEmojiOption,
} from './emojiOptions';
import { insertTextAtCaret } from './insertTextAtCaret';

import type { TextFieldElement } from './insertTextAtCaret';

export interface EmojiInsertBarProps {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  iconSize?: number;
  emojis?: readonly BasicEmojiOption[];
  getEmojiLabel?: (emoji: BasicEmojiOption) => string;
  maxLength?: number;
  menuLabel?: string;
  onValueChange: (nextValue: string) => void;
  targetRef: RefObject<TextFieldElement | null>;
  value: string;
}

export function EmojiInsertBar({
  ariaLabel = 'Insert emoji',
  className = '',
  disabled = false,
  iconSize = 20,
  emojis = BASIC_EMOJI_OPTIONS,
  getEmojiLabel = getDefaultEmojiLabel,
  maxLength,
  menuLabel = 'Choose an emoji',
  onValueChange,
  targetRef,
  value,
}: EmojiInsertBarProps) {
  const handleInsert = useCallback(
    (emoji: BasicEmojiOption) => {
      const element = targetRef.current;

      if (!element || disabled) {
        return;
      }

      insertTextAtCaret({
        element,
        maxLength,
        onValueChange,
        text: emoji,
        value,
      });
    },
    [disabled, maxLength, onValueChange, targetRef, value],
  );

  return (
    <MenuOverlay
      disabled={disabled}
      matchActivatorWidth={false}
      placement="bottom-start"
      portalled
      contentClassName="vui-emoji-insert-menu"
      contentProps={{ 'aria-label': menuLabel }}
      activator={({ activatorProps, ref }) => (
        <button
          {...activatorProps}
          ref={ref}
          type="button"
          className={classNames('vui-emoji-insert-bar__trigger', className)}
          disabled={disabled}
          aria-label={ariaLabel}
        >
          <Icon name="emoji-glyph" size={iconSize} />
        </button>
      )}
    >
      <div className="vui-emoji-insert-bar__grid">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="vui-emoji-insert-bar__button"
            aria-label={getEmojiLabel(emoji)}
            disabled={disabled}
            onClick={() => handleInsert(emoji)}
            onMouseDown={(event) => event.preventDefault()}
          >
            <span aria-hidden>{emoji}</span>
          </button>
        ))}
      </div>
    </MenuOverlay>
  );
}
