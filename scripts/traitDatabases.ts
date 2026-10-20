import { compareEltonTraits, type EltonTraits, parseEltonTraits } from "./eltonTraits.ts";
import { compareFungalTraits, type FungalTraits, parseFungalTraits } from "./fungalTraits.ts";
import type { GbifTaxon } from "./gbifTaxon.ts";
import type { LikenessTemplate } from "./likenessConnections.ts";
import { listGenusNames, listSpeciesNames, type TraitNameCandidate } from "./traitNameMatches.ts";
import type { TraitRecord } from "./traitRecord.ts";

/** A trait database that likeness links are computed from, and how to read and compare it. */
export type TraitDatabase<Traits> = {
  /** The key that the database's connections and added nodes are stored under. */
  source: string;
  /** The tables to download, each with its text encoding and how to read it. */
  tables: { url: string; encoding: string; parse: (text: string) => TraitRecord<Traits>[] }[];
  compare: (first: Traits, second: Traits) => number;
  /** Whether the database describes organisms of this kind at all. */
  covers: (taxon: GbifTaxon) => boolean;
  listNames: (label: string, taxon: GbifTaxon, synonymNames?: string[]) => TraitNameCandidate[];
  /** Whether to look for an organism under GBIF's synonyms of its name when nothing else matches. */
  readsSynonyms: boolean;
  template: LikenessTemplate;
};

/**
 * EltonTraits 1.0 (Wilman et al. 2014), the diets and body masses of the world's birds and mammals,
 * as deposited on figshare under CC0.
 */
export const eltonTraits = {
  source: "eltontraits",
  tables: [
    {
      url: "https://ndownloader.figshare.com/files/5631081",
      encoding: "windows-1252",
      parse: (text) => parseEltonTraits(text, "bird"),
    },
    {
      url: "https://ndownloader.figshare.com/files/5631084",
      encoding: "windows-1252",
      parse: (text) => parseEltonTraits(text, "mammal"),
    },
  ],
  compare: compareEltonTraits,
  covers: (taxon) => taxon.class === "Aves" || taxon.class === "Mammalia",
  listNames: listSpeciesNames,
  readsSynonyms: true,
  template: {
    relation: "similar diet and body mass",
    taxonomicLevel: "species",
    licence: "CC0-1.0",
    sources: [
      {
        datasetId: "figshare:3559887",
        datasetCitation:
          "EltonTraits 1.0. figshare. https://doi.org/10.6084/m9.figshare.3559887.v1",
        studyCitation:
          "Wilman, H., Belmaker, J., Simpson, J., de la Rosa, C., Rivadeneira, M. M., & Jetz, W. (2014). EltonTraits 1.0: Species-level foraging attributes of the world's birds and mammals. Ecology, 95(7), 2027.",
        studyUrl: "https://doi.org/10.1890/13-1917.1",
        recordCount: null,
      },
    ],
  },
} satisfies TraitDatabase<EltonTraits>;

/**
 * FungalTraits (Põlme et al. 2020), the lifestyles of fungal genera, as copied by GloBI.
 * No licence is stated; the authors describe the data as available for public use.
 */
export const fungalTraits = {
  source: "fungaltraits",
  tables: [
    {
      url: "https://raw.githubusercontent.com/globalbioticinteractions/fungaltraits/main/polme2020-s1-fungal-traits-genera.tsv",
      encoding: "utf-8",
      parse: parseFungalTraits,
    },
  ],
  compare: compareFungalTraits,
  covers: (taxon) => taxon.kingdom === "Fungi" || taxon.kingdom === "Chromista",
  listNames: listGenusNames,
  readsSynonyms: false,
  template: {
    relation: "similar fungal lifestyle",
    taxonomicLevel: "genus",
    licence: "NOASSERTION",
    sources: [
      {
        datasetId: "globalbioticinteractions/fungaltraits",
        datasetCitation:
          "FungalTraits genus table, as copied at https://github.com/globalbioticinteractions/fungaltraits",
        studyCitation:
          "Põlme, S., Abarenkov, K., Nilsson, R. H., et al. (2020). FungalTraits: a user-friendly traits database of fungi and fungus-like stramenopiles. Fungal Diversity, 105, 1–16.",
        studyUrl: "https://doi.org/10.1007/s13225-020-00466-2",
        recordCount: null,
      },
    ],
  },
} satisfies TraitDatabase<FungalTraits>;
