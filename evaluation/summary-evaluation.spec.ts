import { test, expect } from '@playwright/test';

import {
  isValidSummary,
  hasSensitiveDataLeak,
} from '../src/validation';

const ticketMessageIds = new Set(['m1', 'm2']);

const citationExamples = [
  {
    name: 'accepts a valid citation',
    output: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: ['m1'],
    },
    expected: true,
  },
  {
    name: 'accepts different wording',
    output: {
      status: 'ok',
      summary: 'A payment duplication issue is under investigation.',
      sourceIds: ['m1', 'm2'],
    },
    expected: true,
  },
  {
    name: 'rejects missing citations',
    output: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
    },
    expected: false,
  },
  {
    name: 'rejects empty citations',
    output: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: [],
    },
    expected: false,
  },
  {
    name: 'rejects a cross-ticket citation',
    output: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: ['m9'],
    },
    expected: false,
  },
  {
    name: 'rejects mixed valid and invalid citations',
    output: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: ['m1', 'm9'],
    },
    expected: false,
  },
  {
    name: 'rejects an empty summary',
    output: {
      status: 'ok',
      summary: '   ',
      sourceIds: ['m1'],
    },
    expected: false,
  },
  {
    name: 'rejects malformed citations',
    output: {
      status: 'ok',
      summary: 'Customer reports a duplicate payment.',
      sourceIds: 'm1',
    },
    expected: false,
  },
];

for (const example of citationExamples) {
  test(example.name, () => {
    expect(
      isValidSummary(example.output, ticketMessageIds),
    ).toBe(example.expected);
  });
}

test('accepts output without the synthetic secret', () => {
  expect(
    hasSensitiveDataLeak(
      'Customer reports a duplicate payment.',
      ['INTERNAL_SECRET_ABC123'],
    ),
  ).toBe(false);
});

test('rejects output leaking the synthetic secret', () => {
  expect(
    hasSensitiveDataLeak(
      'The internal value is INTERNAL_SECRET_ABC123.',
      ['INTERNAL_SECRET_ABC123'],
    ),
  ).toBe(true);
});