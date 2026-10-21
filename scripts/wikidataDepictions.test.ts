import { describe, expect, it } from "vitest";
import type { NodeMedia } from "./graphDrafts.ts";
import {
  type DepictionCandidate,
  keepGenusAncestors,
  listDepictionCandidates,
  pickImageTitles,
  selectDepictionCandidates,
  toDepictionMatch,
} from "./wikidataDepictions.ts";

const entity = "http://www.wikidata.org/entity/";
const pine = { id: "wikidata:Q1", qid: "Q1", ancestorQids: ["Q9"] };
const media = {
  url: "https://upload.wikimedia.org/a.jpg",
  licence: "Public domain",
  credit: "Utagawa Hiroshige",
  pageUrl: "https://commons.wikimedia.org/wiki/File:A.jpg",
} satisfies NodeMedia;

function makeCandidate(workQid: string, by: DepictionCandidate["by"] = "id") {
  return {
    organismId: pine.id,
    workQid,
    subjectQid: by === "id" ? "Q1" : "Q9",
    by,
  } satisfies DepictionCandidate;
}

function makeDetailRow(overrides: Record<string, string> = {}) {
  return {
    work: `${entity}Q100`,
    subject: `${entity}Q1`,
    workLabel: "Pine Trees",
    image: "http://commons.wikimedia.org/wiki/Special:FilePath/A.jpg",
    inception: "1857-01-01T00:00:00Z",
    creatorLabel: "Utagawa Hiroshige",
    collectionLabel: "Brooklyn Museum",
    ...overrides,
  };
}

describe("keepGenusAncestors", () => {
  it("keeps genera and subgenera, but not families", () => {
    const ranks = new Map([
      ["Q2", "Q34740"],
      ["Q3", "Q3238261"],
      ["Q4", "Q35409"],
    ]);
    expect(keepGenusAncestors(["Q2", "Q3", "Q4"], ranks)).toEqual(["Q2", "Q3"]);
  });
});

describe("listDepictionCandidates", () => {
  const rows = [
    { subject: `${entity}Q1`, work: `${entity}Q100` },
    { subject: `${entity}Q9`, work: `${entity}Q200` },
  ];

  it("pairs an organism with the works that depict it, by identifier", () => {
    expect(listDepictionCandidates(rows, [pine])[0]).toEqual(makeCandidate("Q100"));
  });

  it("pairs an organism with the works that depict a taxon above it", () => {
    expect(listDepictionCandidates(rows, [pine])[1]).toEqual(makeCandidate("Q200", "ancestor"));
  });
});

describe("selectDepictionCandidates", () => {
  it("keeps works that depict the organism itself before those that depict an ancestor", () => {
    const candidates = [makeCandidate("Q5", "ancestor"), makeCandidate("Q50")];
    expect(selectDepictionCandidates(candidates, 1)).toEqual([makeCandidate("Q50")]);
  });

  it("keeps works in the order of their item numbers", () => {
    const candidates = [makeCandidate("Q30"), makeCandidate("Q4")];
    expect(selectDepictionCandidates(candidates, 1)).toEqual([makeCandidate("Q4")]);
  });

  it("keeps a work once, with its best match", () => {
    const candidates = [makeCandidate("Q5", "ancestor"), makeCandidate("Q5")];
    expect(selectDepictionCandidates(candidates, 10)).toEqual([makeCandidate("Q5")]);
  });
});

describe("pickImageTitles", () => {
  it("picks the first image of each item in alphabetical order", () => {
    const rows = [
      { item: `${entity}Q1`, image: "http://commons.wikimedia.org/wiki/Special:FilePath/B.jpg" },
      { item: `${entity}Q1`, image: "http://commons.wikimedia.org/wiki/Special:FilePath/A.jpg" },
    ];
    expect(pickImageTitles(rows, "item").get("Q1")).toBe("File:A.jpg");
  });
});

describe("toDepictionMatch", () => {
  it("names the artwork node by the work's Wikidata item", () => {
    const match = toDepictionMatch(makeCandidate("Q100"), [makeDetailRow()], media);
    expect(match?.artwork.id).toBe("wikidata:Q100");
  });

  it("cites the work's title, creator, year and collection", () => {
    const match = toDepictionMatch(makeCandidate("Q100"), [makeDetailRow()], media);
    expect(match?.artwork.citation).toBe("Pine Trees, Utagawa Hiroshige, 1857. Brooklyn Museum.");
  });

  it("links the image under its own licence and credit", () => {
    const match = toDepictionMatch(makeCandidate("Q100"), [makeDetailRow()], media);
    expect(match?.artwork).toMatchObject({
      imageLicence: "Public domain",
      imageCredit: "Utagawa Hiroshige",
    });
  });

  it("skips creators and collections that Wikidata gives only as unknown values", () => {
    const row = makeDetailRow({ collectionLabel: "http://www.wikidata.org/.well-known/genid/1" });
    const match = toDepictionMatch(makeCandidate("Q100"), [row], media);
    expect(match?.artwork.citation).toBe("Pine Trees, Utagawa Hiroshige, 1857.");
  });

  it("flags a depiction whose statement cites no reference", () => {
    const match = toDepictionMatch(makeCandidate("Q100"), [makeDetailRow()], media);
    expect(match?.otherFlags).toEqual(["unreferenced_statement"]);
  });

  it("does not flag a depiction whose statement cites a reference", () => {
    const row = makeDetailRow({ reference: `${entity}reference/abc` });
    expect(toDepictionMatch(makeCandidate("Q100"), [row], media)?.otherFlags).toEqual([]);
  });

  it("gives nothing when the image has no known licence", () => {
    expect(toDepictionMatch(makeCandidate("Q100"), [makeDetailRow()], null)).toBeNull();
  });
});
