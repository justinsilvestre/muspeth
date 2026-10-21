import { fetchInBatches } from "./fetchInBatches.ts";
import type { WikidataTaxon } from "./organismIdentity.ts";
import { runSparql, wikidataEndpoint } from "./sparqlClient.ts";
import { isItemQid, type SparqlRow, toQid } from "./sparqlRows.ts";
import {
  buildQidsByGbifKeyQuery,
  buildQidsByTaxonNameQuery,
  buildTaxaQuery,
} from "./wikidataQueries.ts";

const batchSize = 100;

/** Fetches the scientific names, labels, and GBIF and NCBI identifiers of Wikidata items. */
export async function fetchWikidataTaxa(qids: string[]) {
  const rows = await fetchInBatches(qids, batchSize, (batch) =>
    runSparql(wikidataEndpoint, buildTaxaQuery(batch)),
  );
  const taxa = new Map<string, WikidataTaxon>();
  for (const row of rows) addRow(taxa, row);
  return taxa;
}

/** Finds the Wikidata items whose scientific name (property P225) is one of the given names. */
export async function fetchWikidataQidsByTaxonName(names: string[]) {
  const rows = await fetchInBatches(names, batchSize, (batch) =>
    runSparql(wikidataEndpoint, buildQidsByTaxonNameQuery(batch)),
  );
  return groupQids(rows.map((row) => [row.taxonName ?? "", toQid(row.item)] as const));
}

/** Finds the Wikidata items whose GBIF taxon identifier (property P846) is one of the given keys. */
export async function fetchWikidataQidsByGbifKey(keys: number[]) {
  const rows = await fetchInBatches(keys, batchSize, (batch) =>
    runSparql(wikidataEndpoint, buildQidsByGbifKeyQuery(batch)),
  );
  return groupQids(rows.map((row) => [Number(row.gbif), toQid(row.item)] as const));
}

function groupQids<Key>(pairs: (readonly [Key, string])[]) {
  const qidsByKey = new Map<Key, string[]>();
  for (const [key, qid] of pairs) {
    if (isItemQid(qid)) qidsByKey.set(key, [...(qidsByKey.get(key) ?? []), qid]);
  }
  return qidsByKey;
}

function addRow(taxa: Map<string, WikidataTaxon>, row: SparqlRow) {
  const qid = toQid(row.item);
  const taxon = taxa.get(qid) ?? { qid, taxonNames: [], labels: [], externalIds: [] };
  const { taxonName, label, language, gbif, ncbi } = row;
  if (taxonName) addOnce(taxon.taxonNames, taxonName);
  if (gbif) addOnce(taxon.externalIds, `gbif:${gbif}`);
  if (ncbi) addOnce(taxon.externalIds, `ncbi:${ncbi}`);
  if (label && language && !taxon.labels.some((existing) => existing.language === language)) {
    taxon.labels.push({ language, name: label });
  }
  taxa.set(qid, taxon);
}

function addOnce(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}
