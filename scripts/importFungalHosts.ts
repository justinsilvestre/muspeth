/**
 * Adds the hosts that FungalTraits names for fungal genera, as interactions from each genus to the
 * organism it lives on or in: the named hosts of the `Specific_hosts` column and the groups of
 * animals named by the animal biotrophic capacity column. Hosts and genera that the graph does not
 * hold yet are added as organisms, at the rank the source names them.
 * Re-running it replaces the connections and organisms of the previous run.
 * Usage: npm run db:import-fungal-hosts
 */
import { cachedFetch } from "./cachedFetch.ts";
import { toFungalHostConnections } from "./fungalHostConnections.ts";
import { type FungalHostRecord, parseFungalHosts } from "./fungalHosts.ts";
import { loadOrganismIdsByLabel } from "./loadOrganismIdsByLabel.ts";
import { identifyNewTraitOrganisms } from "./newTraitOrganisms.ts";
import { fungalTraits } from "./traitDatabases.ts";
import type { TraitRecord } from "./traitRecord.ts";
import { userAgent } from "./userAgent.ts";
import { writeConnectionImport } from "./writeConnectionImport.ts";

const source = "fungaltraits-hosts";
const [table] = fungalTraits.tables;
if (!table) throw new Error("FungalTraits lists no table.");

const existingIdByLabel = loadOrganismIdsByLabel([source]);
const response = await cachedFetch(table.url, { headers: { "user-agent": userAgent } });
if (!response.ok) throw new Error(`${table.url} responded ${response.status}`);
const records = parseFungalHosts(await response.text());
const fungi = await identifyNewTraitOrganisms(
  source,
  records.map(toGenusRecord),
  existingIdByLabel,
);
const hosts = await identifyNewTraitOrganisms(source, listHostRecords(records), existingIdByLabel);
const connections = toFungalHostConnections(records, fungi.nodesByName, hosts.nodesByName, {
  licence: fungalTraits.template.licence,
  sources: fungalTraits.template.sources,
});
writeConnectionImport(source, [...fungi.drafts, ...hosts.drafts], connections);
console.log(
  `Stored ${connections.length} host connections of ${records.length} genera to ${hosts.drafts.length} hosts.`,
);

function toGenusRecord({ genus, gbifHints }: FungalHostRecord) {
  return { name: genus, group: "", traits: null, names: [], gbifHints } satisfies TraitRecord<null>;
}

/** Lists each host once, with the informal name the source used as its English name. */
function listHostRecords(hostRecords: FungalHostRecord[]) {
  const byName = new Map<string, TraitRecord<null>>();
  for (const host of hostRecords.flatMap(({ hosts }) => hosts)) {
    const names = host.englishName ? [{ language: "en", name: host.englishName }] : [];
    const existing = byName.get(host.name);
    byName.set(host.name, {
      name: host.name,
      group: "",
      traits: null,
      names: [...(existing?.names ?? []), ...names],
      gbifHints: { ...existing?.gbifHints, ...host.gbifHints },
    });
  }
  return [...byName.values()];
}
