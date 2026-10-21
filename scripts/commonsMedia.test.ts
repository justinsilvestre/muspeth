import { describe, expect, it } from "vitest";
import {
  type CommonsFile,
  toCommonsFileTitle,
  toCommonsMedia,
  toLicenceId,
  toPlainText,
} from "./commonsMedia.ts";

function makeFile(metadata: Record<string, string>) {
  return {
    title: "File:Tarweaar.jpg",
    imageinfo: [
      {
        thumburl: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tarweaar.jpg?utm_source=x",
        url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tarweaar.jpg?utm_source=y",
        descriptionurl: "https://commons.wikimedia.org/wiki/File:Tarweaar.jpg",
        extmetadata: Object.fromEntries(
          Object.entries(metadata).map(([field, value]) => [field, { value }]),
        ),
      },
    ],
  } satisfies CommonsFile;
}

const freeFile = makeFile({
  License: "cc-by-sa-3.0",
  LicenseShortName: "CC BY-SA 3.0",
  Artist: '<a href="https://commons.wikimedia.org/wiki/User:Rasbak">Rasbak</a>',
});

describe("toCommonsFileTitle", () => {
  it("reads the file title from a Wikidata image link", () => {
    expect(
      toCommonsFileTitle(
        "http://commons.wikimedia.org/wiki/Special:FilePath/100%20views%20edo%20010.jpg",
      ),
    ).toBe("File:100 views edo 010.jpg");
  });
});

describe("toCommonsMedia", () => {
  it("links the smaller copy of the image without tracking parameters", () => {
    expect(toCommonsMedia(freeFile)?.url).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Tarweaar.jpg",
    );
  });

  it("records the file's licence", () => {
    expect(toCommonsMedia(freeFile)?.licence).toBe("CC-BY-SA-3.0");
  });

  it("credits the file's author in plain text", () => {
    expect(toCommonsMedia(freeFile)?.credit).toBe("Rasbak");
  });

  it("links the file's description page", () => {
    expect(toCommonsMedia(freeFile)?.pageUrl).toBe(
      "https://commons.wikimedia.org/wiki/File:Tarweaar.jpg",
    );
  });

  it("credits the file's source when no author is given", () => {
    const file = makeFile({
      License: "pd",
      LicenseShortName: "Public domain",
      Credit: "<i>Flora</i>",
    });
    expect(toCommonsMedia(file)?.credit).toBe("Flora");
  });

  it("leaves out a file without a known licence", () => {
    expect(toCommonsMedia(makeFile({ Artist: "Someone" }))).toBeNull();
  });

  it("leaves out a file that Commons marks as not free", () => {
    const file = makeFile({ License: "cc-by-4.0", NonFree: "true" });
    expect(toCommonsMedia(file)).toBeNull();
  });

  it("leaves out a missing file", () => {
    expect(toCommonsMedia({ title: "File:Gone.jpg" })).toBeNull();
  });
});

describe("toLicenceId", () => {
  it("names CC0 by its SPDX identifier", () => {
    expect(toLicenceId("cc0", "CC0")).toBe("CC0-1.0");
  });

  it("names a Creative Commons licence by its SPDX identifier", () => {
    expect(toLicenceId("cc-by-4.0", "CC BY 4.0")).toBe("CC-BY-4.0");
  });

  it("keeps Commons' short name for a licence adapted to one country", () => {
    expect(toLicenceId("cc-by-sa-3.0-de", "CC BY-SA 3.0 de")).toBe("CC BY-SA 3.0 de");
  });

  it("keeps Commons' short name for the public domain", () => {
    expect(toLicenceId("pd", "Public domain")).toBe("Public domain");
  });
});

describe("toPlainText", () => {
  it("removes tags, decodes entities and collapses spaces", () => {
    expect(toPlainText('<bdi><a href="x">Utagawa\n Hiroshige</a></bdi> &amp; co')).toBe(
      "Utagawa Hiroshige & co",
    );
  });
});
