/**
 * Loads GloBI interaction records one step outward from the seed's organisms, adding the partner
 * organisms as nodes.
 * Re-running it replaces the connections and organisms of the previous run.
 * Usage: npm run db:import-interactions -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import { queryD1 } from "./d1.ts";
import { fetchGlobiRecords, fetchTaxonLinks } from "./globiApi.ts";
import { mergeConnections, toConnectionDraft } from "./globiConnections.ts";
import {
  type GlobiRecord,
  type GlobiTaxon,
  isExcludedDataset,
  orientRecord,
  selectPartnerNames,
} from "./globiRecords.ts";
import type { NodeDraft } from "./graphDrafts.ts";
import {
  chooseWikidataTaxon,
  identifyOrganism,
  isUnmatchedName,
  listOrganismNames,
} from "./organismIdentity.ts";
import { seedOrganismsSql } from "./seedOrganismsSql.ts";
import { listLinkedQids, parseTaxonLinks } from "./taxonLinks.ts";
import { fetchWikidataQidsByTaxonName, fetchWikidataTaxa } from "./wikidataApi.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const source = "globi";
const recordLimit = 20_000;
const partnerLimit = 60;
const concurrency = 8;

const startOrganisms = queryD1<{ id: string; label: string }>(seedOrganismsSql);
const existingIdByName = new Map(startOrganisms.map(({ id, label }) => [label, id]));
const startNames = new Set(startOrganisms.map(({ label }) => label));
const records: GlobiRecord[] = [];
for (const name of startNames) records.push(...(await collectRecords(name)));
const taxa = new Map(
  records.flatMap(({ subject, object }) => [subject, object]).map((taxon) => [taxon.name, taxon]),
);
const choices = await chooseWikidataTaxa([...taxa.values()]);
const identities = new Map(
  [...taxa.values()].map((taxon) => [
    taxon.name,
    identifyOrganism(taxon, choices.get(taxon.name) ?? null, existingIdByName.get(taxon.name)),
  ]),
);
const nodes = [...taxa.values()].map(
  (taxon) =>
    ({
      id: identities.get(taxon.name)?.id ?? "",
      kind: "organism",
      label: taxon.name,
      names: listOrganismNames(taxon, choices.get(taxon.name) ?? null),
    }) satisfies NodeDraft,
);
const connections = mergeConnections(
  records.map((record) => toConnectionDraft(record, identities)),
);
writeConnectionImport(source, nodes, connections);
console.log(
  `Stored ${connections.length} connections among ${new Set(nodes.map(({ id }) => id)).size} organisms.`,
);

async function collectRecords(organismName: string) {
  const fetched = await fetchGlobiRecords(organismName, recordLimit);
  if (fetched.length === recordLimit)
    console.warn(`Only the first ${recordLimit} records of ${organismName} were read.`);
  const kept = fetched.filter((record) => !isExcludedDataset(record)).map(orientRecord);
  const partnerNames = new Set(
    selectPartnerNames(kept, organismName, partnerLimit, (name) => startNames.has(name)),
  );
  console.log(`${organismName}: ${fetched.length} records, ${partnerNames.size} partners kept.`);
  return kept.filter(
    ({ subject, object }) => partnerNames.has(subject.name) || partnerNames.has(object.name),
  );
}

/**
 * Resolves new, matched names to Wikidata items that bear the same scientific name, found through
 * GloBI's taxon links and Wikidata's own scientific names.
 */
async function chooseWikidataTaxa(candidates: GlobiTaxon[]) {
  const names = candidates
    .filter((taxon) => !existingIdByName.has(taxon.name) && !isUnmatchedName(taxon))
    .map(({ name }) => name);
  const linkedIdsByName = new Map(
    await mapConcurrently(
      names,
      async (name) => [name, parseTaxonLinks(await fetchTaxonLinks(name))] as const,
    ),
  );
  const namesakeQidsByName = await fetchWikidataQidsByTaxonName(names);
  const qidsByName = new Map(
    names.map((name) => [
      name,
      [...listLinkedQids(linkedIdsByName.get(name) ?? []), ...(namesakeQidsByName.get(name) ?? [])],
    ]),
  );
  const wikidataTaxa = await fetchWikidataTaxa([...new Set([...qidsByName.values()].flat())]);
  return new Map(
    [...qidsByName].flatMap(([name, qids]) => {
      const choice = chooseWikidataTaxon(
        name,
        qids.flatMap((qid) => wikidataTaxa.get(qid) ?? []),
        linkedIdsByName.get(name),
      );
      return choice ? [[name, choice] as const] : [];
    }),
  );
}

async function mapConcurrently<Item, Result>(items: Item[], map: (item: Item) => Promise<Result>) {
  const results: Result[] = [];
  for (let start = 0; start < items.length; start += concurrency) {
    results.push(...(await Promise.all(items.slice(start, start + concurrency).map(map))));
  }
  return results;
}
