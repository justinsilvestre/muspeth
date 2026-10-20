import type { MangalNetworkContent } from "./mangalConnections.ts";
import { readSourceCollection, toNetworkKey, toNetworkUrl } from "./mangalNetworkSources.ts";
import { readWebOfLifeId } from "./mangalOrganisms.ts";
import type { NetworkCopy } from "./networkCopiesSql.ts";

/** GloBI re-imports every Mangal network, without its network identity. */
const globiCopy = {
  collection: "globi",
  networkId: "globalbioticinteractions/mangal",
  url: "https://github.com/globalbioticinteractions/mangal",
};

/**
 * Lists the other copies of a canonical network: the group's other Mangal networks, the curated
 * collections that Mangal copied them from, and GloBI's re-import.
 */
export function listNetworkCopies(canonical: MangalNetworkContent, group: MangalNetworkContent[]) {
  const canonicalNetworkId = toNetworkKey(canonical.network);
  const copies = [
    ...group
      .filter((content) => content !== canonical)
      .map(({ network }) => ({
        collection: "mangal",
        networkId: toNetworkKey(network),
        url: toNetworkUrl(network),
      })),
    ...group.flatMap(toCollectionCopy),
    globiCopy,
  ];
  const uniqueCopies = new Map(copies.map((copy) => [JSON.stringify(copy), copy]));
  return [...uniqueCopies.values()].map(
    (copy) => ({ canonicalNetworkId, ...copy }) satisfies NetworkCopy,
  );
}

/** Gives the curated collection's copy of a network, identified by the names Mangal copied. */
function toCollectionCopy({ reference, nodes }: MangalNetworkContent) {
  const collection = readSourceCollection(reference);
  if (!collection) return [];
  const webOfLifeIds = nodes.map(({ originalName }) => readWebOfLifeId(originalName));
  const networkId = collection === "web-of-life" ? (webOfLifeIds.find(Boolean) ?? null) : null;
  return [{ collection, networkId, url: reference?.dataUrl ?? null }];
}
