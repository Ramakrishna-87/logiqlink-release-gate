import { test as base, expect } from '@playwright/test';

type MockResponse = {
  status: number;
  body: unknown;
};

type Fixtures = {
  mockSummary: (responses: MockResponse[]) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  mockSummary: async ({ page }, use) => {
    await use(async responses => {
      if (responses.length === 0) {
        throw new Error('Provide at least one mock response.');
      }

      // Each test has its own response queue.
      let requestIndex = 0;

      await page.route('**/api/tickets/T100/summary', async route => {
        if (route.request().method() !== 'POST') {
          await route.fulfill({
            status: 405,
            json: { error: 'method_not_allowed' },
          });
          return;
        }

        const response = responses[requestIndex++];

        if (!response) {
          await route.fulfill({
            status: 500,
            json: { error: 'unexpected_extra_request' },
          });
          return;
        }

        await route.fulfill({
          status: response.status,
          json: response.body,
        });
      });
    });
  },
});

export { expect };