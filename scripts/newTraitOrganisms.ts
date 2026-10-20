import { matchGbifName } from "./gbifSpeciesApi.ts";
import type { GbifTaxon } from "./gbifTaxon.ts";
import type { TraitNode } from "./likenessConnections.ts";
import { mapConcurrently } from "./mapConcurrently.ts";
import { identifyOrganism, type WikidataTaxon } from "./organismIdentity.ts";
import {
  chooseTraitWikidataTaxon,
  describeTraitOrganism,
  listGbifIds,
  toTraitNodeDraft,
} from "./traitOrganismIdentity.ts";
import type { TraitRecord } from "./traitRecord.ts";
import {
  fetchWikidataQidsByGbifKey,
  fetchWikidataQidsByTaxonName,
  fetchWikidataTaxa,
} from "./wikidataApi.ts";

type Lookup<Traits> = ReturnType<typeof describeTraitOrganism> & {
  record: TraitRecord<Traits>;
  gbif: GbifTaxon | null;
};

/**
 * Identifies the organisms of trait records that the graph does not hold yet, through GBIF and
 * Wikidata, so that each merges with any node that already stands for it.
 * Only exact GBIF matches count, since a near match may be another organism.
 */
export async function identifyNewTraitOrganisms<Traits>(
  source: string,
  records: TraitRecord<Traits>[],
  existingIdByLabel: Map<string, string>,
) {
  const lookups = await mapConcurrently(records, async (record) => {
    const match = await matchGbifName(record.name, record.gbifHints);
    const gbif = match?.matchType === "EXACT" ? match : null;
    return {
      record,
      gbif,
      ...describeTraitOrganism(source, record, gbif),
    } satisfies Lookup<Traits>;
  });
  const candidatesPerLookup = await fetchWikidataCandidates(lookups);
  const identified = lookups.map((lookup, i) =>
    identify(lookup, candidatesPerLookup[i] ?? [], existingIdByLabel),
  );
  return {
    nodesByName: new Map(identified.map(({ name, node }) => [name, [node]])),
    drafts: identified.map(({ draft }) => draft),
  };
}

function identify<Traits>(
  { record, gbif, taxon, qualityFlags }: Lookup<Traits>,
  wikidataCandidates: WikidataTaxon[],
  existingIdByLabel: Map<string, string>,
) {
  const choice = chooseTraitWikidataTaxon(taxon.name, wikidataCandidates, listGbifIds(gbif));
  const existingId = existingIdByLabel.get(taxon.name) ?? existingIdByLabel.get(record.name);
  const identity = identifyOrganism(taxon, choice, existingId);
  return {
    name: record.name,
    node: {
      nodeId: identity.id,
      qualityFlags: [...new Set([...qualityFlags, ...identity.qualityFlags])],
    } satisfies TraitNode,
    draft: toTraitNodeDraft(identity.id, taxon.name, record, choice?.taxon ?? null),
  };
}

/** Fetches, for each organism, the Wikidata items that bear its name or name its GBIF taxon. */
async function fetchWikidataCandidates<Traits>(lookups: Lookup<Traits>[]) {
  const gbifKeysPerLookup = lookups.map(({ gbif }) =>
    gbif ? [gbif.key, gbif.acceptedKey].filter((key) => key !== null) : [],
  );
  const qidsByName = await fetchWikidataQidsByTaxonName(lookups.map(({ taxon }) => taxon.name));
  const qidsByGbifKey = await fetchWikidataQidsByGbifKey([...new Set(gbifKeysPerLookup.flat())]);
  const qidsPerLookup = lookups.map(({ taxon }, i) => [
    ...(qidsByName.get(taxon.name) ?? []),
    ...(gbifKeysPerLookup[i] ?? []).flatMap((key) => qidsByGbifKey.get(key) ?? []),
  ]);
  const taxa = await fetchWikidataTaxa([...new Set(qidsPerLookup.flat())]);
  return qidsPerLookup.map((qids) => qids.flatMap((qid) => taxa.get(qid) ?? []));
}
