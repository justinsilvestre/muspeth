import { describe, expect, it } from "vitest";
import { type MetObject, matchMetObject, toMetArtwork } from "./metObjects.ts";

function makeObject(changes: Partial<MetObject> = {}) {
  return {
    objectID: 45734,
    isPublicDomain: true,
    primaryImageSmall: "https://images.metmuseum.org/a.jpg",
    title: "Vase with bees",
    objectDate: "ca. 1900",
    objectBeginDate: 1895,
    objectEndDate: 1905,
    objectURL: "https://www.metmuseum.org/art/collection/search/45734",
    objectWikidata_URL: "",
    artistDisplayName: "Royal Copenhagen",
    accessionNumber: "2022.421.42",
    tags: [{ term: "Bees", Wikidata_URL: "https://www.wikidata.org/wiki/Q7391" }],
    ...changes,
  } satisfies MetObject;
}
const bee = { name: "bee", kind: "common" } as const;

describe("toMetArtwork", () => {
  it("links to the picture under CC0", () => {
    expect(toMetArtwork(makeObject())).toMatchObject({
      imageUrl: "https://images.metmuseum.org/a.jpg",
      imageLicence: "CC0-1.0",
    });
  });

  it("dates the artwork by the years it was made", () => {
    expect(toMetArtwork(makeObject())?.date).toBe("1895/1905");
  });

  it("leaves an undated artwork without a date", () => {
    const undated = makeObject({ objectBeginDate: 0, objectEndDate: 0 });
    expect(toMetArtwork(undated)?.date).toBeNull();
  });

  it("keeps a year 0 that ends a dated span", () => {
    const span = makeObject({ objectBeginDate: -100, objectEndDate: 0 });
    expect(toMetArtwork(span)?.date).toBe("-0100/0000");
  });

  it("uses the Met's number when the object has no Wikidata item", () => {
    expect(toMetArtwork(makeObject())?.id).toBe("met:45734");
  });

  it("uses the object's Wikidata item when it has one", () => {
    const object = makeObject({ objectWikidata_URL: "https://www.wikidata.org/wiki/Q432253" });
    expect(toMetArtwork(object)?.id).toBe("wikidata:Q432253");
  });

  it("leaves out an object that is not in the public domain", () => {
    expect(toMetArtwork(makeObject({ isPublicDomain: false }))).toBeNull();
  });

  it("leaves out an object without a picture", () => {
    expect(toMetArtwork(makeObject({ primaryImageSmall: "" }))).toBeNull();
  });
});

describe("matchMetObject", () => {
  it("matches by the organism's Wikidata item", () => {
    expect(matchMetObject(makeObject(), "Q7391", [])).toBe("id");
  });

  it("matches by a tag without a Wikidata item that is the plural of a name", () => {
    const object = makeObject({ tags: [{ term: "Bees", Wikidata_URL: "" }] });
    expect(matchMetObject(object, "Q30034", [bee])).toEqual(bee);
  });

  it("does not match by name a tag whose Wikidata item is another's", () => {
    expect(matchMetObject(makeObject(), "Q30034", [bee])).toBeNull();
  });

  it("matches by the item of a taxon above the organism", () => {
    expect(matchMetObject(makeObject(), "Q30034", [], ["Q7391"])).toBe("ancestor");
  });

  it("prefers the organism's own item over an ancestor's", () => {
    expect(matchMetObject(makeObject(), "Q7391", [], ["Q7391"])).toBe("id");
  });

  it("prefers the match by Wikidata item", () => {
    expect(matchMetObject(makeObject(), "Q7391", [bee])).toBe("id");
  });

  it("does not match an unrelated tag", () => {
    expect(matchMetObject(makeObject(), "Q30034", [{ name: "horse", kind: "common" }])).toBeNull();
  });

  it("does not match an object without tags", () => {
    expect(matchMetObject(makeObject({ tags: null }), "Q7391", [bee])).toBeNull();
  });
});
