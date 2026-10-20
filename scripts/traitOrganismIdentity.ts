import type { NodeName } from "../src/shared/graph.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import { contradictsGbif, type GbifTaxon } from "./gbifTaxon.ts";
import type { GlobiTaxon } from "./globiRecords.ts";
import type { NodeDraft } from "./graphDrafts.ts";
import { chooseWikidataTaxon, type WikidataTaxon } from "./organismIdentity.ts";
import type { TraitRecord } from "./traitRecord.ts";

/**
 * Describes an organism that a trait database brings into the graph in the form that
 * `identifyOrganism` reads, under GBIF's accepted name for it when the database's name differs.
 * Without a GBIF match, the database's own name stands as its identifier, and is flagged.
 */
export function describeTraitOrganism<Traits>(
  source: string,
  record: TraitRecord<Traits>,
  gbif: GbifTaxon | null,
) {
  const name = (gbif && toAcceptedName(gbif)) || record.name;
  const flags = [
    !gbif && "unmatched_name",
    name !== record.name && "trait_name_synonym",
  ] satisfies (QualityFlag | false)[];
  return {
    taxon: {
      name,
      externalId: gbif ? `GBIF:${gbif.acceptedKey ?? gbif.key}` : `${source}:${record.name}`,
      rank: gbif?.rank?.toLowerCase() ?? null,
      commonNames: null,
    } satisfies GlobiTaxon,
    qualityFlags: flags.filter((flag) => flag !== false),
  };
}

function toAcceptedName({ isSynonym, rank, genus, species, canonicalName }: GbifTaxon) {
  if (!isSynonym) return canonicalName;
  return rank === "GENUS" ? genus : species;
}

/** Lists the GBIF identifiers that help pick the Wikidata item for a GBIF match. */
export function listGbifIds(gbif: GbifTaxon | null) {
  if (!gbif) return [];
  return [gbif.key, gbif.acceptedKey].flatMap((key) => (key === null ? [] : [`gbif:${key}`]));
}

/**
 * Picks the Wikidata item for an organism that a trait database adds: the one item that names its
 * GBIF taxon if there is one, otherwise a namesake that does not name another GBIF taxon.
 */
export function chooseTraitWikidataTaxon(
  name: string,
  candidates: WikidataTaxon[],
  gbifIds: string[],
) {
  const uniqueCandidates = [...new Map(candidates.map((taxon) => [taxon.qid, taxon])).values()];
  const linked = uniqueCandidates.filter(({ externalIds }) =>
    externalIds.some((id) => gbifIds.includes(id)),
  );
  const [onlyLinked] = linked;
  if (onlyLinked && linked.length === 1) return { taxon: onlyLinked, isAmbiguous: false };
  const namesakes = uniqueCandidates.filter((taxon) => !contradictsGbif(taxon, gbifIds));
  return chooseWikidataTaxon(name, namesakes, gbifIds);
}

/** Drafts the node for an organism that a trait database adds, with its names from both sources. */
export function toTraitNodeDraft<Traits>(
  id: string,
  label: string,
  record: TraitRecord<Traits>,
  wikidataTaxon: WikidataTaxon | null,
) {
  const names = [...record.names, ...(wikidataTaxon?.labels ?? [])];
  const uniqueNames = new Map(
    names.map((name) => [`${name.language}\n${name.name.toLowerCase()}`, name]),
  );
  return {
    id,
    kind: "organism",
    label,
    names: [...uniqueNames.values()].filter(
      ({ name }) => name.toLowerCase() !== label.toLowerCase(),
    ) satisfies NodeName[],
  } satisfies NodeDraft;
}
