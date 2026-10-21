import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/screenshots', { recursive: true });
const authOnly = process.argv.includes('--auth-only');
const routes = { login: '/login', register: '/register' };
const browser = await chromium.launch();
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1440, height: 1000 },
    mobile: { width: 390, height: 844 },
  })) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
      locale: 'en-US',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    for (const [label, route] of Object.entries(
      authOnly
        ? routes
        : {
            dashboard: '/demo',
            collections: '/demo/collections',
            landing: '/',
            pricing: '/pricing',
            ...routes,
          },
    )) {
      await page.goto('http://127.0.0.1:3056' + route);
      await page.getByRole('heading').first().waitFor();
      await page
        .getByText(/Loading\.\.\./, { exact: true })
        .waitFor({ state: 'hidden' });
      await page.evaluate(() => document.fonts.ready);
      await page
        .getByRole('button', { name: 'Dismiss notice', exact: true })
        .click();
      await page.screenshot({
        path: `docs/screenshots/${label}-${name}.png`,
        fullPage:
          label in routes || (name === 'desktop' && label === 'dashboard'),
      });
    }
    if (authOnly) {
      await context.close();
      continue;
    }
    await page.goto('http://127.0.0.1:3056/demo#settings/preferences');
    await page.getByRole('radio', { name: 'Dark', exact: true }).check();
    await page.keyboard.press('Escape');
    await page.goto('http://127.0.0.1:3056/demo');
    await page.getByRole('heading').first().waitFor();
    await page
      .getByText(/Loading\.\.\./, { exact: true })
      .waitFor({ state: 'hidden' });
    await page.evaluate(() => document.fonts.ready);
    await page
      .getByRole('button', { name: 'Dismiss notice', exact: true })
      .click();
    await page.screenshot({
      path: `docs/screenshots/dashboard-dark-${name}.png`,
      fullPage: name === 'desktop',
    });
    await context.close();
  }
} finally {
  await browser.close();
}
