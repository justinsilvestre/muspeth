import { describe, expect, it } from "vitest";
import {
  dropUnlabelledLinks,
  type SubstanceLink,
  toItemNodes,
  toSubstanceConnection,
} from "./substanceDrafts.ts";

const referenced = { workQids: ["Q7"], urls: [] };
const compoundLink = {
  organismQid: "Q1",
  itemQid: "Q2",
  property: "P703",
  reference: referenced,
} satisfies SubstanceLink;
const productLink = {
  organismQid: "Q1",
  itemQid: "Q3",
  property: "P1672",
  reference: undefined,
} satisfies SubstanceLink;

describe("toSubstanceConnection", () => {
  describe("for a compound found in an organism", () => {
    const connection = toSubstanceConnection(compoundLink, "Q7432", new Map());

    it("links the organism to the compound", () => {
      expect([connection.sourceNodeId, connection.targetNodeId]).toEqual([
        "wikidata:Q1",
        "wikidata:Q2",
      ]);
    });

    it("is observed", () => {
      expect(connection.basis).toBe("observed");
    });

    it("takes the taxonomic level from the organism's rank", () => {
      expect(connection.taxonomicLevel).toBe("species");
    });

    it("carries no quality flag", () => {
      expect(connection.qualityFlags).toEqual([]);
    });
  });

  describe("for a product of an organism", () => {
    const connection = toSubstanceConnection(productLink, undefined, new Map());

    it("is attributed", () => {
      expect(connection.basis).toBe("attributed");
    });

    it("flags the missing reference", () => {
      expect(connection.qualityFlags).toEqual(["unreferenced_statement"]);
    });

    it("has no taxonomic level when the rank is unknown", () => {
      expect(connection.taxonomicLevel).toBeNull();
    });
  });
});

describe("toItemNodes", () => {
  const labels = new Map([["Q3", [{ language: "fr", name: "miel" }]]]);

  it("makes a compound node for a compound", () => {
    expect(toItemNodes([compoundLink], new Map())[0]?.kind).toBe("compound");
  });

  it("makes a cultural object node for a product", () => {
    expect(toItemNodes([productLink], labels)[0]?.kind).toBe("cultural_object");
  });

  it("makes a compound node for an item that is both", () => {
    const both = { ...productLink, itemQid: "Q2" };
    expect(toItemNodes([both, compoundLink], new Map()).map(({ kind }) => kind)).toEqual([
      "compound",
    ]);
  });

  it("labels a node in English, else in any language", () => {
    expect(toItemNodes([productLink], labels)[0]?.label).toBe("miel");
  });

  it("labels a node without names by its identifier", () => {
    expect(toItemNodes([compoundLink], new Map())[0]?.label).toBe("Q2");
  });
});

describe("dropUnlabelledLinks", () => {
  const labels = new Map([["Q3", [{ language: "en", name: "honey" }]]]);

  it("keeps links to labelled items", () => {
    expect(dropUnlabelledLinks([productLink], labels)).toEqual([productLink]);
  });

  it("drops links to items without labels", () => {
    expect(dropUnlabelledLinks([compoundLink], labels)).toEqual([]);
  });
});
