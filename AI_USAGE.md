# AI Usage Disclosure

## How I used AI

I used ChatGPT and Claude Sonnet extensively during this
exercise. With Claude, I used Plan, Agent, and Ask modes
for planning, implementation assistance, and explanations.

ChatGPT helped draft the dashboard, shared validation,
Playwright fixtures and tests, deterministic evaluation,
CI configuration, and documentation. Both tools also
helped troubleshoot development and configuration issues.

I verified the resulting implementation through local
TypeScript checking, all 17 tests, and an intentional
citation-validation regression that caused two tests
to fail. After restoring the correct implementation,
all 17 tests passed again.

## How I verified the output

I integrated the suggested code locally and verified it by:

- Running TypeScript checking successfully.
- Running all 17 UI and evaluation tests successfully.
- Running tests with two parallel workers.
- Intentionally changing citation validation from every()
  to some().
- Observing both mixed-citation tests fail.
- Inspecting the HTML failure report.
- Saving the intentional-failure evidence.
- Restoring every() and confirming all 17 tests passed again.

## Limitations

The tests use synthetic data and mocked service responses.
No external AI model was called or evaluated.

Citation membership does not establish factual grounding.
The synthetic secret check detects exact markers only and
is separate from dashboard approval eligibility.

The GitHub Actions workflow must be verified separately
after pushing the repository.