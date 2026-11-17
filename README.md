# AI-Assisted Summary Release Gate

A minimal support dashboard with Playwright and TypeScript tests
for an AI-assisted ticket summary feature.

All examples use synthetic data. Tests mock the service boundary;
no credentials, paid services, or external AI calls are required.

## Setup

Install Node.js 24, then run:

```bash
npm ci
npx playwright install chromium
```

On Linux CI, install browser dependencies with:

```bash
npx playwright install --with-deps chromium
```

## Run the release checks

```bash
npm run typecheck
npm test
```

Run tests with visible browsers:

```bash
npx playwright test --headed
```

Open the latest report:

```bash
npx playwright show-report
```

## Run the dashboard

```bash
npm run dev
```

Open the URL printed in the terminal.

The summary endpoint is mocked inside Playwright tests.
Generation in an ordinary browser shows an error because this
minimal fixture does not include a backend service.

## Test coverage

Seven UI tests cover:

- Successful generation and local approval feedback.
- Insufficient information blocking approval.
- Service failure followed by successful retry.
- Missing citations.
- Empty citations.
- Cross-ticket citations.
- Mixed valid and cross-ticket citations.

Ten deterministic evaluation tests cover:

- Valid attribution with different summary wording.
- Missing, empty, cross-ticket, and mixed citations.
- Empty summary text and malformed citation data.
- Outputs with and without an exact synthetic secret marker.

## Architecture and test boundaries

`src/main.ts` implements dashboard states and user actions.

`src/validation.ts` provides shared runtime validation.

`tests/fixtures.ts` provides per-test service response queues.
Each UI test uses an isolated browser context and its own mock
state, allowing parallel execution without shared mutable data.

UI tests check visible behavior and approval eligibility.
Evaluation tests call validation functions directly without
opening a browser.

Approval feedback is local; approval persistence is out of scope.

## Release-blocking criteria

The GitHub Actions workflow fails if TypeScript checking or any
UI/evaluation test fails.

Critical behaviors include:

- Valid summaries can become eligible for approval.
- Invalid citations cannot become eligible for approval.
- Insufficient information and service failures keep approval disabled.
- Retry can recover from a service failure.
- Defined attribution and synthetic secret evaluation checks pass.

Configure "TypeScript and Playwright" as a required repository
check to prevent merging when the workflow fails. The workflow
does not itself deploy or enforce branch protection.

## Intentional regression

1. In `src/validation.ts`, change `data.sourceIds.every(...)`
   to `data.sourceIds.some(...)`.
2. Save the file.
3. Run:

```bash
npx playwright test -g "mixed"
```

Both mixed-citation tests should fail.

The mutation incorrectly accepts `["m1", "m9"]` because one
citation is valid, although every citation must belong to the
current ticket.

Inspect the report:

```bash
npx playwright show-report
```

Restore `.every(...)`, save, and rerun:

```bash
npm test
```

The correct implementation must be restored before submission.

The intentional regression was observed to produce two failures.
After restoration, all 17 tests passed locally.

## Failure evidence

The configuration retains traces, screenshots, and videos for
failed UI tests. The HTML report links to available evidence.

GitHub Actions uploads `playwright-report/` and `test-results/`
with a 14-day retention period.

Saved intentional-failure evidence is available under `evidence/`.

To view the saved failure report:

```bash
npx playwright show-report evidence/intentional-failure-report
```

## Evaluation limits

Citation membership establishes that cited IDs belong to the
current ticket. It does not prove that the summary's claims are
supported by those messages.

The additional privacy check detects exact synthetic secret
markers. It does not establish comprehensive privacy protection.
This check is evaluated separately and is not currently part
of dashboard approval eligibility.

No live-model quality claims are made.

## What I would test separately against a live model

- Factual grounding and unsupported claims.
- Coverage of important ticket details.
- Prompt injection in ticket messages.
- Sensitive-data leakage beyond exact markers.
- Appropriate insufficient-information responses.
- Variation across repeated runs, languages, and model versions.

I would use a versioned dataset, defined scoring criteria, and
human review for ambiguous cases.

## What I would add next

- Pending-request and stale-approval regression tests.
- A local mock service for manual dashboard demonstrations.
- Structured validation failure reasons.
- Broader privacy checks and approval-policy integration.
- Backend enforcement and persisted approval audit records.

## AI assistance

See `AI_USAGE.md` for how AI assistance was used and verified.