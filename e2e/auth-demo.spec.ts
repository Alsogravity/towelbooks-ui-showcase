import { test, expect, type Page } from 'playwright/test';

const email = 'peter.parker@example.invalid';
const password = 'demo-password-1234';
const notice =
  'Portfolio demo. Fictional details are prefilled; no account is created and nothing entered here is sent or saved.';
const variants = [
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
];

async function browserStorage(page: Page) {
  return page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
}

for (const variant of variants) {
  test(`${variant.route} preserves the original form with one-click demo entry`, async ({
    page,
    context,
  }) => {
    const traffic: string[] = [];
    page.on('request', (request) => {
      if (
        new URL(request.url()).origin !== 'http://127.0.0.1:3056' ||
        ['fetch', 'xhr', 'websocket', 'eventsource'].includes(
          request.resourceType(),
        )
      )
        traffic.push(request.url());
    });
    await page.goto(variant.route);
    await expect(page).toHaveURL(new RegExp(`${variant.route}$`));
    await expect(page.getByText(notice, { exact: true })).toBeVisible();
    await expect(page.locator(variant.identifier)).toHaveValue(email);
    await expect(page.locator(variant.password)).toHaveValue(password);
    await expect(page.locator(variant.password)).toHaveAttribute(
      'type',
      'password',
    );
    if (variant.route === '/register') {
      await expect(page.locator('#register-handle')).toHaveValue(
        'peter_parker',
      );
      await expect(page.getByRole('checkbox')).toHaveCount(3);
      for (const checkbox of await page.getByRole('checkbox').all())
        await expect(checkbox).toBeChecked();
    }
    await page.getByRole('button', { name: 'Show', exact: true }).click();
    await expect(page.locator(variant.password)).toHaveAttribute(
      'type',
      'text',
    );
    await page.getByRole('button', { name: 'Hide', exact: true }).click();
    await expect(page.locator(variant.password)).toHaveAttribute(
      'type',
      'password',
    );
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const before = await browserStorage(page);
    const cookies = await context.cookies();
    await page
      .getByRole('button', { name: variant.submit, exact: true })
      .click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(
      page.getByRole('heading', { name: 'Your reading', exact: true }),
    ).toBeVisible();
    expect(await browserStorage(page)).toEqual(before);
    expect(await context.cookies()).toEqual(cookies);
    expect(traffic).toEqual([]);
  });

  test(`${variant.route} validates edits and discards them when entering Peter Parker's demo`, async ({
    page,
    context,
  }) => {
    await page.goto(variant.route);
    await expect(page.locator(variant.identifier)).toHaveValue(email);
    await page.locator(variant.password).fill('short');
    if (variant.route === '/login')
      await page.locator(variant.identifier).fill('');
    else {
      await page.locator('#register-handle').fill('invalid handle');
      await page.getByRole('checkbox').first().uncheck();
    }
    await page
      .getByRole('button', { name: variant.submit, exact: true })
      .click();
    await expect(
      page.getByText('Password must be at least 12 characters.', {
        exact: true,
      }),
    ).toBeVisible();
    if (variant.route === '/login')
      await expect(
        page.getByText('Enter your email or username.', { exact: true }),
      ).toBeVisible();
    else {
      await expect(
        page.getByText(
          'Use only lowercase letters, numbers, hyphens, and underscores.',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByText('You must confirm that you are 18 or older.', {
          exact: true,
        }),
      ).toBeVisible();
      await page.locator('#register-handle').fill('visitor_demo');
      await page.getByRole('checkbox').first().check();
    }
    await expect(page).toHaveURL(new RegExp(`${variant.route}$`));
    await page.locator(variant.identifier).fill('visitor@example.invalid');
    await page.locator(variant.password).fill('visitor-demo-password');
    const before = await browserStorage(page);
    const cookies = await context.cookies();
    await page
      .getByRole('button', { name: variant.submit, exact: true })
      .click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(
      page.getByRole('heading', { name: 'Your reading', exact: true }),
    ).toBeVisible();
    expect(await browserStorage(page)).toEqual(before);
    expect(await context.cookies()).toEqual(cookies);
    await page.goto('/demo/peter_parker');
    await expect(
      page.getByRole('heading', { name: 'Peter Parker', exact: true }),
    ).toBeVisible();
    await page.goto(variant.route);
    await expect(page.locator(variant.identifier)).toHaveValue(email);
    await expect(page.locator(variant.password)).toHaveValue(password);
    await page.locator(variant.identifier).fill('reload@example.invalid');
    await page.reload();
    await expect(page.locator(variant.identifier)).toHaveValue(email);
  });
}

test('original links navigate between login and registration', async ({
  page,
}) => {
  await page.goto('/login');
  await page
    .getByRole('link', { name: 'Create an account', exact: true })
    .click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.locator('#register-email')).toHaveValue(email);
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('#identifier')).toHaveValue(email);
});

test.describe('Portuguese auth descriptions', () => {
  test.use({ locale: 'pt-BR' });
  test('both original forms explain the local demo in Portuguese', async ({
    page,
  }) => {
    for (const variant of variants) {
      await page.goto(variant.route);
      await expect(
        page.getByText(
          'Demonstração de portfólio. Os dados fictícios já estão preenchidos; nenhuma conta é criada e nada digitado aqui é enviado ou salvo.',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    }
  });
});
