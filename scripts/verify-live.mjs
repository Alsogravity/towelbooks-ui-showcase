import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = new URL('https://towelbooks-ui-showcase.pages.dev');
const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const routes = [
  '/',
  '/pricing',
  '/demo',
  '/demo/collections',
  `/demo/collections/${uid(500)}`,
  '/demo/catalog',
  `/demo/catalog/${uid(100)}`,
  `/demo/libraries/${uid(2)}`,
  `/demo/libraries/${uid(2)}/items/${uid(300)}`,
  '/demo/rooms',
  `/demo/rooms/${uid(600)}`,
  `/demo/rooms/${uid(600)}/readings/${uid(700)}`,
  '/demo/peter_parker',
];
const browser = await chromium.launch();
const summary = [];
try {
  for (const [name, viewport] of Object.entries({
    desktop: { width: 1440, height: 1000 },
    mobile: { width: 390, height: 844 },
  })) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'reduce',
      locale: 'en-US',
    });
    const page = await context.newPage();
    const errors = [],
      unexpected = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('request', (request) => {
      if (
        new URL(request.url()).origin !== base.origin ||
        ['fetch', 'xhr', 'websocket', 'eventsource'].includes(
          request.resourceType(),
        )
      )
        unexpected.push(request.url());
    });
    for (const route of routes) {
      const response = await page.goto(new URL(route, base).href);
      assert.equal(response.status(), 200, route);
      const headers = response.headers();
      assert.ok(
        headers['content-security-policy']?.includes("connect-src 'none'"),
      );
      assert.ok(
        headers['content-security-policy']?.includes("frame-ancestors 'none'"),
      );
      assert.equal(headers['x-content-type-options'], 'nosniff');
      await page.getByRole('heading').first().waitFor();
      await page
        .getByText(/Loading\.\.\.|Carregando\.\.\./, { exact: true })
        .waitFor({ state: 'hidden' });
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route + ' overflows',
      );
      assert.equal(
        await page
          .getByText(
            /Something went wrong|Could not load|We couldn’t load|Unexpected error/i,
          )
          .count(),
        0,
        route,
      );
    }
    await page.goto(new URL('/demo/collections', base).href);
    await page
      .getByRole('button', { name: 'New collection', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog
      .getByRole('textbox', { name: 'Name', exact: true })
      .fill('Fictional verification shelf');
    await dialog
      .getByRole('button', { name: 'Create collection', exact: true })
      .click();
    await page
      .getByRole('link', { name: 'Fictional verification shelf', exact: true })
      .waitFor();
    await page.reload();
    await page.getByRole('link', { name: 'Wishlist', exact: true }).waitFor();
    assert.equal(
      await page
        .getByRole('link', {
          name: 'Fictional verification shelf',
          exact: true,
        })
        .count(),
      0,
    );
    await page.goto(new URL('/demo#settings/preferences', base).href);
    await page.getByRole('radio', { name: 'Dark', exact: true }).check();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.getByRole('combobox', { name: 'Language', exact: true }).click();
    await page
      .getByRole('option', { name: 'Português (Brasil)', exact: true })
      .click();
    await page
      .getByRole('heading', { name: 'Preferências', exact: true })
      .waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'pt-BR');
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    summary.push({
      viewport: name,
      routes: routes.length,
      errors: errors.length,
      serviceRequests: unexpected.length,
      collectionEditReset: true,
      themeLocale: true,
      headers: true,
    });
    await context.close();
  }
  console.log(JSON.stringify({ url: base.href, checks: summary }));
} finally {
  await browser.close();
}
