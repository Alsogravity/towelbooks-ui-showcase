import { z } from 'zod';

export const AVATAR_HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const avatarHexSchema = z
  .string()
  .regex(AVATAR_HEX_PATTERN, 'Avatar background must be a #RRGGBB hex color.');

/** Anonymous preset backgrounds — 8 light, 8 dark, 8 neutral. */
export const AVATAR_PRESET_BACKGROUNDS = [
  // Light (8)
  '#D48AE0',
  '#AA47BD',
  '#7D57C1',
  '#77919D',
  '#EC417A',
  '#F6511E',
  '#68A039',
  '#EF6C00',
  // Dark (8)
  '#C1175C',
  '#BE360B',
  '#455A65',
  '#34691E',
  '#512DA7',
  '#00579B',
  '#004D40',
  '#3E2723',
  // Neutral (8)
  '#8C6E63',
  '#5D6AC0',
  '#6B7B8B',
  '#0098A7',
  '#0388D2',
  '#5D4138',
  '#00897B',
  '#7B1FA2',
] as const;

export const DEFAULT_AVATAR_BACKGROUND = AVATAR_PRESET_BACKGROUNDS[0];

export const AVATAR_TYPES = ['initial', 'image'] as const;
export type AvatarType = (typeof AVATAR_TYPES)[number];

export const avatarTypeSchema = z.enum(AVATAR_TYPES);

export const avatarImageUrlsSchema = z.object({
  '128': z.string().url(),
  '256': z.string().url(),
});
export type AvatarImageUrls = z.infer<typeof avatarImageUrlsSchema>;

export const avatarSchema = z.object({
  type: avatarTypeSchema,
  initial: z.string().min(1).max(2),
  background: avatarHexSchema,
  foreground: avatarHexSchema,
  imageUrl: z.string().nullable(),
  imageUrls: avatarImageUrlsSchema.nullable().optional(),
});

export type Avatar = z.infer<typeof avatarSchema>;

export const avatarBackgroundInputSchema = z.union([avatarHexSchema, z.null()]);

const AVATAR_INITIAL_FALLBACK = '?';

export function isValidAvatarHex(value: string): boolean {
  return AVATAR_HEX_PATTERN.test(value);
}

export function normalizeAvatarHex(value: string): string {
  if (!isValidAvatarHex(value)) {
    throw new Error('Avatar hex must match #RRGGBB.');
  }

  return value.toUpperCase();
}

function channelToLinear(channel: number): number {
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = normalizeAvatarHex(hex).slice(1);
  const red = channelToLinear(parseInt(normalized.slice(0, 2), 16) / 255);
  const green = channelToLinear(parseInt(normalized.slice(2, 4), 16) / 255);
  const blue = channelToLinear(parseInt(normalized.slice(4, 6), 16) / 255);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Derive a readable foreground from a validated background hex. */
export function deriveAvatarForeground(background: string): string {
  const normalizedBackground = normalizeAvatarHex(background);

  return relativeLuminance(normalizedBackground) > 0.179
    ? '#1A1714'
    : '#F4ECD8';
}

export function resolveAvatarAppearance(background: string): {
  background: string;
  foreground: string;
} {
  const normalizedBackground = normalizeAvatarHex(background);

  return {
    background: normalizedBackground,
    foreground: deriveAvatarForeground(normalizedBackground),
  };
}

function takeFirstGraphemeUpper(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const firstGrapheme = Array.from(trimmed)[0];

  if (!firstGrapheme) {
    return null;
  }

  return firstGrapheme.toLocaleUpperCase();
}

export function deriveAvatarInitial(
  displayName: string | null | undefined,
  username: string | null | undefined,
): string {
  if (displayName) {
    const fromDisplay = takeFirstGraphemeUpper(displayName);

    if (fromDisplay) {
      return fromDisplay;
    }
  }

  if (username) {
    const fromUsername = takeFirstGraphemeUpper(username);

    if (fromUsername) {
      return fromUsername;
    }
  }

  return AVATAR_INITIAL_FALLBACK;
}

export function deterministicBucketIndex(
  seed: string,
  bucketCount: number,
): number {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return hash % bucketCount;
}

function deterministicColorIndex(seed: string): number {
  return deterministicBucketIndex(seed, AVATAR_PRESET_BACKGROUNDS.length);
}

export function deriveDefaultAvatarAppearance(seed: string): {
  background: string;
  foreground: string;
} {
  const background =
    AVATAR_PRESET_BACKGROUNDS[deterministicColorIndex(seed)] ??
    DEFAULT_AVATAR_BACKGROUND;

  return resolveAvatarAppearance(background);
}

export type BuildAvatarInput = {
  avatarBackground?: string | null | undefined;
  avatarForeground?: string | null | undefined;
  avatarImageUrls?: AvatarImageUrls | null | undefined;
  avatarImageUrl: string | null | undefined;
  displayName: string | null | undefined;
  username: string | null | undefined;
};

export function buildAvatar(input: BuildAvatarInput): Avatar {
  const initial = deriveAvatarInitial(input.displayName, input.username);
  const imageUrl = input.avatarImageUrl ?? null;

  let background: string;
  let foreground: string;

  if (input.avatarBackground) {
    background = normalizeAvatarHex(input.avatarBackground);
    foreground = deriveAvatarForeground(background);
  } else {
    const defaultAppearance = deriveDefaultAvatarAppearance(
      input.username ?? '',
    );
    background = defaultAppearance.background;
    foreground = defaultAppearance.foreground;
  }

  return {
    type: imageUrl ? 'image' : 'initial',
    initial,
    background,
    foreground,
    imageUrl,
    imageUrls: imageUrl ? (input.avatarImageUrls ?? null) : null,
  };
}
