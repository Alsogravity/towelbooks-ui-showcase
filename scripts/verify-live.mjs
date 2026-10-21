import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = new URL('https://towelbooks-ui-showcase.pages.dev');
const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const routes = [
  '/',
  '/pricing',
  '/login',
  '/register',
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
await mkdir('test-results', { recursive: true });
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
      await page
        .getByRole('heading')
        .first()
        .waitFor()
        .catch(async (error) => {
          await page.screenshot({
            path: `test-results/live-failure-${name}.png`,
            fullPage: true,
          });
          throw new Error(`Live route failed to render: ${route}`, {
            cause: error,
          });
        });
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
    for (const variant of [
      {
        route: '/login',
        identifier: '#identifier',
        password: '#password',
        submit: 'Sign in',
      },
      {
        route: '/register',
        identifier: '#register-email',
        password: '#register-password',
        submit: 'Create account',
      },
    ]) {
      await page.goto(new URL(variant.route, base).href);
      await page.locator(variant.identifier).waitFor();
      assert.equal(
        await page.locator(variant.identifier).inputValue(),
        'peter.parker@example.invalid',
      );
      assert.equal(
        await page.locator(variant.password).inputValue(),
        'demo-password-1234',
      );
      await page
        .getByText(
          'Portfolio demo. Fictional details are prefilled; no account is created and nothing entered here is sent or saved.',
          { exact: true },
        )
        .waitFor();
      if (variant.route === '/register') {
        assert.equal(
          await page.locator('#register-handle').inputValue(),
          'peter_parker',
        );
        const checkboxes = await page.getByRole('checkbox').all();
        assert.equal(checkboxes.length, 3);
        for (const checkbox of checkboxes)
          assert.equal(await checkbox.isChecked(), true);
      }
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `test-results/live-${variant.route.slice(1)}-${name}.png`,
        fullPage: true,
      });
      const before = await page.evaluate(() => ({
        local: { ...globalThis.localStorage },
        session: { ...globalThis.sessionStorage },
      }));
      const cookies = await context.cookies();
      await page
        .getByRole('button', { name: variant.submit, exact: true })
        .click();
      await page.waitForURL(new URL('/demo', base).href);
      await page
        .getByRole('heading', { name: 'Your reading', exact: true })
        .waitFor();
      assert.deepEqual(
        await page.evaluate(() => ({
          local: { ...globalThis.localStorage },
          session: { ...globalThis.sessionStorage },
        })),
        before,
      );
      assert.deepEqual(await context.cookies(), cookies);
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
      authConfirmation: true,
      credentialStorage: false,
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
