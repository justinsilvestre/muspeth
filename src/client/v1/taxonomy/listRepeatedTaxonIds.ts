import type { TaxonTreeNode } from "./buildTaxonTree";

/** Collects the IDs of the taxa in a lineage whose names the organism beneath them repeats. */
export function listRepeatedTaxonIds(lineage: TaxonTreeNode[]) {
  const repeatedTaxa = lineage.filter((_, index) => lineage[index + 1]?.isNamedByTaxon);
  return new Set(repeatedTaxa.map((taxon) => taxon.id));
}
