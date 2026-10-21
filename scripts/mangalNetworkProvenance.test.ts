import { describe, expect, it } from "vitest";
import { makeContent, makeNodes, names, webOfLife } from "./mangalNetworkFixtures.ts";
import { listNetworkCopies } from "./mangalNetworkProvenance.ts";

describe("listNetworkCopies", () => {
  const canonical = makeContent(1);
  const copied = makeContent(2, {
    reference: webOfLife,
    nodes: makeNodes(2, [...names.slice(0, 3), "Lotus corniculatus M_PL_056"]),
  });
  const copies = listNetworkCopies(canonical, [canonical, copied]);

  it("records the group's other Mangal networks", () => {
    expect(copies).toContainEqual({
      canonicalNetworkId: "mangal:1",
      collection: "mangal",
      networkId: "mangal:2",
      url: "https://mangal.io/api/v2/network/2",
    });
  });

  it("records the Web of Life network that Mangal copied", () => {
    expect(copies).toContainEqual({
      canonicalNetworkId: "mangal:1",
      collection: "web-of-life",
      networkId: "M_PL_056",
      url: webOfLife.dataUrl,
    });
  });

  it("records GloBI's re-import", () => {
    expect(copies.map(({ collection }) => collection)).toContain("globi");
  });

  it("does not record the canonical network as its own copy", () => {
    expect(copies.map(({ networkId }) => networkId)).not.toContain("mangal:1");
  });
});
