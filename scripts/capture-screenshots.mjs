import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1440, height: 1000 },
    mobile: { width: 390, height: 844 },
  })) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const [label, route] of Object.entries({
      dashboard: '/demo',
      landing: '/',
      pricing: '/pricing',
    })) {
      await page.goto('http://127.0.0.1:3056' + route);
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
      await page.screenshot({
        path: `docs/screenshots/${label}-${name}.png`,
        fullPage: name === 'desktop' && label === 'dashboard',
      });
    }
    await page.goto('http://127.0.0.1:3056/demo/settings');
    await page
      .locator('main')
      .getByRole('button', { name: 'Escuro', exact: true })
      .click();
    await page
      .getByRole('link', { name: 'Início', exact: true })
      .filter({ visible: true })
      .click();
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    await page.screenshot({
      path: `docs/screenshots/dashboard-dark-${name}.png`,
      fullPage: name === 'desktop',
    });
    await context.close();
  }
} finally {
  await browser.close();
}
