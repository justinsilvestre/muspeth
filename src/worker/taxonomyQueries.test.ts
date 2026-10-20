import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { listTaxa, listTaxonPlacements } from "./taxonomyQueries";
import { insertSampleTaxonomy } from "./test/insertSampleTaxonomy";

describe("listTaxa", () => {
  it("lists each taxon with its parent", async () => {
    await insertSampleTaxonomy();
    const taxa = await listTaxa(env.DB);
    expect(taxa).toContainEqual({
      id: "gbif:2684241",
      parentId: "gbif:6",
      rank: "genus",
      name: "Pinus",
    });
  });
});

describe("listTaxonPlacements", () => {
  it("parses quality flags into a list", async () => {
    await insertSampleTaxonomy();
    const [placement] = await listTaxonPlacements(env.DB);
    expect(placement).toEqual({
      nodeId: "pine",
      taxonId: "gbif:5285104",
      qualityFlags: ["fuzzy_name_match"],
    });
  });
});
