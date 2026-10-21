import type { GraphNode } from "../../shared/graph";
import { nodeDisplayName } from "../nodeDisplayName";
import { languageName } from "./languageName";

/** A short fact that tells a node apart from others with a similar name. */
export type NodeDetail = {
  text: string;
  /** Whether the text is an organism's scientific name, which is set in italics. */
  isScientific: boolean;
};

/**
 * Lists what distinguishes a node beyond its display name: an organism's scientific label,
 * a word's language, the name that matched a search, and the node's ID when its display name is shared.
 */
export function listNodeDetails(node: GraphNode, isNameShared: boolean, matchedName?: string) {
  const displayName = nodeDisplayName(node, "en");
  const scientificName = node.kind === "organism" ? node.label : undefined;
  const language = node.kind === "word" ? findWordLanguage(node) : undefined;
  const shownTexts = [displayName, scientificName];
  const details = [
    { text: scientificName === displayName ? undefined : scientificName, isScientific: true },
    { text: language, isScientific: false },
    { text: shownTexts.includes(matchedName) ? undefined : matchedName, isScientific: false },
    { text: isNameShared ? node.id : undefined, isScientific: false },
  ];
  return details.filter((detail): detail is NodeDetail => Boolean(detail.text));
}

/** Returns the English name of the language of a word node's own spelling, when known. */
function findWordLanguage(word: GraphNode) {
  const ownName = word.names.find(({ name }) => name === word.label) ?? word.names[0];
  return ownName && languageName(ownName.language);
}
