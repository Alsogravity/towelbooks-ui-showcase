import { test, expect } from 'playwright/test';

test('all showcase routes load without service requests, console errors, or horizontal overflow', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  const unexpectedRequests: string[] = [];
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
      unexpectedRequests.push(request.url());
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
    '/demo/catalog/missing',
    '/missing',
  ];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        { message: `No overflow at ${route}` },
      )
      .toBe(true);
    const brokenImages = await page.locator('img').evaluateAll((images) =>
      images
        .filter(
          (image): image is HTMLImageElement =>
            image instanceof HTMLImageElement,
        )
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.src),
    );
    expect(brokenImages).toEqual([]);
  }
  expect(errors).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath('dashboard.png'),
    fullPage: true,
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath('landing.png'),
    fullPage: true,
  });
});

test('catalog search and filters combine and recover from empty results', async ({
  page,
}) => {
  await page.goto('/demo/catalog');
  const main = page.locator('main');
  const search = main.getByRole('textbox', {
    name: 'Buscar por título ou autoria',
  });
  await search.fill('distancias');
  await expect(
    main.getByRole('heading', { name: 'Atlas das pequenas distâncias' }),
  ).toBeVisible();
  await main.getByRole('button', { name: 'Poesia', exact: true }).click();
  await expect(main.getByText('Nenhuma leitura encontrada.')).toBeVisible();
  await main.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(main.locator('.book-preview')).toHaveCount(6);
});

test('reading edits are shared across pages and reset restores demo data', async ({
  page,
}) => {
  await page.goto('/demo/library/atlas');
  const main = page.locator('main');
  await main
    .getByRole('button', { name: 'Registrar leitura', exact: true })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Página atual').fill('120');
  await dialog.getByLabel('Anotação pessoal').fill('A memorable passage.');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    main.getByRole('button', { name: 'Registrar leitura', exact: true }),
  ).toBeFocused();
  await main.getByRole('button', { name: 'Anotações', exact: true }).click();
  await expect(
    main.getByText('A memorable passage.', { exact: true }),
  ).toBeVisible();
  // The visible navigation is desktop sidebar or mobile bottom bar.
  await page
    .getByRole('link', { name: 'Minha biblioteca', exact: true })
    .filter({ visible: true })
    .click();
  await expect(
    main
      .locator('article')
      .filter({ hasText: 'Atlas das pequenas distâncias' })
      .getByText('48%', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Reiniciar demo', exact: true })
    .click();
  await expect(
    main
      .locator('article')
      .filter({ hasText: 'Atlas das pequenas distâncias' })
      .getByText('35%', { exact: true }),
  ).toBeVisible();
});

test('membership controls the local conversation and reset removes replies', async ({
  page,
}) => {
  await page.goto('/demo/rooms/entrelinhas');
  const main = page.locator('main');
  await expect(main.getByRole('textbox')).toHaveCount(0);
  await main
    .getByRole('button', { name: 'Participar da sala', exact: true })
    .click();
  await main
    .getByLabel('Sua reflexão')
    .fill('Reading together changes the story.');
  await main.getByRole('button', { name: 'Compartilhar reflexão' }).click();
  await expect(
    main.getByText('Reading together changes the story.', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Reiniciar demo', exact: true })
    .click();
  await expect(
    main.getByText('Reading together changes the story.', { exact: true }),
  ).toHaveCount(0);
  await expect(main.getByRole('textbox')).toHaveCount(0);
});

test('theme, locale, state previews, keyboard dialog dismissal and direct reload work', async ({
  page,
}) => {
  await page.goto('/demo/settings');
  const main = page.locator('main');
  await main.getByRole('button', { name: 'Escuro', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await main
    .getByLabel('Idioma da interface', { exact: true })
    .selectOption('en-US');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
  await expect(
    main.getByRole('heading', { level: 1, name: 'Preferences' }),
  ).toBeVisible();
  await page.locator('#portfolio-language').selectOption('pt-BR');
  await page.goto('/demo/states');
  await main.getByRole('button', { name: 'Erro', exact: true }).click();
  await expect(main.getByRole('alert')).toBeVisible();
  await main.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(main.locator('.book-preview')).toHaveCount(1);
  await page.goto('/demo/library/atlas');
  await main
    .getByRole('button', { name: 'Registrar leitura', exact: true })
    .click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.reload();
  await expect(
    main.getByRole('heading', {
      level: 1,
      name: 'Atlas das pequenas distâncias',
    }),
  ).toBeVisible();
});
