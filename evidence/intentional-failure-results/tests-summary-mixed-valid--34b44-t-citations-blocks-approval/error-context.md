# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\summary.spec.ts >> mixed valid and cross-ticket citations blocks approval
- Location: tests\summary.spec.ts:159:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  getByRole('status')
Expected: "Invalid summary or citations. Approval is blocked."
Received: "Summary is valid. Ready for approval."
Timeout:  5000ms

Call log:
  - Expect "toHaveText" getByRole('status') with timeout 5000ms
  - waiting for getByRole('status')
    14 × locator resolved to <p id="status" role="status" aria-live="polite">Summary is valid. Ready for approval.</p>
       - unexpected value "Summary is valid. Ready for approval."

```

```yaml
- status: Summary is valid. Ready for approval.
```

# Test source

```ts
  76  |   await mockSummary([
  77  |     {
  78  |       status: 503,
  79  |       body: { error: 'unavailable' },
  80  |     },
  81  |     {
  82  |       status: 200,
  83  |       body: {
  84  |         status: 'ok',
  85  |         summary: 'Support is investigating the payment.',
  86  |         sourceIds: ['m2'],
  87  |       },
  88  |     },
  89  |   ]);
  90  | 
  91  |   await page.goto('/');
  92  | 
  93  |   await page.getByRole('button', {
  94  |     name: 'Generate summary',
  95  |   }).click();
  96  | 
  97  |   await expect(page.getByRole('status')).toHaveText(
  98  |     'Generation failed. Please retry.',
  99  |   );
  100 | 
  101 |   const approve = page.getByRole('button', {
  102 |     name: 'Approve',
  103 |     exact: true,
  104 |   });
  105 | 
  106 |   await expect(approve).toBeDisabled();
  107 | 
  108 |   const retry = page.getByRole('button', {
  109 |     name: 'Retry',
  110 |     exact: true,
  111 |   });
  112 | 
  113 |   await expect(retry).toBeVisible();
  114 |   await retry.click();
  115 | 
  116 |   await expect(page.locator('#summary')).toHaveText(
  117 |     'Support is investigating the payment.',
  118 |   );
  119 | 
  120 |   await expect(approve).toBeEnabled();
  121 |   await expect(retry).toBeHidden();
  122 | });
  123 | 
  124 | const invalidCases = [
  125 |   {
  126 |     name: 'missing citations',
  127 |     body: {
  128 |       status: 'ok',
  129 |       summary: 'Customer reports a duplicate payment.',
  130 |     },
  131 |   },
  132 |   {
  133 |     name: 'empty citations',
  134 |     body: {
  135 |       status: 'ok',
  136 |       summary: 'Customer reports a duplicate payment.',
  137 |       sourceIds: [],
  138 |     },
  139 |   },
  140 |   {
  141 |     name: 'cross-ticket citation',
  142 |     body: {
  143 |       status: 'ok',
  144 |       summary: 'Customer reports a duplicate payment.',
  145 |       sourceIds: ['m9'],
  146 |     },
  147 |   },
  148 |   {
  149 |     name: 'mixed valid and cross-ticket citations',
  150 |     body: {
  151 |       status: 'ok',
  152 |       summary: 'Customer reports a duplicate payment.',
  153 |       sourceIds: ['m1', 'm9'],
  154 |     },
  155 |   },
  156 | ];
  157 | 
  158 | for (const example of invalidCases) {
  159 |   test(`${example.name} blocks approval`, async ({
  160 |     page,
  161 |     mockSummary,
  162 |   }) => {
  163 |     await mockSummary([
  164 |       {
  165 |         status: 200,
  166 |         body: example.body,
  167 |       },
  168 |     ]);
  169 | 
  170 |     await page.goto('/');
  171 | 
  172 |     await page.getByRole('button', {
  173 |       name: 'Generate summary',
  174 |     }).click();
  175 | 
> 176 |     await expect(page.getByRole('status')).toHaveText(
      |                                            ^ Error: expect(locator).toHaveText(expected) failed
  177 |       'Invalid summary or citations. Approval is blocked.',
  178 |     );
  179 | 
  180 |     await expect(
  181 |       page.getByRole('button', {
  182 |         name: 'Approve',
  183 |         exact: true,
  184 |       }),
  185 |     ).toBeDisabled();
  186 |   });
  187 | }
```