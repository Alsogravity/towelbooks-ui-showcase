import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = new URL('https://towelbooks-ui-showcase.pages.dev');
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
    });
    const page = await context.newPage();
    const errors = [];
    const unexpected = [];
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
    const routes = [
      '/',
      '/pricing',
      '/preview/auth',
      '/demo',
      '/demo/catalog',
      '/demo/catalog/atlas',
      '/demo/library',
      '/demo/library/atlas',
      '/demo/collections',
      '/demo/collections/devagar',
      '/demo/rooms',
      '/demo/rooms/margens',
      '/demo/profile',
      '/demo/settings',
      '/demo/states',
    ];
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
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route + ' overflows',
      );
    }
    await page.goto(new URL('/demo/library/atlas', base).href);
    await page
      .locator('main')
      .getByRole('button', { name: 'Registrar leitura', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Página atual').fill('120');
    await dialog
      .getByLabel('Anotação pessoal')
      .fill('Fictional live verification note.');
    await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
    await page
      .locator('main')
      .getByRole('button', { name: 'Anotações', exact: true })
      .click();
    await page
      .getByText('Fictional live verification note.', { exact: true })
      .waitFor();
    await page
      .getByRole('button', { name: 'Reiniciar demo', exact: true })
      .click();
    assert.equal(
      await page
        .getByText('Fictional live verification note.', { exact: true })
        .count(),
      0,
    );
    await page.goto(new URL('/demo/settings', base).href);
    await page
      .locator('main')
      .getByRole('button', { name: 'Escuro', exact: true })
      .click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page
      .locator('main')
      .getByLabel('Idioma da interface', { exact: true })
      .selectOption('en-US');
    await page
      .getByRole('heading', { name: 'Preferences', exact: true })
      .waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en-US');
    assert.deepEqual(errors, []);
    assert.deepEqual(unexpected, []);
    summary.push({
      viewport: name,
      routes: routes.length,
      errors: errors.length,
      serviceRequests: unexpected.length,
      readingEditReset: true,
      themeLocale: true,
      headers: true,
    });
    await context.close();
  }
  console.log(JSON.stringify({ url: base.href, checks: summary }));
} finally {
  await browser.close();
}
