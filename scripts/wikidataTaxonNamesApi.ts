import { fetchInBatches } from "./fetchInBatches.ts";
import { runSparql, wikidataEndpoint } from "./sparqlClient.ts";
import { toQid } from "./sparqlRows.ts";
import { collectAncestors, isFamilyOrHigher } from "./taxonAncestors.ts";
import { buildParentsQuery, buildTaxonNamesQuery } from "./wikidataQueries.ts";

const batchSize = 100;

/** Fetches the English common names and labels of taxa from Wikidata. */
export async function fetchTaxonNames(taxonQids: string[]) {
  const rows = await fetchInBatches([...new Set(taxonQids)], batchSize, (batch) =>
    runSparql(wikidataEndpoint, buildTaxonNamesQuery(batch)),
  );
  const names = new Map<string, string[]>();
  for (const row of rows) {
    const qid = toQid(row.taxon);
    names.set(qid, [...new Set([...(names.get(qid) ?? []), row.name ?? ""])]);
  }
  return names;
}

/** The most steps up the taxonomy that are fetched, since taxa without a rank add steps. */
const maxSteps = 12;

/** Fetches the qids of the taxa above each organism, from subgenus up to family. */
export async function fetchAncestorQids(organismQids: string[]) {
  const parentQidsOf = new Map<string, string[]>();
  const rankQidOf = new Map<string, string>();
  let frontier = [...new Set(organismQids)];
  for (let step = 0; step < maxSteps && frontier.length > 0; step++) {
    const rows = await fetchInBatches(frontier, batchSize, (batch) =>
      runSparql(wikidataEndpoint, buildParentsQuery(batch)),
    );
    for (const row of rows) {
      const [taxon, parent] = [toQid(row.taxon), toQid(row.parent)];
      parentQidsOf.set(taxon, [...new Set([...(parentQidsOf.get(taxon) ?? []), parent])]);
      if (row.rank) rankQidOf.set(parent, toQid(row.rank));
    }
    const parents = rows.map((row) => toQid(row.parent));
    frontier = [...new Set(parents)].filter(
      (qid) => !parentQidsOf.has(qid) && !isFamilyOrHigher(rankQidOf.get(qid)),
    );
  }
  return new Map(
    organismQids.map((qid) => [qid, collectAncestors(qid, parentQidsOf, rankQidOf)] as const),
  );
}
