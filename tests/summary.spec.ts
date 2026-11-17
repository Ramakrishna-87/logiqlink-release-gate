import { test, expect } from './fixtures';

test('valid summary enables approval', async ({
  page,
  mockSummary,
}) => {
  await mockSummary([
    {
      status: 200,
      body: {
        status: 'ok',
        summary: 'Customer reports a duplicate payment.',
        sourceIds: ['m1'],
      },
    },
  ]);

  await page.goto('/');

  const approve = page.getByRole('button', {
    name: 'Approve',
    exact: true,
  });

  await expect(approve).toBeDisabled();

  await page.getByRole('button', {
    name: 'Generate summary',
  }).click();

  await expect(page.locator('#summary')).toHaveText(
    'Customer reports a duplicate payment.',
  );

  await expect(approve).toBeEnabled();

  await approve.click();

  await expect(page.getByRole('status')).toHaveText(
    'Summary approved.',
  );
});

test('insufficient information blocks approval', async ({
  page,
  mockSummary,
}) => {
  await mockSummary([
    {
      status: 200,
      body: {
        status: 'insufficient_information',
      },
    },
  ]);

  await page.goto('/');

  await page.getByRole('button', {
    name: 'Generate summary',
  }).click();

  await expect(page.getByRole('status')).toHaveText(
    'Insufficient information.',
  );

  await expect(
    page.getByRole('button', { name: 'Approve', exact: true }),
  ).toBeDisabled();
});

test('service failure offers retry and recovers', async ({
  page,
  mockSummary,
}) => {
  await mockSummary([
    {
      status: 503,
      body: { error: 'unavailable' },
    },
    {
      status: 200,
      body: {
        status: 'ok',
        summary: 'Support is investigating the payment.',
        sourceIds: ['m2'],
      },
    },
  ]);

  await page.goto('/');

  await page.getByRole('button', {
    name: 'Generate summary',
  }).click();

  await expect(page.getByRole('status')).toHaveText(
    'Generation failed. Please retry.',
  );

  const approve = page.getByRole('button', {
    name: 'Approve',
    exact: true,
  });

  await expect(approve).toBeDisabled();

  const retry = page.getByRole('button', {
    name: 'Retry',
    exact: true,
  });

  await expect(retry).toBeVisible();
  await retry.click();

  await expect(page.locator('#summary')).toHaveText(
    'Support is investigating the payment.',
  );

  await expect(approve).toBeEnabled();
  await expect(retry).toBeHidden();
});

const invalidCases = [
  {
    name: 'missing citations',
    body: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
    },
  },
  {
    name: 'empty citations',
    body: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: [],
    },
  },
  {
    name: 'cross-ticket citation',
    body: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: ['m9'],
    },
  },
  {
    name: 'mixed valid and cross-ticket citations',
    body: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: ['m1', 'm9'],
    },
  },
];

for (const example of invalidCases) {
  test(`${example.name} blocks approval`, async ({
    page,
    mockSummary,
  }) => {
    await mockSummary([
      {
        status: 200,
        body: example.body,
      },
    ]);

    await page.goto('/');

    await page.getByRole('button', {
      name: 'Generate summary',
    }).click();

    await expect(page.getByRole('status')).toHaveText(
      'Invalid summary or citations. Approval is blocked.',
    );

    await expect(
      page.getByRole('button', {
        name: 'Approve',
        exact: true,
      }),
    ).toBeDisabled();
  });
}