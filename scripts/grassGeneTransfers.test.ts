import { describe, expect, it } from "vitest";
import { parseGeneTransfers, readRecipient } from "./grassGeneTransfers.ts";

const header = [
  "Treefile",
  "Species",
  "LGT",
  "Region",
  "Start",
  "Stop",
  "Transcript",
  "Donor",
  "Top-hit",
  "Evalue",
  "Protein",
];
const tree = "Triticum_aestivum_TRIAE_1";
const rows = [
  header,
  [
    tree,
    "Triticum aestivum",
    "TRIAE_1.1",
    "",
    "",
    "",
    "Primary",
    "Paniceae",
    "XIP1",
    "0",
    "Xylanase inhibitor protein 1",
  ],
  [
    tree,
    "Triticum aestivum",
    "TRIAE_2.1",
    "",
    "",
    "",
    "Primary",
    "Paniceae",
    "XIP1",
    "0",
    "Xylanase inhibitor protein 1",
  ],
  [tree, "Non-target (Aegilops tauschii )", "EMT28711", "", "", "", "", "Paniceae", "-", "-", "-"],
  [
    "Zea_mays_1",
    "Zea mays",
    "Zm1_T001",
    "",
    "",
    "",
    "Primary",
    "Chlorodoideae",
    "-",
    "0",
    "Protein ALWAYS EARLY 3",
  ],
  [
    "Eragrostis_1",
    "Eragrostis tef",
    "gene-2.26-mRNA-2",
    "",
    "",
    "",
    "Primary",
    "NA",
    "",
    "",
    "Piks-2",
  ],
  [
    "Eragrostis_1",
    "Eragrostis tef",
    "gene-2.26-mRNA-1",
    "",
    "",
    "",
    "Primary",
    "Paniceae",
    "",
    "",
    "RGA4",
  ],
];

describe("parseGeneTransfers", () => {
  it("groups the copies of a gene under its gene tree, with the grasses it was found in", () => {
    const [transfer] = parseGeneTransfers(rows);
    expect(transfer).toEqual({
      id: tree,
      geneId: "TRIAE_1.1",
      protein: "Xylanase inhibitor protein 1",
      donor: { name: "Paniceae", rank: "tribe" },
      recipients: [
        { name: "Triticum aestivum", rank: "species", qualityFlags: [] },
        { name: "Aegilops tauschii", rank: "species", qualityFlags: [] },
      ],
    });
  });

  it("corrects the study's spelling of a lineage", () => {
    expect(parseGeneTransfers(rows)[1]?.donor).toEqual({
      name: "Chloridoideae",
      rank: "subfamily",
    });
  });

  it("takes the donor from the first copy that names one", () => {
    expect(parseGeneTransfers(rows)[2]?.donor?.name).toBe("Paniceae");
  });

  it("reads a sheet whose second Treefile column is the filled one", () => {
    const twoColumns = [
      ["Treefile", "Treefile", "Species", "Gene", "Donor", "Protein"],
      ["", "Cenchrus_1", "Cenchrus americanus", "Pgl_1", "Panicinae", "Prephenate dehydratase"],
      ["", "Cenchrus_1", "Non-target (Cenchrus sieberianus)", "ShortRead", "Panicinae", "-"],
    ];
    expect(parseGeneTransfers(twoColumns)[0]?.recipients.map(({ name }) => name)).toEqual([
      "Cenchrus americanus",
      "Cenchrus sieberianus",
    ]);
  });
});

describe("readRecipient", () => {
  it("drops the accession after a species name", () => {
    expect(readRecipient("Non-target (Alloteropsis angusta AAN4-8)").name).toBe(
      "Alloteropsis angusta",
    );
  });

  it("reads a name typed with a non-breaking hyphen as the plain name", () => {
    expect(readRecipient("Echinochloa crus‑galli").name).toBe("Echinochloa crus-galli");
  });

  it("reads an unnamed species as its genus", () => {
    expect(readRecipient("Non-target (Heteropogon sp.)")).toEqual({
      name: "Heteropogon",
      rank: "genus",
      qualityFlags: [],
    });
  });

  it("corrects a misspelt name and flags it", () => {
    expect(readRecipient("Panicum vigratum")).toEqual({
      name: "Panicum virgatum",
      rank: "species",
      qualityFlags: ["fuzzy_name_match"],
    });
  });
});
