import type { NodeName } from "../src/shared/graph.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import {
  isReferenced,
  type StatementReference,
  toReferenceSources,
  type WikidataWork,
} from "./wikidataReferences.ts";

/** Wikidata publishes its data under CC0. */
const licence = "CC0-1.0";

const taxonRankNames = {
  Q7432: "species",
  Q34740: "genus",
  Q35409: "family",
  Q36602: "order",
  Q37517: "class",
  Q38348: "phylum",
  Q36732: "kingdom",
  Q68947: "subspecies",
  Q767728: "variety",
  Q227936: "tribe",
  Q2136103: "superfamily",
  Q3238261: "subgenus",
  Q5867051: "subclass",
} as Record<string, string>;

/**
 * A statement that links an organism to a compound it contains (property P703, "found in taxon"),
 * or to a product people take from it (property P1672, "this taxon is source of").
 */
export type SubstanceLink = {
  organismQid: string;
  itemQid: string;
  property: "P703" | "P1672";
  reference: StatementReference | undefined;
};

const properties = {
  P703: {
    relation: "contains compound",
    basis: "observed",
    citation: 'Wikidata, property P703 "found in taxon"',
  },
  P1672: {
    relation: "source of",
    basis: "attributed",
    citation: 'Wikidata, property P1672 "this taxon is source of"',
  },
} as const;

/** Converts a statement into a connection from the organism to the compound or product. */
export function toSubstanceConnection(
  link: SubstanceLink,
  rankQid: string | undefined,
  works: Map<string, WikidataWork>,
) {
  const { relation, basis, citation } = properties[link.property];
  const flags = (
    isReferenced(link.reference) ? [] : ["unreferenced_statement"]
  ) satisfies QualityFlag[];
  return {
    sourceNodeId: `wikidata:${link.organismQid}`,
    targetNodeId: `wikidata:${link.itemQid}`,
    kind: "shared_substance",
    relation,
    basis,
    taxonomicLevel: (rankQid && taxonRankNames[rankQid]) || null,
    licence,
    qualityFlags: flags,
    sources: toReferenceSources(citation, link.itemQid, link.reference, works),
  } satisfies ConnectionDraft;
}

/**
 * Makes a node for each compound or product that the links lead to.
 * A compound is a chemical substance. A product, such as honey or silk, is a material that people
 * take from an organism and use, so it is a cultural object, unless the same item is also a compound.
 */
export function toItemNodes(links: SubstanceLink[], labelsByQid: Map<string, NodeName[]>) {
  const compoundQids = new Set(links.filter(({ property }) => property === "P703").map(toItemQid));
  return [...new Set(links.map(toItemQid))].map((qid) => {
    const names = labelsByQid.get(qid) ?? [];
    return {
      id: `wikidata:${qid}`,
      kind: compoundQids.has(qid) ? "compound" : "cultural_object",
      label: names.find(({ language }) => language === "en")?.name ?? names[0]?.name ?? qid,
      names,
    } satisfies NodeDraft;
  });
}

function toItemQid({ itemQid }: SubstanceLink) {
  return itemQid;
}

/** Leaves out links to items that have no label in any kept language, which would read as a bare identifier. */
export function dropUnlabelledLinks(links: SubstanceLink[], labelsByQid: Map<string, NodeName[]>) {
  return links.filter(({ itemQid }) => (labelsByQid.get(itemQid)?.length ?? 0) > 0);
}
