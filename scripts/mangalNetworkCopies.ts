import type { MangalNetworkContent } from "./mangalConnections.ts";
import { readSourceCollection } from "./mangalNetworkSources.ts";
import { readWebOfLifeId } from "./mangalOrganisms.ts";

/** How many of two networks' species names must be shared for them to count as copies. */
const minimumSharedNames = 0.8;

type Fingerprint = { shape: string; names: Set<string> };

/**
 * Groups networks that hold the same content: the same numbers of nodes and links, the same
 * number of links for each node, and mostly the same species names. Citations are not compared,
 * since they are formatted differently from copy to copy.
 */
export function groupCopies(contents: MangalNetworkContent[]) {
  const groups: { fingerprint: Fingerprint; members: MangalNetworkContent[] }[] = [];
  for (const content of contents) {
    const fingerprint = toFingerprint(content);
    const group = groups.find((candidate) => areCopies(candidate.fingerprint, fingerprint));
    if (group) group.members.push(content);
    else groups.push({ fingerprint, members: [content] });
  }
  return groups.map(({ members }) => members);
}

function toFingerprint({ nodes, interactions }: MangalNetworkContent): Fingerprint {
  const pairs = new Set(
    interactions.map(({ nodeFrom, nodeTo }) => [nodeFrom, nodeTo].sort().join(" ")),
  );
  const linkCounts = new Map<string, number>();
  for (const node of [...pairs].flatMap((pair) => pair.split(" "))) {
    linkCounts.set(node, (linkCounts.get(node) ?? 0) + 1);
  }
  const degrees = [...linkCounts.values()].sort((a, b) => a - b);
  return {
    shape: [nodes.length, pairs.size, ...degrees].join(","),
    names: new Set(nodes.map(({ originalName }) => normaliseName(originalName))),
  };
}

function normaliseName(name: string) {
  const webOfLifeId = readWebOfLifeId(name);
  const bareName = webOfLifeId ? name.slice(0, name.lastIndexOf(webOfLifeId)) : name;
  return bareName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function areCopies(first: Fingerprint, second: Fingerprint) {
  if (first.shape !== second.shape) return false;
  const shared = [...first.names].filter((name) => second.names.has(name)).length;
  const all = new Set([...first.names, ...second.names]).size;
  return all === 0 || shared / all >= minimumSharedNames;
}

/**
 * Picks the copy to keep: one from the authors' own deposit before one taken from a curated
 * collection, then the one with the most weighted links, dated links and matched taxa,
 * then the oldest network in Mangal.
 */
export function chooseCanonical(copies: MangalNetworkContent[]) {
  return copies.reduce((best, copy) => (isPreferred(copy, best) ? copy : best));
}

function isPreferred(copy: MangalNetworkContent, other: MangalNetworkContent) {
  const comparison = compareScores(toPreferenceScores(copy), toPreferenceScores(other));
  return comparison > 0 || (comparison === 0 && copy.network.id < other.network.id);
}

function toPreferenceScores({ reference, nodes, interactions }: MangalNetworkContent) {
  const shareOf = <Item>(items: Item[], isCounted: (item: Item) => boolean) =>
    items.length === 0 ? 0 : items.filter(isCounted).length / items.length;
  return [
    readSourceCollection(reference) === null ? 1 : 0,
    shareOf(interactions, ({ value }) => value !== null && value !== 1),
    shareOf(interactions, ({ date }) => date !== null),
    shareOf(nodes, ({ taxonomy }) => taxonomy !== null),
  ];
}

function compareScores(first: number[], second: number[]) {
  const index = first.findIndex((score, position) => score !== second[position]);
  return index === -1 ? 0 : (first[index] ?? 0) - (second[index] ?? 0);
}
