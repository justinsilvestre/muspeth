import { describe, expect, it } from "vitest";
import type { Artwork } from "./artworkDrafts.ts";
import { type ArtworkMatch, selectArtworkMatches, toMatchFlags } from "./artworkSelection.ts";

function makeMatch(artworkId: string, by: ArtworkMatch["by"], organismId = "o1") {
  const artwork = { id: artworkId } as Artwork;
  return { organismId, artwork, by } satisfies ArtworkMatch;
}
const common = { name: "pine", kind: "common" } as const;
const scientific = { name: "Pinus", kind: "scientific" } as const;

describe("toMatchFlags", () => {
  it("flags a match by name as a text match", () => {
    expect(toMatchFlags(makeMatch("a", common))).toEqual(["text_match"]);
  });

  it("does not flag a match by identifier", () => {
    expect(toMatchFlags(makeMatch("a", "id"))).toEqual([]);
  });

  it("flags a match by an ancestor's identifier as derived from a coarser level", () => {
    expect(toMatchFlags(makeMatch("a", "ancestor"))).toEqual(["derived_from_coarser_level"]);
  });

  it("adds the match's other doubts", () => {
    const match = {
      ...makeMatch("a", "ancestor"),
      otherFlags: ["unreferenced_statement" as const],
    };
    expect(toMatchFlags(match)).toEqual(["derived_from_coarser_level", "unreferenced_statement"]);
  });
});

describe("selectArtworkMatches", () => {
  it("keeps matches by identifier before matches by name", () => {
    const matches = [makeMatch("a", scientific), makeMatch("b", "id")];
    expect(selectArtworkMatches(matches, 1).map(({ artwork }) => artwork.id)).toEqual(["b"]);
  });

  it("keeps matches by an ancestor's identifier before matches by name", () => {
    const matches = [makeMatch("a", scientific), makeMatch("b", "ancestor")];
    expect(selectArtworkMatches(matches, 1).map(({ artwork }) => artwork.id)).toEqual(["b"]);
  });

  it("keeps long common names before short ones", () => {
    const longName = { name: "japanese red pine", kind: "common" } as const;
    const matches = [makeMatch("a", common), makeMatch("b", longName)];
    expect(selectArtworkMatches(matches, 1).map(({ artwork }) => artwork.id)).toEqual(["b"]);
  });

  it("keeps an artwork once, with its best match", () => {
    const matches = [makeMatch("a", common), makeMatch("a", "id")];
    expect(selectArtworkMatches(matches).map(({ by }) => by)).toEqual(["id"]);
  });

  it("limits each organism separately", () => {
    const matches = [makeMatch("a", common), makeMatch("b", common), makeMatch("a", common, "o2")];
    expect(selectArtworkMatches(matches, 1)).toHaveLength(2);
  });

  it("orders artworks of the same rank by identifier as numbers", () => {
    const matches = [makeMatch("met:10", common), makeMatch("met:9", common)];
    expect(selectArtworkMatches(matches).map(({ artwork }) => artwork.id)).toEqual([
      "met:9",
      "met:10",
    ]);
  });
});
