import type { GraphNode, NodeKind } from "../../shared/graph";
import { nodeDisplayName } from "../nodeDisplayName";

/** A node found by a search, with the name or label that matched the query best, if any. */
export type NodeMatch = {
  node: GraphNode;
  matchedName?: string;
};

type IndexedNode = {
  node: GraphNode;
  displayName: string;
  terms: { text: string; folded: string }[];
};

/** How well a term matches, from best to worst. */
const matchQualities = { exact: 0, prefix: 1, wordPrefix: 2, inside: 3 } as const;

const collator = new Intl.Collator("en");

/** Prepares nodes to be searched by their label and their names in every language. */
export function createNodeSearchIndex(nodes: GraphNode[]) {
  return nodes.map((node) => {
    const texts = new Set([node.label, ...node.names.map(({ name }) => name)]);
    const terms = [...texts].map((text) => ({ text, folded: foldCase(text) }));
    return { node, displayName: nodeDisplayName(node, "en"), terms } satisfies IndexedNode;
  });
}

export type NodeSearchIndex = ReturnType<typeof createNodeSearchIndex>;

/**
 * Returns the nodes whose label or names contain the query, ignoring case.
 * Exact matches come first, then matches at the start of a name, then at the start of a later word,
 * and shorter names come first among equally good matches.
 * An empty query lists every node, ordered by display name.
 */
export function searchNodes(index: NodeSearchIndex, query: string, kind?: NodeKind) {
  const folded = foldCase(query.trim());
  const candidates = kind ? index.filter(({ node }) => node.kind === kind) : index;
  if (!folded) return listByDisplayName(candidates);
  return candidates
    .flatMap((entry) => rankEntry(entry, folded))
    .sort((a, b) => a.quality - b.quality || a.length - b.length || compareNames(a, b))
    .map(({ node, matchedName }) => ({ node, matchedName }) satisfies NodeMatch);
}

function listByDisplayName(entries: IndexedNode[]) {
  return entries
    .toSorted((a, b) => collator.compare(a.displayName, b.displayName))
    .map(({ node }) => ({ node, matchedName: undefined }) satisfies NodeMatch);
}

/** Returns the entry's best matching term with its quality, or nothing when no term matches. */
function rankEntry({ node, displayName, terms }: IndexedNode, query: string) {
  let best: { quality: number; length: number; matchedName: string } | undefined;
  for (const { text, folded } of terms) {
    const quality = rateMatch(folded, query);
    if (quality === undefined) continue;
    if (!best || quality < best.quality || (quality === best.quality && text.length < best.length))
      best = { quality, length: text.length, matchedName: text };
  }
  return best ? [{ ...best, node, displayName }] : [];
}

function rateMatch(term: string, query: string) {
  if (term === query) return matchQualities.exact;
  if (term.startsWith(query)) return matchQualities.prefix;
  const position = term.indexOf(query);
  if (position < 0) return undefined;
  return isWordStart(term, position) ? matchQualities.wordPrefix : matchQualities.inside;
}

function isWordStart(text: string, position: number) {
  return !/[\p{L}\p{N}]/u.test(text.slice(0, position).at(-1) ?? "");
}

function compareNames(a: { displayName: string }, b: { displayName: string }) {
  return collator.compare(a.displayName, b.displayName);
}

function foldCase(text: string) {
  return text.normalize("NFKC").toLowerCase();
}
