import { describe, expect, it } from "vitest";
import { chooseCanonical, groupCopies } from "./mangalNetworkCopies.ts";
import { makeContent, makeLinks, makeNodes, names, webOfLife } from "./mangalNetworkFixtures.ts";

describe("groupCopies", () => {
  it("groups networks with the same links and names", () => {
    expect(groupCopies([makeContent(1), makeContent(2)])).toHaveLength(1);
  });

  it("ignores the case and punctuation of names", () => {
    const shouted = makeNodes(
      2,
      names.map((name) => `${name.toUpperCase()}.`),
    );
    expect(groupCopies([makeContent(1), makeContent(2, { nodes: shouted })])).toHaveLength(1);
  });

  it("ignores the direction of links", () => {
    const original = makeContent(1);
    const reversed = makeContent(2);
    reversed.interactions = reversed.interactions.map((link) => ({
      ...link,
      nodeFrom: link.nodeTo,
      nodeTo: link.nodeFrom,
    }));
    expect(groupCopies([original, reversed])).toHaveLength(1);
  });

  it("separates networks with different species", () => {
    const others = makeNodes(2, ["Vespa", "Bombus", "Rosa", "Salix"]);
    expect(groupCopies([makeContent(1), makeContent(2, { nodes: others })])).toHaveLength(2);
  });

  it("separates networks whose links differ", () => {
    const second = makeContent(2);
    second.interactions = second.interactions.slice(1);
    expect(groupCopies([makeContent(1), second])).toHaveLength(2);
  });
});

describe("chooseCanonical", () => {
  it("prefers the authors' own deposit to a curated collection's copy", () => {
    const copied = makeContent(1, { reference: webOfLife });
    expect(chooseCanonical([copied, makeContent(2)])?.network.id).toBe(2);
  });

  it("prefers weighted links to binary ones", () => {
    const weighted = makeContent(2);
    weighted.interactions = makeLinks(weighted.nodes, 7);
    expect(chooseCanonical([makeContent(1), weighted])?.network.id).toBe(2);
  });

  it("otherwise keeps the oldest network", () => {
    expect(chooseCanonical([makeContent(3), makeContent(2)])?.network.id).toBe(2);
  });
});
