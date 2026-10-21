import { z } from 'zod';

export const BANNER_PRESET_TYPES = [
  'illustration',
  'background',
  'gradient',
] as const;
export type BannerPresetType = (typeof BANNER_PRESET_TYPES)[number];

export const bannerPresetTypeSchema = z.enum(BANNER_PRESET_TYPES);

export const BANNER_PRESET_IDS = [
  'journey-through-the-ancient-kingdom',
  'library-of-lost-worlds',
  'messy-magic-school',
  'court-of-stars-and-thorns',
  'romance-under-the-moon',
  'room-of-unlikely-readers-1',
  'room-of-unlikely-readers-2',
  'botanical-leaves',
  'celestial-canopy',
  'library-arches',
  'ocean-waves',
  'empty-cross-sunrise',
  'gradient-paper-warm',
  'gradient-forest-gold',
  'gradient-brick-soft',
] as const;

export type BannerPresetId = (typeof BANNER_PRESET_IDS)[number];

export const DEFAULT_BANNER_PRESET_ID: BannerPresetId = 'gradient-paper-warm';

export const bannerPresetIdSchema = z.enum(BANNER_PRESET_IDS);

export type BannerPreset = {
  id: BannerPresetId;
  type: BannerPresetType;
  nameKey: string;
  assetPath?: string;
  gradientStops?: readonly [string, string, string];
};

export const BANNER_PRESETS: readonly BannerPreset[] = [
  {
    id: 'journey-through-the-ancient-kingdom',
    type: 'illustration',
    nameKey: 'banner.presets.journeyThroughTheAncientKingdom',
    assetPath:
      '/assets/banner-presets/journey-through-the-ancient-kingdom.webp',
  },
  {
    id: 'library-of-lost-worlds',
    type: 'illustration',
    nameKey: 'banner.presets.libraryOfLostWorlds',
    assetPath: '/assets/banner-presets/library-of-lost-worlds.webp',
  },
  {
    id: 'messy-magic-school',
    type: 'illustration',
    nameKey: 'banner.presets.messyMagicSchool',
    assetPath: '/assets/banner-presets/messy-magic-school.webp',
  },
  {
    id: 'court-of-stars-and-thorns',
    type: 'illustration',
    nameKey: 'banner.presets.courtOfStarsAndThorns',
    assetPath: '/assets/banner-presets/court-of-stars-and-thorns.webp',
  },
  {
    id: 'romance-under-the-moon',
    type: 'illustration',
    nameKey: 'banner.presets.romanceUnderTheMoon',
    assetPath: '/assets/banner-presets/romance-under-the-moon.webp',
  },
  {
    id: 'room-of-unlikely-readers-1',
    type: 'illustration',
    nameKey: 'banner.presets.roomOfUnlikelyReaders1',
    assetPath: '/assets/banner-presets/room-of-unlikely-readers-1.webp',
  },
  {
    id: 'room-of-unlikely-readers-2',
    type: 'illustration',
    nameKey: 'banner.presets.roomOfUnlikelyReaders2',
    assetPath: '/assets/banner-presets/room-of-unlikely-readers-2.webp',
  },
  {
    id: 'botanical-leaves',
    type: 'background',
    nameKey: 'banner.presets.botanicalLeaves',
    assetPath: '/assets/banner-presets/botanical-leaves.svg',
  },
  {
    id: 'celestial-canopy',
    type: 'background',
    nameKey: 'banner.presets.celestialCanopy',
    assetPath: '/assets/banner-presets/celestial-canopy.svg',
  },
  {
    id: 'library-arches',
    type: 'background',
    nameKey: 'banner.presets.libraryArches',
    assetPath: '/assets/banner-presets/library-arches.svg',
  },
  {
    id: 'ocean-waves',
    type: 'background',
    nameKey: 'banner.presets.oceanWaves',
    assetPath: '/assets/banner-presets/ocean-waves.svg',
  },
  {
    id: 'empty-cross-sunrise',
    type: 'background',
    nameKey: 'banner.presets.emptyCrossSunrise',
    assetPath: '/assets/banner-presets/empty-cross-sunrise.svg',
  },
  {
    id: 'gradient-paper-warm',
    type: 'gradient',
    nameKey: 'banner.presets.gradientPaperWarm',
    gradientStops: ['var(--paper-3)', 'var(--gold-soft)', 'var(--brick-soft)'],
  },
  {
    id: 'gradient-forest-gold',
    type: 'gradient',
    nameKey: 'banner.presets.gradientForestGold',
    gradientStops: ['var(--paper-2)', 'var(--forest-soft)', 'var(--gold-soft)'],
  },
  {
    id: 'gradient-brick-soft',
    type: 'gradient',
    nameKey: 'banner.presets.gradientBrickSoft',
    gradientStops: ['var(--vellum)', 'var(--brick-soft)', 'var(--paper-3)'],
  },
] as const;

const presetById = new Map(
  BANNER_PRESETS.map((preset) => [preset.id, preset] as const),
);

export function getBannerPreset(id: BannerPresetId): BannerPreset | undefined {
  return presetById.get(id);
}

export function isBannerPresetId(value: string): value is BannerPresetId {
  return (BANNER_PRESET_IDS as readonly string[]).includes(value);
}

export function resolveBannerPresetId(
  id: string | null | undefined,
): BannerPresetId {
  if (!id) {
    return DEFAULT_BANNER_PRESET_ID;
  }

  return isBannerPresetId(id) ? id : DEFAULT_BANNER_PRESET_ID;
}
