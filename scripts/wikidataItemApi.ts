import type { NodeName } from "../src/shared/graph.ts";
import { fetchInBatches } from "./fetchInBatches.ts";
import { runSparql, scholarlyEndpoint, wikidataEndpoint } from "./sparqlClient.ts";
import { toQid } from "./sparqlRows.ts";
import { buildLabelsQuery, buildTaxonRanksQuery, buildWorksQuery } from "./wikidataQueries.ts";
import { toWorks } from "./wikidataReferences.ts";

const batchSize = 100;

/** Fetches the labels of Wikidata items in the kept languages. */
export async function fetchLabels(qids: string[]) {
  const rows = await fetchInBatches([...new Set(qids)], batchSize, (batch) =>
    runSparql(wikidataEndpoint, buildLabelsQuery(batch)),
  );
  const labels = new Map<string, NodeName[]>();
  for (const row of rows) {
    const qid = toQid(row.item);
    labels.set(qid, [...(labels.get(qid) ?? []), toNodeName(row)]);
  }
  return labels;
}

function toNodeName(row: Record<string, string>) {
  return { language: row.language ?? "", name: row.label ?? "" } satisfies NodeName;
}

/** Fetches the taxonomic rank item (for example "Q7432", species) of each organism that has one. */
export async function fetchRankQids(organismQids: string[]) {
  const rows = await fetchInBatches(organismQids, batchSize, (batch) =>
    runSparql(wikidataEndpoint, buildTaxonRanksQuery(batch)),
  );
  return new Map(rows.map((row) => [toQid(row.organism), toQid(row.rank)]));
}

/** Fetches the titles, DOIs and years of works, which Wikidata keeps in one of two graphs. */
export async function fetchWorks(workQids: string[]) {
  const qids = [...new Set(workQids)];
  const rows = [wikidataEndpoint, scholarlyEndpoint].map((endpoint) =>
    fetchInBatches(qids, batchSize, (batch) => runSparql(endpoint, buildWorksQuery(batch))),
  );
  return toWorks((await Promise.all(rows)).flat());
}
