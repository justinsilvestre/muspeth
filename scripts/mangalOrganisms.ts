import type { NodeName } from "../src/shared/graph.ts";
import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { MangalNode } from "./mangalRecords.ts";
import type { WikidataChoice } from "./organismIdentity.ts";

/** Words that stand in for a species name, as in "Andrena sp. 2", "Unidentified sp22" or "msp4". */
const placeholderWordPatterns = [
  /^(sp|spp|msp)(\.|\d|$)/i,
  /^(unidentified|unknown|undetermined|indet\.?|morpho(species|type|sp\.?)?)$/i,
];

/** The identifier of a Web of Life network, which Mangal appends to some names it copied. */
const webOfLifeIdPattern = /\s+([A-Z]{1,2}_[A-Z]{2}_\d{3})$/;

/**
 * Says whether a name only stands in for an unnamed species, such as a morphospecies, so that it
 * means a different organism in each network.
 */
export function isPlaceholderName(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const isNumbered = words.length > 1 && /^\d+$/.test(words.at(-1) ?? "");
  return isNumbered || words.some((word) => placeholderWordPatterns.some((p) => p.test(word)));
}

/** Reads the Web of Life network that Mangal copied a name from, when the name says so. */
export function readWebOfLifeId(name: string) {
  return name.match(webOfLifeIdPattern)?.[1] ?? null;
}

function toCleanName({ originalName }: MangalNode) {
  return originalName.replace(webOfLifeIdPattern, "").trim();
}

/**
 * Gives the name under which a node is matched to existing nodes and Wikidata: its taxon's name,
 * or else its original name. Placeholders are not looked up, since they name no taxon of their own.
 */
export function toLookupName(node: MangalNode) {
  const name = toCleanName(node);
  if (isPlaceholderName(name)) return null;
  return node.taxonomy?.name || name;
}

/**
 * Gives a Mangal node one identifier: an existing node's of the same name, else a Wikidata item's,
 * else the GBIF or NCBI taxon that Mangal matched it to, else Mangal's own.
 * A placeholder gets an identifier of its own within its network.
 */
export function identifyMangalNode(
  node: MangalNode,
  choice: WikidataChoice | null,
  existingIdByName: Map<string, string>,
) {
  const name = toLookupName(node);
  const rank = node.taxonomy?.rank ?? null;
  if (name === null) {
    const label = toCleanName(node) || `node ${node.id}`;
    const id = `mangal:${node.networkId}/${label}`;
    return { id, label, rank, qualityFlags: ["placeholder_species"] satisfies QualityFlag[] };
  }
  const flags = [
    !node.taxonomy && "unmatched_name",
    choice?.isAmbiguous && "ambiguous_wikidata_id",
  ] satisfies (QualityFlag | false | undefined)[];
  return {
    id: existingIdByName.get(name) ?? toNewNodeId(node, name, choice),
    label: name,
    rank,
    qualityFlags: flags.filter((flag) => typeof flag === "string"),
  };
}

function toNewNodeId({ taxonomy }: MangalNode, name: string, choice: WikidataChoice | null) {
  if (choice) return `wikidata:${choice.taxon.qid}`;
  if (taxonomy?.gbif) return `gbif:${taxonomy.gbif}`;
  if (taxonomy?.ncbi) return `ncbi:${taxonomy.ncbi}`;
  return `mangal:${name}`;
}

/** Lists the Wikidata item's labels for a node, other than its scientific name. */
export function listMangalNodeNames(name: string, choice: WikidataChoice | null) {
  return (choice?.taxon.labels ?? []).filter(
    (label) => label.name.toLowerCase() !== name.toLowerCase(),
  ) satisfies NodeName[];
}
