/** A query parameter whose value cannot be understood, with a message saying why. */
export class InvalidQueryError extends Error {}

export type QueryParseResult<Value> = { ok: true; value: Value } | { ok: false; error: string };

/** Runs a function that reads query parameters, turning an invalid parameter into an error result. */
export function parseQuery<Value>(read: () => Value): QueryParseResult<Value> {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    if (error instanceof InvalidQueryError) return { ok: false, error: error.message };
    throw error;
  }
}

/** Reads every value of a repeatable parameter, each of which must be one of the given terms. */
export function readTerms<Term extends string>(
  params: URLSearchParams,
  name: string,
  terms: readonly Term[],
) {
  const values = params.getAll(name);
  const unknown = values.find((value) => !terms.includes(value as Term));
  if (unknown !== undefined) {
    throw new InvalidQueryError(
      `Unknown ${name} "${unknown}"; expected one of ${terms.join(", ")}`,
    );
  }
  return values as Term[];
}

/** Reads every non-empty value of a repeatable parameter. */
export function readStrings(params: URLSearchParams, name: string) {
  const values = params.getAll(name);
  if (values.includes("")) throw new InvalidQueryError(`Empty ${name}`);
  return values;
}

/** Reads a number between `min` and `max` inclusive, or returns `fallback` when it is absent. */
export function readNumber(
  params: URLSearchParams,
  name: string,
  [min, max]: [number, number],
  fallback: number,
) {
  const text = params.get(name);
  if (text === null || text === "") return fallback;
  const value = Number(text);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new InvalidQueryError(`Expected ${name} to be a number from ${min} to ${max}`);
  }
  return value;
}

/** Reads a parameter that must be present and non-empty. */
export function readRequiredString(params: URLSearchParams, name: string) {
  const value = params.get(name);
  if (!value) throw new InvalidQueryError(`Missing ${name}`);
  return value;
}
