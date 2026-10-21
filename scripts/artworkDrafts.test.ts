import { describe, expect, it } from "vitest";
import {
  type Artwork,
  toArtworkNode,
  toDepictedInConnection,
  toYearInterval,
} from "./artworkDrafts.ts";

const artwork = {
  id: "met:1",
  title: "Pine Tree",
  url: "https://example.org/1",
  imageUrl: "https://example.org/1.jpg",
  imageLicence: "CC0-1.0",
  date: "1897",
  citation: "Pine Tree, c. 1897.",
} satisfies Artwork;
const museum = { datasetId: "met-open-access", datasetCitation: "The Met Open Access" };

describe("toArtworkNode", () => {
  it("links to the picture under its own licence", () => {
    expect(toArtworkNode(artwork).media).toEqual({
      url: "https://example.org/1.jpg",
      licence: "CC0-1.0",
    });
  });

  it("is a cultural object", () => {
    expect(toArtworkNode(artwork).kind).toBe("cultural_object");
  });
});

describe("toDepictedInConnection", () => {
  const connection = toDepictedInConnection("wikidata:Q1", artwork, museum, ["text_match"]);

  it("goes from the organism to the artwork", () => {
    expect([connection.sourceNodeId, connection.targetNodeId]).toEqual(["wikidata:Q1", "met:1"]);
  });

  it("is attributed", () => {
    expect(connection.basis).toBe("attributed");
  });

  it("takes the artwork's date", () => {
    expect(connection.date).toBe("1897");
  });

  it("keeps the quality flags", () => {
    expect(connection.qualityFlags).toEqual(["text_match"]);
  });

  it("cites the artwork and links to its page", () => {
    expect(connection.sources[0]).toMatchObject({
      studyCitation: "Pine Tree, c. 1897.",
      studyUrl: "https://example.org/1",
    });
  });
});

describe("toYearInterval", () => {
  it("writes a single year", () => {
    expect(toYearInterval(1890, 1890)).toBe("1890");
  });

  it("writes an interval", () => {
    expect(toYearInterval(1890, 1899)).toBe("1890/1899");
  });

  it("writes a year before the common era with a sign", () => {
    expect(toYearInterval(-900, -850)).toBe("-0900/-0850");
  });

  it("pads short years", () => {
    expect(toYearInterval(900, 900)).toBe("0900");
  });

  it("writes nothing when no year is known", () => {
    expect(toYearInterval(null, null)).toBeNull();
  });
});
