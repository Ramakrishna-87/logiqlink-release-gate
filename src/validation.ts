// src/validation.ts

export type ValidSummary = {
  status: 'ok';
  summary: string;
  sourceIds: string[];
};

export function isValidSummary(
  value: unknown,
  ticketMessageIds: ReadonlySet<string>,
): value is ValidSummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    data.status === 'ok' &&
    typeof data.summary === 'string' &&
    data.summary.trim().length > 0 &&
    Array.isArray(data.sourceIds) &&
    data.sourceIds.length > 0 &&
    data.sourceIds.every(
      (id: unknown) =>
        typeof id === 'string' && ticketMessageIds.has(id),
    )
  );
}

// Detect exact synthetic secret markers.
// This is a limited deterministic privacy check.
export function hasSensitiveDataLeak(
  summary: string,
  forbiddenValues: readonly string[],
): boolean {
  return forbiddenValues.some(
    value => value.length > 0 && summary.includes(value),
  );
}