export const RADIUS_LEVELS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type RadiusLevel = (typeof RADIUS_LEVELS)[number];

export const RADIUS_LEVEL_MIN = Number(RADIUS_LEVELS[0]);
export const RADIUS_LEVEL_MAX = Number(RADIUS_LEVELS[RADIUS_LEVELS.length - 1]);
export const RADIUS_LEVEL_STEP_PX = 4;

export function clampRadiusLevel(level: number) {
  return Math.min(
    RADIUS_LEVEL_MAX,
    Math.max(RADIUS_LEVEL_MIN, Math.trunc(level)),
  );
}

export function getRadiusLevelPx(level: number) {
  return `${clampRadiusLevel(level) * RADIUS_LEVEL_STEP_PX}px`;
}
