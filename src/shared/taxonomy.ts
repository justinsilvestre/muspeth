export type Taxon = {
  id: string;
  /** The enclosing taxon, or null for a kingdom. */
  parentId: string | null;
  rank: string;
  name: string;
};

/** Attaches an organism node to the taxon it was matched to. */
export type TaxonPlacement = {
  nodeId: string;
  taxonId: string;
  qualityFlags: string[];
};
