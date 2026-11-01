import { describe, expect, it } from "vitest";
import { parseFungalHosts } from "./fungalHosts.ts";

const columns = [
  "Phylum",
  "Class",
  "GENUS",
  "primary_lifestyle",
  "Secondary_lifestyle",
  "Animal_biotrophic_capacity_template",
  "Specific_hosts",
];

function makeTable(...rows: string[][]) {
  return [columns, ...rows].map((row) => row.join("\t")).join("\n");
}

const tzeanania = [
  "Ascomycota",
  "Sordariomycetes",
  "Tzeanania",
  "mycoparasite",
  "",
  "arthropod_parasite",
  "Ophiocordyceps",
];
const termitomyces = [
  "Basidiomycota",
  "Agaricomycetes",
  "Termitomyces",
  "litter_saprotroph",
  "",
  "termite_symbiont",
  "",
];
const chalciporus = [
  "Basidiomycota",
  "Agaricomycetes",
  "Chalciporus",
  "mycoparasite",
  "",
  "",
  "Amanita",
];
const lichen = ["Ascomycota", "Lecanoromycetes", "Usnea", "lichenized", "", "", "algae"];

describe("parseFungalHosts", () => {
  it("reads the named host of a genus with the relation its lifestyle implies", () => {
    const [record] = parseFungalHosts(makeTable(chalciporus));
    expect(record?.hosts).toEqual([
      expect.objectContaining({ name: "Amanita", rank: "genus", relation: "parasiteOf" }),
    ]);
  });

  it("reads the animals a genus lives with beside its named hosts", () => {
    const [record] = parseFungalHosts(makeTable(tzeanania));
    expect(record?.hosts.map(({ name, relation }) => [name, relation])).toEqual([
      ["Ophiocordyceps", "parasiteOf"],
      ["Arthropoda", "parasiteOf"],
    ]);
  });

  it("reads a symbiont as living on its partner", () => {
    const [record] = parseFungalHosts(makeTable(termitomyces));
    expect(record?.hosts).toEqual([
      expect.objectContaining({ name: "Termitidae", relation: "symbiontOf" }),
    ]);
  });

  it("leaves out a genus whose only host is a group no taxon covers", () => {
    expect(parseFungalHosts(makeTable(lichen))).toEqual([]);
  });

  it("reads a genus listed twice once", () => {
    expect(parseFungalHosts(makeTable(chalciporus, chalciporus))).toHaveLength(1);
  });

  it("keeps the phylum and class as hints for matching the genus", () => {
    const [record] = parseFungalHosts(makeTable(chalciporus));
    expect(record?.gbifHints).toEqual({
      phylum: "Basidiomycota",
      class: "Agaricomycetes",
      rank: "GENUS",
    });
  });
});
