import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { listPlacedOrganismMedia, listTaxa, listTaxonPlacements } from "./taxonomyQueries";
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

describe("listPlacedOrganismMedia", () => {
  it("gives the images of placed organisms only, keyed by node ID", async () => {
    await insertSampleTaxonomy();
    await env.DB.prepare(
      "UPDATE nodes SET media_url = 'https://upload.wikimedia.org/f.jpg', media_licence = 'CC0-1.0'",
    ).run();
    const media = await listPlacedOrganismMedia(env.DB);
    expect(Object.keys(media)).toEqual(["pine"]);
  });
});
