import { describe, expect, it } from "vitest";
import type { CommonsFile } from "./commonsMedia.ts";
import { toOrganismPhotoLinks } from "./organismPhotos.ts";

const pine = { id: "wikidata:Q1", qid: "Q1" };
const titles = new Map([["Q1", "File:Pine.jpg"]]);

function makeFile(licence: string) {
  return {
    title: "File:Pine.jpg",
    imageinfo: [
      {
        url: "https://upload.wikimedia.org/Pine.jpg",
        descriptionurl: "https://commons.wikimedia.org/wiki/File:Pine.jpg",
        extmetadata: { License: { value: licence } },
      },
    ],
  } satisfies CommonsFile;
}

describe("toOrganismPhotoLinks", () => {
  it("links an organism to its item's image under the image's licence", () => {
    const files = new Map([["File:Pine.jpg", makeFile("cc0")]]);
    expect(toOrganismPhotoLinks([pine], titles, files)[0]).toMatchObject({
      nodeId: "wikidata:Q1",
      media: { url: "https://upload.wikimedia.org/Pine.jpg", licence: "CC0-1.0" },
    });
  });

  it("leaves out an organism whose image has no known licence", () => {
    const files = new Map([["File:Pine.jpg", makeFile("")]]);
    expect(toOrganismPhotoLinks([pine], titles, files)).toEqual([]);
  });

  it("leaves out an organism whose item names no image", () => {
    expect(toOrganismPhotoLinks([pine], new Map(), new Map())).toEqual([]);
  });
});
