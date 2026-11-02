import { describe, expect, it } from "vitest";
import type { BodySet } from "./BodySet";
import { partnerOf } from "./partnerOf";

const image = { url: "https://example.org/bee.jpg", credit: null, licence: null, pageUrl: null };

function setWith(id: string, bodies: BodySet["bodies"]) {
  return {
    id,
    name: id,
    group: "Tests",
    description: "",
    bodyNoun: { one: "thing", many: "things" },
    labelStyle: "species",
    bodies,
    sharings: [],
  } satisfies BodySet;
}

describe("partnerOf", () => {
  it("finds a partner's picture in another set", () => {
    const plants = setWith("plants", []);
    const visitors = setWith("visitors", [{ id: "bee", name: "Apis mellifera", image }]);
    expect(partnerOf("Apis mellifera", plants, [plants, visitors])?.image).toBe(image);
  });

  it("prefers the set that says more about the partner", () => {
    const plants = setWith("plants", [{ id: "bee", name: "Apis mellifera" }]);
    const visitors = setWith("visitors", [
      { id: "bee", name: "Apis mellifera", commonName: "Honey bee" },
    ]);
    expect(partnerOf("Apis mellifera", plants, [plants, visitors])?.commonName).toBe("Honey bee");
  });

  it("gives nothing for a partner no set knows", () => {
    const plants = setWith("plants", []);
    expect(partnerOf("Apis mellifera", plants, [plants])).toBeUndefined();
  });
});
