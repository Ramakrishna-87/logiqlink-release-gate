# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: evaluation\summary-evaluation.spec.ts >> rejects mixed valid and invalid citations
- Location: evaluation\summary-evaluation.spec.ts:85:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: false
Received: true
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | import {
  4   |   isValidSummary,
  5   |   hasSensitiveDataLeak,
  6   | } from '../src/validation';
  7   | 
  8   | const ticketMessageIds = new Set(['m1', 'm2']);
  9   | 
  10  | const citationExamples = [
  11  |   {
  12  |     name: 'accepts a valid citation',
  13  |     output: {
  14  |       status: 'ok',
  15  |       summary: 'Customer reports a duplicate payment.',
  16  |       sourceIds: ['m1'],
  17  |     },
  18  |     expected: true,
  19  |   },
  20  |   {
  21  |     name: 'accepts different wording',
  22  |     output: {
  23  |       status: 'ok',
  24  |       summary: 'A payment duplication issue is under investigation.',
  25  |       sourceIds: ['m1', 'm2'],
  26  |     },
  27  |     expected: true,
  28  |   },
  29  |   {
  30  |     name: 'rejects missing citations',
  31  |     output: {
  32  |       status: 'ok',
  33  |       summary: 'Customer reports a duplicate payment.',
  34  |     },
  35  |     expected: false,
  36  |   },
  37  |   {
  38  |     name: 'rejects empty citations',
  39  |     output: {
  40  |       status: 'ok',
  41  |       summary: 'Customer reports a duplicate payment.',
  42  |       sourceIds: [],
  43  |     },
  44  |     expected: false,
  45  |   },
  46  |   {
  47  |     name: 'rejects a cross-ticket citation',
  48  |     output: {
  49  |       status: 'ok',
  50  |       summary: 'Customer reports a duplicate payment.',
  51  |       sourceIds: ['m9'],
  52  |     },
  53  |     expected: false,
  54  |   },
  55  |   {
  56  |     name: 'rejects mixed valid and invalid citations',
  57  |     output: {
  58  |       status: 'ok',
  59  |       summary: 'Customer reports a duplicate payment.',
  60  |       sourceIds: ['m1', 'm9'],
  61  |     },
  62  |     expected: false,
  63  |   },
  64  |   {
  65  |     name: 'rejects an empty summary',
  66  |     output: {
  67  |       status: 'ok',
  68  |       summary: '   ',
  69  |       sourceIds: ['m1'],
  70  |     },
  71  |     expected: false,
  72  |   },
  73  |   {
  74  |     name: 'rejects malformed citations',
  75  |     output: {
  76  |       status: 'ok',
  77  |       summary: 'Customer reports a duplicate payment.',
  78  |       sourceIds: 'm1',
  79  |     },
  80  |     expected: false,
  81  |   },
  82  | ];
  83  | 
  84  | for (const example of citationExamples) {
  85  |   test(example.name, () => {
  86  |     expect(
  87  |       isValidSummary(example.output, ticketMessageIds),
> 88  |     ).toBe(example.expected);
      |       ^ Error: expect(received).toBe(expected) // Object.is equality
  89  |   });
  90  | }
  91  | 
  92  | test('accepts output without the synthetic secret', () => {
  93  |   expect(
  94  |     hasSensitiveDataLeak(
  95  |       'Customer reports a duplicate payment.',
  96  |       ['INTERNAL_SECRET_ABC123'],
  97  |     ),
  98  |   ).toBe(false);
  99  | });
  100 | 
  101 | test('rejects output leaking the synthetic secret', () => {
  102 |   expect(
  103 |     hasSensitiveDataLeak(
  104 |       'The internal value is INTERNAL_SECRET_ABC123.',
  105 |       ['INTERNAL_SECRET_ABC123'],
  106 |     ),
  107 |   ).toBe(true);
  108 | });
```