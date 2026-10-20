/** Builds small Mangal networks for tests. */
import type { MangalNetworkContent } from "./mangalConnections.ts";
import type { MangalInteraction, MangalNode, MangalReference } from "./mangalRecords.ts";

export const names = [
  "Apis mellifera",
  "Bombus terrestris",
  "Trifolium repens",
  "Lotus corniculatus",
];
export const webOfLife = {
  id: 1,
  doi: null,
  firstAuthor: "kato",
  year: "1993",
  bibtex: null,
  paperUrl: null,
  dataUrl: "http://www.web-of-life.es/map.php?type=5",
} satisfies MangalReference;

export function makeNodes(networkId: number, nodeNames = names) {
  return nodeNames.map(
    (originalName, index) =>
      ({
        id: networkId * 10 + index,
        networkId,
        originalName,
        taxonomy: null,
      }) satisfies MangalNode,
  );
}

/** Links each of the first two nodes to each of the last two. */
export function makeLinks(nodes: MangalNode[], value = 1) {
  const [first, second, third, fourth] = nodes.map(({ id }) => id);
  return [
    [first, third],
    [first, fourth],
    [second, third],
  ].map(
    ([nodeFrom = 0, nodeTo = 0]) =>
      ({
        nodeFrom,
        nodeTo,
        type: "mutualism",
        date: null,
        value,
        attribute: null,
      }) satisfies MangalInteraction,
  );
}

export function makeContent(id: number, overrides: Partial<MangalNetworkContent> = {}) {
  const nodes = overrides.nodes ?? makeNodes(id);
  return {
    network: { id, name: `n${id}`, date: null, geometry: null, description: "", datasetId: 1 },
    dataset: null,
    reference: null,
    nodes,
    interactions: makeLinks(nodes),
    ...overrides,
  } satisfies MangalNetworkContent;
}
