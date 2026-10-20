import { type Museum, toArtworkNode, toDepictedInConnection } from "./artworkDrafts.ts";
import { type ArtworkMatch, selectArtworkMatches, toMatchFlags } from "./artworkSelection.ts";

export const metMuseum = {
  datasetId: "met-open-access",
  datasetCitation: "The Metropolitan Museum of Art, Open Access collection (CC0).",
} satisfies Museum;

export const clevelandMuseum = {
  datasetId: "cleveland-open-access",
  datasetCitation: "The Cleveland Museum of Art, Open Access collection (CC0).",
} satisfies Museum;

/** Converts the matches of one museum into artwork nodes and connections from the organisms. */
export function toMuseumImport(matches: ArtworkMatch[], museum: Museum) {
  const selected = selectArtworkMatches(matches);
  return {
    nodes: [
      ...new Map(selected.map(({ artwork }) => [artwork.id, toArtworkNode(artwork)])).values(),
    ],
    connections: selected.map((match) =>
      toDepictedInConnection(match.organismId, match.artwork, museum, toMatchFlags(match)),
    ),
  };
}
