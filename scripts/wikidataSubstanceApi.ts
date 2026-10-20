import { limitSharedCompounds, type OrganismCompound } from "./compoundSelection.ts";
import { fetchInBatches } from "./fetchInBatches.ts";
import { runSparql, wikidataEndpoint } from "./sparqlClient.ts";
import { toQid } from "./sparqlRows.ts";
import type { SubstanceLink } from "./substanceDrafts.ts";
import {
  buildCompoundCountsQuery,
  buildCompoundReferencesQuery,
  buildProductsQuery,
  buildSharedCompoundsQuery,
  buildUnsharedCompoundsQuery,
} from "./wikidataQueries.ts";
import { collectReferences, type StatementReference } from "./wikidataReferences.ts";

/**
 * The most compounds kept for one organism among those found in at least one other graph organism.
 * It only matters for organisms with very long lists, such as humans, which have over 100,000.
 */
const sharedCompoundLimit = 500;

/** The most compounds kept for one organism among those found in no other graph organism. */
const unsharedCompoundLimit = 5;

/** The most products kept for one organism. */
const productLimit = 25;

const organismBatchSize = 20;
const productBatchSize = 50;

/**
 * Finds the compounds that Wikidata lists in the organisms: those found in at least two of them,
 * which make shared paths between organisms, and a few more for each organism.
 */
export async function fetchCompoundLinks(organismQids: string[]) {
  const sharedRows = await fetchInBatches(organismQids, organismBatchSize, (batch) =>
    runSparql(wikidataEndpoint, buildSharedCompoundsQuery(batch, organismQids)),
  );
  const shared = limitSharedCompounds(sharedRows.map(toOrganismCompound), sharedCompoundLimit);
  const unshared = await fetchUnsharedCompounds(organismQids);
  const pairs = [...shared, ...unshared];
  const referencesByPair = await fetchCompoundReferences(pairs);
  return pairs.map(({ organismQid, compoundQid }) => ({
    organismQid,
    itemQid: compoundQid,
    property: "P703",
    reference: referencesByPair.get(`${organismQid} ${compoundQid}`),
  })) satisfies SubstanceLink[];
}

async function fetchUnsharedCompounds(organismQids: string[]) {
  const counts = await fetchInBatches(organismQids, 100, (batch) =>
    runSparql(wikidataEndpoint, buildCompoundCountsQuery(batch)),
  );
  const pairs: OrganismCompound[] = [];
  for (const organismQid of counts.map((row) => toQid(row.organism))) {
    const rows = await runSparql(
      wikidataEndpoint,
      buildUnsharedCompoundsQuery(organismQid, organismQids, unsharedCompoundLimit),
    );
    pairs.push(...rows.map((row) => ({ organismQid, compoundQid: toQid(row.compound) })));
  }
  return pairs;
}

async function fetchCompoundReferences(pairs: OrganismCompound[]) {
  const compoundsByOrganism = Map.groupBy(pairs, ({ organismQid }) => organismQid);
  const references = new Map<string, StatementReference>();
  for (const [organismQid, organismPairs] of compoundsByOrganism) {
    const compoundQids = organismPairs.map(({ compoundQid }) => compoundQid);
    const rows = await fetchInBatches(compoundQids, 300, (batch) =>
      runSparql(wikidataEndpoint, buildCompoundReferencesQuery(organismQid, batch)),
    );
    for (const [compoundQid, reference] of collectReferences(rows, (row) => toQid(row.compound))) {
      references.set(`${organismQid} ${compoundQid}`, reference);
    }
  }
  return references;
}

function toOrganismCompound(row: Record<string, string>) {
  return { organismQid: toQid(row.organism), compoundQid: toQid(row.compound) };
}

/** Finds the products that Wikidata lists as coming from the organisms, up to a limit for each. */
export async function fetchProductLinks(organismQids: string[]) {
  const rows = await fetchInBatches(organismQids, productBatchSize, (batch) =>
    runSparql(wikidataEndpoint, buildProductsQuery(batch)),
  );
  const references = collectReferences(
    rows,
    (row) => `${toQid(row.organism)} ${toQid(row.product)}`,
  );
  const pairs = [...references.keys()].map((key) => key.split(" "));
  const countsByOrganism = new Map<string, number>();
  return pairs.flatMap(([organismQid = "", itemQid = ""]) => {
    const count = (countsByOrganism.get(organismQid) ?? 0) + 1;
    countsByOrganism.set(organismQid, count);
    if (count > productLimit) return [];
    const reference = references.get(`${organismQid} ${itemQid}`);
    return [{ organismQid, itemQid, property: "P1672", reference } satisfies SubstanceLink];
  });
}
