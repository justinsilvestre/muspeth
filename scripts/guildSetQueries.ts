import { queryDatabase } from "./database.ts";
import { rottingLogStages } from "./guildSetChoices.ts";

/** One body linked to one partner, as the database gives it, with the licence of the link. */
export type LinkRow = {
  body_id: string;
  partner: string;
  weight: number | null;
  flags: string;
  licence: string;
};

/** The relations beyond those recorded for every organism, each read from one import's links. */
export type ExtraRelation =
  | "stages"
  | "prey"
  | "predators"
  | "food"
  | "eaters"
  | "hosts"
  | "fungi"
  | "genes";

/** The links that a set's bodies have to the partners that draw the membranes, within the set's own study where it has one. */
export type RelationScope = { datasetIds?: string[] };

const feeding = ["eats", "detritivore", "scavenger", "interactsWith"];
const hosting = ["hasHost", "parasiteOf", "pathogenOf", "symbiontOf"];

/** Reads the links of one relation among the given bodies, with each partner named by its label. */
export function queryRelationLinks(
  relation: ExtraRelation,
  bodyIds: string[],
  scope: RelationScope,
) {
  const ids = quoteList(bodyIds);
  const within = scope.datasetIds ? `AND cs.dataset_id IN (${quoteList(scope.datasetIds)})` : "";
  switch (relation) {
    case "stages":
      return queryStages(ids);
    case "prey":
      return queryLinks(ids, "out", `c.relation = 'preysOn' ${within}`);
    case "predators":
      return queryLinks(ids, "in", `c.relation = 'preysOn' ${within}`);
    case "food":
      return queryLinks(ids, "out", `c.relation IN (${quoteList(feeding)}) ${within}`);
    case "eaters":
      return queryLinks(ids, "in", `c.relation IN (${quoteList(feeding)}) ${within}`);
    case "hosts":
      return queryLinks(
        ids,
        "out",
        `c.source = 'fungaltraits-hosts' AND c.relation IN (${quoteList(hosting)})`,
      );
    case "fungi":
      return queryLinks(
        ids,
        "in",
        `c.source = 'fungaltraits-hosts' AND c.relation IN (${quoteList(hosting)})`,
      );
    case "genes":
      return queryLinks(ids, "out", "c.source = 'grass-gene-transfers'");
  }
}

/**
 * Reads the links where the body is the source ("out", the partner being the target) or the
 * target ("in"), under a condition on the connection `c` and its sources `cs`.
 */
function queryLinks(ids: string, direction: "out" | "in", condition: string) {
  const [bodyColumn, partnerColumn] =
    direction === "out"
      ? ["source_node_id", "target_node_id"]
      : ["target_node_id", "source_node_id"];
  return queryDatabase<LinkRow>(`
    SELECT DISTINCT c.${bodyColumn} AS body_id, p.label AS partner, NULL AS weight, c.quality_flags AS flags, c.licence
    FROM connections c
    JOIN nodes p ON p.id = c.${partnerColumn}
    JOIN connection_sources cs ON cs.connection_id = c.id
    WHERE c.${bodyColumn} IN (${ids}) AND ${condition}
  `);
}

/** Reads, for each body, the stages of decay of the rotting-log survey it was recorded at, weighted by the years the logs had lain dead. */
function queryStages(ids: string) {
  const rows = queryDatabase<{
    body_id: string;
    dataset_id: string;
    flags: string;
    licence: string;
  }>(`
    SELECT DISTINCT n.id AS body_id, cs.dataset_id, c.quality_flags AS flags, c.licence
    FROM nodes n
    JOIN connections c ON c.source_node_id = n.id OR c.target_node_id = n.id
    JOIN connection_sources cs ON cs.connection_id = c.id
    WHERE n.id IN (${ids}) AND cs.dataset_id IN (${quoteList(Object.keys(rottingLogStages))})
  `);
  return rows.flatMap((row) => {
    const stage = rottingLogStages[row.dataset_id];
    if (!stage) return [];
    const link: LinkRow = { ...row, partner: stage.name, weight: stage.years };
    return [link];
  });
}

export function quoteList(values: string[]) {
  return values.map((value) => `'${value.replace(/'/g, "''")}'`).join(", ");
}
