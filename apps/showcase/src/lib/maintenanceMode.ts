/**
 * Build-time switch for serving the public site while application services are
 * unavailable. The value is baked into the Vite bundle and requires a rebuild
 * to change.
 */
export type MaintenanceModeEnv = {
  VITE_MAINTENANCE_MODE?: string;
};

export function isMaintenanceModeEnabled(env: MaintenanceModeEnv): boolean {
  return env.VITE_MAINTENANCE_MODE?.trim().toLowerCase() === 'true';
}
