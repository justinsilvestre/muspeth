import { describe, expect, it } from "vitest";
import { keepFinestConnections, toStoryConnection } from "./storyConnection.ts";

function makeConnection(taxonomicLevel: string) {
  return toStoryConnection({
    sourceNodeId: "honeyBee",
    targetNodeId: "tmi:A1",
    relation: "appears in motif",
    taxonomicLevel,
    licence: "CC-BY-4.0",
    qualityFlags: [],
    sources: [],
  });
}

describe("toStoryConnection", () => {
  it("records an attributed link through words and stories", () => {
    expect(makeConnection("family")).toMatchObject({
      kind: "shared_words_and_stories",
      basis: "attributed",
    });
  });
});

describe("keepFinestConnections", () => {
  it("keeps the connection at the finest taxonomic level", () => {
    const kept = keepFinestConnections([makeConnection("class"), makeConnection("family")]);
    expect(kept.map(({ taxonomicLevel }) => taxonomicLevel)).toEqual(["family"]);
  });
});
