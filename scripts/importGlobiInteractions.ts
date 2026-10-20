/**
 * Loads GloBI interaction records one step outward from the organisms that were not themselves
 * added by this import, adding the partner organisms as nodes.
 * Re-running it replaces the connections of the previous run.
 * Usage: npm run db:import-interactions -- [--remote]
 * Without --remote, it writes to the local development database.
 */
import { executeD1Script, queryD1 } from "./d1.ts";
import { fetchGlobiRecords, fetchWikidataQids } from "./globiApi.ts";
import { mergeConnections, toConnectionDraft } from "./globiConnections.ts";
import { toGlobiImportSql } from "./globiImportSql.ts";
import {
  type GlobiRecord,
  type GlobiTaxon,
  isExcludedDataset,
  orientRecord,
  selectPartnerNames,
} from "./globiRecords.ts";
import {
  chooseWikidataTaxon,
  identifyOrganism,
  isUnmatchedName,
  listOrganismNames,
} from "./organismIdentity.ts";
import { fetchWikidataQidsByTaxonName, fetchWikidataTaxa } from "./wikidataApi.ts";

const recordLimit = 20_000;
const partnerLimit = 60;
const concurrency = 8;

const organisms = queryD1<{ id: string; label: string; is_start: number }>(
  `SELECT id, label,
    EXISTS (SELECT 1 FROM connections WHERE (source_node_id = nodes.id OR target_node_id = nodes.id) AND source <> 'globi')
    OR NOT EXISTS (SELECT 1 FROM connections WHERE source_node_id = nodes.id OR target_node_id = nodes.id) AS is_start
  FROM nodes WHERE kind = 'organism'`,
);
const existingIdByName = new Map(organisms.map(({ id, label }) => [label, id]));
const startNames = new Set(organisms.filter(({ is_start }) => is_start).map(({ label }) => label));
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
const nodes = [...taxa.values()].map((taxon) => ({
  id: identities.get(taxon.name)?.id ?? "",
  label: taxon.name,
  names: listOrganismNames(taxon, choices.get(taxon.name) ?? null),
}));
const connections = mergeConnections(
  records.map((record) => toConnectionDraft(record, identities)),
);
executeD1Script(toGlobiImportSql(nodes, connections));
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
 * Resolves new, matched names to Wikidata items through GloBI's taxon links, or else through
 * Wikidata's own scientific names.
 */
async function chooseWikidataTaxa(candidates: GlobiTaxon[]) {
  const unresolved = candidates.filter(
    (taxon) => !existingIdByName.has(taxon.name) && !isUnmatchedName(taxon),
  );
  const qidsByName = new Map(
    await mapConcurrently(
      unresolved,
      async (taxon) => [taxon.name, await fetchWikidataQids(taxon.name)] as const,
    ),
  );
  const unlinkedNames = [...qidsByName]
    .filter(([, qids]) => qids.length === 0)
    .map(([name]) => name);
  for (const [name, qids] of await fetchWikidataQidsByTaxonName(unlinkedNames)) {
    qidsByName.set(name, qids);
  }
  const wikidataTaxa = await fetchWikidataTaxa([...new Set([...qidsByName.values()].flat())]);
  return new Map(
    [...qidsByName].flatMap(([name, qids]) => {
      const choice = chooseWikidataTaxon(
        name,
        qids.flatMap((qid) => wikidataTaxa.get(qid) ?? []),
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
