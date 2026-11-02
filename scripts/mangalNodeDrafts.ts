import type { NodeDraft } from "./graphDrafts.ts";
import { identifyMangalNode, listMangalNodeNames, toLookupName } from "./mangalOrganisms.ts";
import type { MangalNode } from "./mangalRecords.ts";
import type { WikidataChoice } from "./organismIdentity.ts";
import { chooseWikidataTaxa } from "./wikidataChoices.ts";

/** The organism that each Mangal node of a set of networks stands for, by the node's identifier. */
export type MangalIdentities = Map<number, ReturnType<typeof identifyMangalNode>>;

/**
 * Identifies the organism behind each Mangal node: an existing node of the same name, else the
 * Wikidata item for the name, else a node of the import's own.
 */
export async function identifyMangalNodes(
  nodes: MangalNode[],
  existingIdByName: Map<string, string>,
) {
  const names = listLookupNames(nodes).filter((name) => !existingIdByName.has(name));
  const choices = await chooseWikidataTaxa(names, listLinkedIdsByName(nodes));
  const identities: MangalIdentities = new Map(
    nodes.map((node) => {
      const choice = choices.get(toLookupName(node) ?? "") ?? null;
      return [node.id, identifyMangalNode(node, choice, existingIdByName)];
    }),
  );
  return { identities, choices };
}

/** Drafts a node for each organism that at least one connection touches. */
export function toMangalNodeDrafts(
  nodes: MangalNode[],
  identities: MangalIdentities,
  choices: Map<string, WikidataChoice>,
  connectedIds: Set<string>,
) {
  return nodes.flatMap((node) => {
    const identity = identities.get(node.id);
    if (!identity || !connectedIds.has(identity.id)) return [];
    const name = toLookupName(node) ?? identity.label;
    const names = listMangalNodeNames(name, choices.get(name) ?? null);
    return [
      { id: identity.id, kind: "organism", label: identity.label, names } satisfies NodeDraft,
    ];
  });
}

function listLookupNames(nodes: MangalNode[]) {
  return [...new Set(nodes.map(toLookupName).filter((name) => name !== null))];
}

/** Lists the GBIF and NCBI taxa that Mangal matched each name to, for choosing among namesakes. */
export function listLinkedIdsByName(nodes: MangalNode[]) {
  const linkedIds = new Map<string, string[]>();
  for (const node of nodes) {
    const name = toLookupName(node);
    const { gbif, ncbi } = node.taxonomy ?? {};
    const ids = [gbif && `gbif:${gbif}`, ncbi && `ncbi:${ncbi}`].filter(
      (id): id is string => typeof id === "string",
    );
    if (name) linkedIds.set(name, [...(linkedIds.get(name) ?? []), ...ids]);
  }
  return linkedIds;
}
