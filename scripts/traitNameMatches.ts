import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { GbifTaxon } from "./gbifTaxon.ts";

/** A name under which a trait database may list an organism, with the doubts that using it brings. */
export type TraitNameCandidate = { name: string; qualityFlags: QualityFlag[] };

/**
 * Lists the names under which a species-level trait database may list an organism, best first:
 * its own name, GBIF's reading of it, its accepted name if it is a synonym, and its synonyms.
 */
export function listSpeciesNames(label: string, taxon: GbifTaxon, synonymNames: string[] = []) {
  const matchFlags = listMatchFlags(taxon);
  const alternativeFlags = keepFlags([...matchFlags, "trait_name_synonym"]);
  const acceptedName = taxon.isSynonym ? taxon.species : null;
  return [
    { name: label, qualityFlags: [] },
    ...(taxon.canonicalName ? [{ name: taxon.canonicalName, qualityFlags: matchFlags }] : []),
    ...(acceptedName ? [{ name: acceptedName, qualityFlags: alternativeFlags }] : []),
    ...synonymNames.map((name) => ({ name, qualityFlags: alternativeFlags })),
  ] satisfies TraitNameCandidate[];
}

/**
 * Lists the genus names under which a genus-level trait database may list an organism, best first:
 * the genus in its own name, then the accepted genus that GBIF places it in.
 * Using a genus for a species marks the link as derived from a coarser level.
 */
export function listGenusNames(label: string, taxon: GbifTaxon) {
  const [ownGenus = "", ...rest] = label.trim().split(/\s+/);
  const levelFlags = keepFlags([rest.length > 0 && "derived_from_coarser_level"]);
  const isFuzzy = taxon.matchType === "FUZZY";
  const acceptedGenusFlags = keepFlags([
    ...levelFlags,
    isFuzzy && "fuzzy_name_match",
    !isFuzzy && "trait_name_synonym",
  ]);
  return [
    { name: ownGenus, qualityFlags: levelFlags },
    ...(taxon.genus && taxon.genus !== ownGenus
      ? [{ name: taxon.genus, qualityFlags: acceptedGenusFlags }]
      : []),
  ] satisfies TraitNameCandidate[];
}

function listMatchFlags(taxon: GbifTaxon) {
  return keepFlags([taxon.matchType === "FUZZY" && "fuzzy_name_match"]);
}

function keepFlags(flags: (QualityFlag | false)[]) {
  return flags.filter((flag) => flag !== false);
}

/** Picks the first candidate name that the trait database lists. */
export function findTraitName(candidates: TraitNameCandidate[], listedNames: Set<string>) {
  return candidates.find(({ name }) => listedNames.has(name)) ?? null;
}
