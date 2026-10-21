import { describe, expect, it } from "vitest";
import {
  type ClevelandRecord,
  matchClevelandTitle,
  toClevelandArtwork,
} from "./clevelandRecords.ts";

function makeRecord(changes: Partial<ClevelandRecord> = {}) {
  return {
    id: 141186,
    accession_number: "1964.43",
    title: "Old Pine Tree",
    url: "https://clevelandart.org/art/1964.43",
    share_license_status: "CC0",
    creation_date: "late 1530s",
    creation_date_earliest: 1535,
    creation_date_latest: 1539,
    images: { web: { url: "https://openaccess-cdn.clevelandart.org/1964.43/1964.43_web.jpg" } },
    creators: [{ description: "Wen Zhengming (Chinese, 1470–1559)" }],
    ...changes,
  } satisfies ClevelandRecord;
}

describe("toClevelandArtwork", () => {
  it("links to the picture under CC0", () => {
    expect(toClevelandArtwork(makeRecord())).toMatchObject({
      imageUrl: "https://openaccess-cdn.clevelandart.org/1964.43/1964.43_web.jpg",
      imageLicence: "CC0-1.0",
    });
  });

  it("identifies the artwork by the museum's number", () => {
    expect(toClevelandArtwork(makeRecord())?.id).toBe("cleveland:141186");
  });

  it("dates the artwork by the years it was made", () => {
    expect(toClevelandArtwork(makeRecord())?.date).toBe("1535/1539");
  });

  it("cites the artist and the date", () => {
    expect(toClevelandArtwork(makeRecord())?.citation).toBe(
      "Old Pine Tree, Wen Zhengming (Chinese, 1470–1559), late 1530s. The Cleveland Museum of Art, 1964.43.",
    );
  });

  it("leaves out a record that is not CC0", () => {
    expect(toClevelandArtwork(makeRecord({ share_license_status: "Copyrighted" }))).toBeNull();
  });

  it("leaves out a record without a picture", () => {
    expect(toClevelandArtwork(makeRecord({ images: null }))).toBeNull();
  });
});

describe("matchClevelandTitle", () => {
  it("finds the name that the title mentions", () => {
    const names = [{ name: "pine", kind: "common" }] as const;
    expect(matchClevelandTitle(makeRecord(), [...names])).toEqual(names[0]);
  });

  it("finds nothing when the title mentions no name", () => {
    expect(matchClevelandTitle(makeRecord(), [{ name: "crane", kind: "common" }])).toBeNull();
  });
});
