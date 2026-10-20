import { describe, expect, it } from "vitest";
import { splitCitationLinks } from "./splitCitationLinks";

describe("splitCitationLinks", () => {
  it("keeps a citation without links as one piece of text", () => {
    expect(splitCitationLinks("Tsing 2015.")).toEqual([{ text: "Tsing 2015." }]);
  });

  it("links a URL to itself", () => {
    expect(splitCitationLinks("See https://example.org/a")).toEqual([
      { text: "See " },
      { text: "https://example.org/a", href: "https://example.org/a" },
    ]);
  });

  it("leaves punctuation that ends a sentence outside the link", () => {
    expect(splitCitationLinks("https://example.org/a.")).toEqual([
      { text: "https://example.org/a", href: "https://example.org/a" },
      { text: "." },
    ]);
  });

  it("links a DOI written with a doi: prefix to its resolver", () => {
    expect(splitCitationLinks("doi:10.1128/spectrum.01950-21")).toEqual([
      { text: "doi:10.1128/spectrum.01950-21", href: "https://doi.org/10.1128/spectrum.01950-21" },
    ]);
  });
});
