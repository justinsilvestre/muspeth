import type { ConnectionFilter } from "../shared/connectionFilter";
import { allOf, isOneOf, type SqlCondition } from "./sqlCondition";

/** Returns a condition on the `connections` table that keeps only the connections passing the filter. */
export function connectionFilterSql(filter: ConnectionFilter) {
  return allOf([
    filter.kinds.length > 0 ? isOneOf("kind", filter.kinds) : null,
    filter.bases.length > 0 ? isOneOf("basis", filter.bases) : null,
    filter.sources.length > 0 ? isOneOf("source", filter.sources) : null,
    filter.flaggedWith.length > 0 ? carriesAnyFlag(filter.flaggedWith) : null,
    filter.notFlaggedWith.length > 0 ? negate(carriesAnyFlag(filter.notFlaggedWith)) : null,
  ]);
}

function carriesAnyFlag(flags: string[]) {
  const flag = isOneOf("flag.value", flags);
  return {
    sql: `EXISTS (SELECT 1 FROM json_each(quality_flags) AS flag WHERE ${flag.sql})`,
    bindings: flag.bindings,
  } satisfies SqlCondition;
}

function negate(condition: SqlCondition) {
  return { sql: `NOT ${condition.sql}`, bindings: condition.bindings } satisfies SqlCondition;
}
