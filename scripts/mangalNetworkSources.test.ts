import { describe, expect, it } from "vitest";
import {
  readSourceCollection,
  toNetworkLicence,
  toNetworkSource,
  toStudyCitation,
  toStudyUrl,
  toWebOfLifeSource,
} from "./mangalNetworkSources.ts";
import type { MangalNetwork, MangalReference } from "./mangalRecords.ts";

const network = {
  id: 2462,
  name: "yamazaki_kato_2003",
  date: "2001-04-01",
  geometry: null,
  description: "Plant-pollinator community at Mt. Yufu, Western Japan",
  datasetId: 175,
} satisfies MangalNetwork;

const reference = {
  id: 172,
  doi: "2433/156407",
  firstAuthor: "yamazaki",
  year: "2003",
  bibtex:
    "@article{yamazaki2003flowering, title={Flowering phenology at {Mt. Yufu}, Western Japan}, author={YAMAZAKI, Kyoko and KATO, Makoto}, year={2003}}",
  paperUrl: "https://repository.kulib.kyoto-u.ac.jp/dspace/handle/2433/156407",
  dataUrl: "http://www.web-of-life.es/map.php",
} satisfies MangalReference;

describe("readSourceCollection", () => {
  it("recognises a network copied from Web of Life", () => {
    expect(readSourceCollection(reference)).toBe("web-of-life");
  });

  it("recognises a network copied from the Interaction Web Database", () => {
    const dataUrl = "https://www.nceas.ucsb.edu/interactionweb/html/motten_1982.html";
    expect(readSourceCollection({ ...reference, dataUrl })).toBe("iwdb");
  });

  it("returns null for an author's own deposit", () => {
    expect(readSourceCollection({ ...reference, dataUrl: "https://datadryad.org/x" })).toBeNull();
  });
});

describe("toNetworkLicence", () => {
  it("keeps Web of Life's terms for its networks", () => {
    expect(toNetworkLicence(reference)).toBe("LicenseRef-web-of-life-attribution");
  });

  it("defaults to CC0", () => {
    expect(toNetworkLicence({ ...reference, dataUrl: null })).toBe("CC0-1.0");
  });
});

describe("toStudyCitation", () => {
  it("cites the authors, year and title of the BibTeX entry", () => {
    expect(toStudyCitation(reference)).toBe(
      "YAMAZAKI, Kyoko and KATO, Makoto (2003). Flowering phenology at Mt. Yufu, Western Japan.",
    );
  });

  it("falls back to the first author and year", () => {
    expect(toStudyCitation({ ...reference, bibtex: null })).toBe("yamazaki (2003).");
  });
});

describe("toStudyUrl", () => {
  it("links a DOI through its resolver", () => {
    expect(toStudyUrl({ ...reference, doi: "10.1890/14-0024.1" })).toBe(
      "https://doi.org/10.1890/14-0024.1",
    );
  });

  it("links the paper when the DOI field holds something else", () => {
    expect(toStudyUrl(reference)).toBe(reference.paperUrl);
  });
});

describe("toNetworkSource", () => {
  it("identifies the network as the dataset", () => {
    expect(toNetworkSource(network, null, reference).datasetId).toBe("mangal:2462");
  });

  it("cites the network with its dataset and address", () => {
    const dataset = { id: 175, name: "yamazaki_kato_2003", referenceId: 172 };
    expect(toNetworkSource(network, dataset, reference).datasetCitation).toBe(
      "Mangal network yamazaki_kato_2003 in dataset yamazaki_kato_2003: Plant-pollinator community at Mt. Yufu, Western Japan. https://mangal.io/api/v2/network/2462",
    );
  });
});

describe("toWebOfLifeSource", () => {
  it("identifies the Web of Life network as the dataset", () => {
    expect(toWebOfLifeSource("M_PL_056", reference).datasetId).toBe("web-of-life:M_PL_056");
  });

  it("names Web of Life and its address in the citation", () => {
    expect(toWebOfLifeSource("M_PL_056", reference).datasetCitation).toBe(
      "Web of Life network M_PL_056. Web of Life: ecological networks database. https://www.web-of-life.es",
    );
  });

  it("cites the collection alone when the network is unknown", () => {
    expect(toWebOfLifeSource(null, reference).datasetId).toBe("web-of-life");
  });

  it("credits the study that reported the network", () => {
    expect(toWebOfLifeSource("M_PL_056", reference).studyCitation).toBe(
      "YAMAZAKI, Kyoko and KATO, Makoto (2003). Flowering phenology at Mt. Yufu, Western Japan.",
    );
  });
});
