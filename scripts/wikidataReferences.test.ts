import { describe, expect, it } from "vitest";
import {
  collectReferences,
  isReferenced,
  toReferenceSources,
  toWorks,
} from "./wikidataReferences.ts";

const entity = (qid: string) => `http://www.wikidata.org/entity/${qid}`;
const dataset = "Wikidata, found in taxon (P703)";

describe("collectReferences", () => {
  it("gathers the works that cite one statement", () => {
    const rows = [
      { compound: entity("Q1"), work: entity("Q7") },
      { compound: entity("Q1"), work: entity("Q8") },
    ];
    const references = collectReferences(rows, (row) => row.compound ?? "");
    expect(references.get(entity("Q1"))?.workQids).toEqual(["Q7", "Q8"]);
  });

  it("lists a repeated work once", () => {
    const rows = [
      { compound: "a", work: entity("Q7") },
      { compound: "a", work: entity("Q7") },
    ];
    expect(collectReferences(rows, (row) => row.compound ?? "").get("a")?.workQids).toEqual(["Q7"]);
  });
});

describe("toWorks", () => {
  it("prefers the title over the label and takes the year of the date", () => {
    const rows = [
      { work: entity("Q7"), title: "Title", label: "Label", date: "2014-10-24T00:00:00Z" },
    ];
    expect(toWorks(rows).get("Q7")).toEqual({ title: "Title", doi: null, year: "2014" });
  });

  it("merges rows from different graphs", () => {
    const works = toWorks([
      { work: entity("Q7"), doi: "10.1/x" },
      { work: entity("Q7"), title: "Title" },
    ]);
    expect(works.get("Q7")).toEqual({ title: "Title", doi: "10.1/x", year: null });
  });
});

describe("toReferenceSources", () => {
  const works = new Map([["Q7", { title: "Title", doi: "10.1/x", year: "2014" }]]);

  it("cites a work with its DOI", () => {
    const [source] = toReferenceSources(dataset, "Q1", { workQids: ["Q7"], urls: [] }, works);
    expect(source).toMatchObject({
      studyCitation: "Title (2014)",
      studyUrl: "https://doi.org/10.1/x",
    });
  });

  it("links a work without a DOI to its Wikidata item", () => {
    const [source] = toReferenceSources(dataset, "Q1", { workQids: ["Q9"], urls: [] }, works);
    expect(source?.studyUrl).toBe("https://www.wikidata.org/wiki/Q9");
  });

  it("credits an unreferenced statement to the statement's item", () => {
    const [source] = toReferenceSources(dataset, "Q1", undefined, works);
    expect(source).toMatchObject({
      studyCitation: null,
      studyUrl: "https://www.wikidata.org/wiki/Q1",
    });
  });

  it("keeps at most five references", () => {
    const workQids = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"];
    expect(toReferenceSources(dataset, "Q1", { workQids, urls: [] }, works)).toHaveLength(5);
  });
});

describe("isReferenced", () => {
  it("is false for a statement without references", () => {
    expect(isReferenced(undefined)).toBe(false);
  });

  it("is true for a statement that cites an address", () => {
    expect(isReferenced({ workQids: [], urls: ["https://example.org"] })).toBe(true);
  });
});
