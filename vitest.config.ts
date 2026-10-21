import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['apps/showcase/src/**/*.test.ts'] },
});
