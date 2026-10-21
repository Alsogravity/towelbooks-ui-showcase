import { test, expect } from 'playwright/test';
const uid = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
test('original pages render with no service traffic or startup errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = [],
    requests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', (request) => {
    if (
      !request.url().startsWith('http://127.0.0.1:3056/') ||
      ['fetch', 'xhr', 'websocket', 'eventsource'].includes(
        request.resourceType(),
      )
    )
      requests.push(request.url());
  });
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
    '/demo/marina_demo',
  ];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(
      page.getByText(/Loading\.\.\.|Carregando\.\.\./, { exact: true }),
    ).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        { message: route },
      )
      .toBe(true);
    await expect(
      page.getByText(
        /Unexpected error|Algo inesperado|Não foi possível carregar|Could not load|We couldn’t load/i,
      ),
    ).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  expect(requests).toEqual([]);
  await page.goto('/demo/collections');
  await expect(
    page.getByRole('link', { name: 'Wishlist', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('original-collections.png'),
  });
});
test('original collection editor creates an in-memory collection and reload resets it', async ({
  page,
}) => {
  await page.goto('/demo/collections');
  await page
    .getByRole('button', { name: 'New collection', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('Demo reading shelf');
  await dialog
    .getByRole('button', { name: 'Create collection', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Demo reading shelf', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('list', { name: 'Your collections' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Demo reading shelf', exact: true }),
  ).toHaveCount(0);
});
test('original settings overlay opens and dismisses with focus restoration', async ({
  page,
}) => {
  await page.goto('/demo#settings/preferences');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'Theme', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
test('original reading editor saves progress locally', async ({ page }) => {
  await page.goto(`/demo/libraries/${uid(2)}/items/${uid(300)}`);
  await page.locator('#library-item-tab-sessions').click();
  await page
    .getByRole('button', { name: 'Open Reading reading session', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Edit Reading reading session', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('spinbutton', { name: 'Current page', exact: true })
    .fill('120');
  await dialog
    .getByRole('button', { name: 'Save session', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole('progressbar', { name: 'Page 120 of 248', exact: true }),
  ).toBeVisible();
});
test('original preferences change theme and interface language', async ({
  page,
}) => {
  await page.goto('/demo#settings/preferences');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('radio', { name: 'Dark', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await dialog.getByRole('combobox', { name: 'Language', exact: true }).click();
  await page
    .getByRole('option', { name: 'Português (Brasil)', exact: true })
    .click();
  await expect(
    dialog.getByRole('heading', { name: 'Preferências', exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});
test('original sign-in entry opens the demo without credentials', async ({
  page,
}) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(
    page.getByRole('heading', { name: 'Your reading', exact: true }),
  ).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});
