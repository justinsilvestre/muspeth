/** A SQL boolean expression with the values for its `?` placeholders, in order. */
export type SqlCondition = {
  sql: string;
  bindings: (string | number)[];
};

/** Joins conditions with AND, giving a condition that always holds when there are none. */
export function allOf(conditions: (SqlCondition | null)[]) {
  const present = conditions.filter((condition) => condition !== null);
  return {
    sql: present.length > 0 ? present.map(({ sql }) => `(${sql})`).join(" AND ") : "1 = 1",
    bindings: present.flatMap(({ bindings }) => bindings),
  } satisfies SqlCondition;
}

/**
 * Tests a column against a list of values passed as one JSON array,
 * which avoids SQLite's limit on the number of placeholders in a statement.
 */
export function isOneOf(column: string, values: string[]) {
  return {
    sql: `${column} IN (SELECT value FROM json_each(?))`,
    bindings: [JSON.stringify(values)],
  } satisfies SqlCondition;
}
