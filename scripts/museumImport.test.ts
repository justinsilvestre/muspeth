import { describe, expect, it } from "vitest";
import type { Artwork } from "./artworkDrafts.ts";
import type { ArtworkMatch } from "./artworkSelection.ts";
import { metMuseum, toMuseumImport } from "./museumImport.ts";

function makeMatch(organismId: string, artworkId: string) {
  const artwork = {
    id: artworkId,
    title: "Title",
    url: "https://example.org",
    imageUrl: "https://example.org/a.jpg",
    imageLicence: "CC0-1.0",
    date: null,
    citation: "Citation.",
  } satisfies Artwork;
  return { organismId, artwork, by: { name: "bee", kind: "common" } } satisfies ArtworkMatch;
}

describe("toMuseumImport", () => {
  it("makes one node for an artwork that depicts several organisms", () => {
    const matches = [makeMatch("o1", "met:1"), makeMatch("o2", "met:1")];
    expect(toMuseumImport(matches, metMuseum).nodes).toHaveLength(1);
  });

  it("makes one connection for each organism and artwork", () => {
    const matches = [makeMatch("o1", "met:1"), makeMatch("o2", "met:1")];
    expect(toMuseumImport(matches, metMuseum).connections).toHaveLength(2);
  });

  it("flags connections matched by name", () => {
    const [connection] = toMuseumImport([makeMatch("o1", "met:1")], metMuseum).connections;
    expect(connection?.qualityFlags).toEqual(["text_match"]);
  });
});
