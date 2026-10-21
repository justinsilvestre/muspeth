import { queryDatabase } from "./database.ts";
import { quoteSql } from "./quoteSql.ts";

type OrganismRow = { id: string; label: string };

/**
 * Loads the ids of the organisms in the database by their labels, leaving out those whose source
 * is one of `excludedSources`, so that an import can reuse an existing node for a name instead of
 * adding a second one.
 * Where several organisms share a label, the seed's organism wins, then the one with the first id.
 */
export function loadOrganismIdsByLabel(excludedSources: string[]) {
  return toOrganismIdsByLabel(
    queryDatabase<OrganismRow>(toOrganismsOutsideSourcesSql(excludedSources)),
  );
}

/** Selects the organisms outside the given sources, in the order of preference among namesakes. */
export function toOrganismsOutsideSourcesSql(excludedSources: string[]) {
  const isIncluded = excludedSources.length
    ? `AND source NOT IN (${excludedSources.map(quoteSql).join(", ")})`
    : "";
  return `SELECT id, label FROM nodes WHERE kind = 'organism' ${isIncluded}
  ORDER BY source = 'sample' DESC, id`;
}

/** Maps each label to the id of its first organism. */
export function toOrganismIdsByLabel(organisms: OrganismRow[]) {
  const idsByLabel = new Map<string, string>();
  for (const { id, label } of organisms) if (!idsByLabel.has(label)) idsByLabel.set(label, id);
  return idsByLabel;
}
