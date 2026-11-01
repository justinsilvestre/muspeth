import type { QualityFlag } from "../src/shared/qualityFlags.ts";

/** A taxon that covers an informal group of hosts, with the English name the group is kept under. */
type Group = { name: string; rank: string; kingdom: string; englishName: string | null };

/** A host as FungalTraits names it, read as a taxon the graph can hold. */
export type HostReading = {
  /** The scientific name of the host taxon, for example "Pinus" or "Bryophyta". */
  name: string;
  rank: string;
  /** The informal name the source used, such as "mosses", kept as an English name of the node. */
  englishName: string | null;
  /** Higher taxa that help GBIF tell the name apart from homonyms, as GBIF match parameters. */
  gbifHints: Record<string, string>;
  qualityFlags: QualityFlag[];
};

const animalia = "Animalia";
const plantae = "Plantae";
const chromista = "Chromista";

/**
 * The informal group names that FungalTraits uses for hosts, each read as the one taxon that
 * covers the group. Groups that no single taxon covers, such as "algae" or "herbivores", are
 * left out, so a fungus listed only on such a group gets no host.
 */
const informalGroups: Record<string, Group> = {
  "Ambrosia beetles (Coleoptera: Curculionidae)": group(
    "Curculionidae",
    "family",
    animalia,
    "ambrosia beetles",
  ),
  angiosperms: group("Magnoliopsida", "class", plantae, "angiosperms"),
  ants: group("Formicidae", "family", animalia, "ants"),
  bamboo: group("Bambusoideae", "subfamily", plantae, "bamboo"),
  bats: group("Chiroptera", "order", animalia, "bats"),
  "bird gut": group("Aves", "class", animalia, "birds"),
  "brown algae": group("Phaeophyceae", "class", chromista, "brown algae"),
  bryophytes: group("Bryophyta", "phylum", plantae, "bryophytes"),
  carnivores: group("Carnivora", "order", animalia, "carnivores"),
  ciliates: group("Ciliophora", "phylum", chromista, "ciliates"),
  corals: group("Anthozoa", "class", animalia, "corals"),
  crustaceans: group("Crustacea", "subphylum", animalia, "crustaceans"),
  diatoms: group("Bacillariophyceae", "class", chromista, "diatoms"),
  dinoflagellates: group("Dinophyceae", "class", chromista, "dinoflagellates"),
  "Drospophila gut": group("Drosophila", "genus", animalia, null),
  ferns: group("Polypodiopsida", "class", plantae, "ferns"),
  grasshoppers: group("Acrididae", "family", animalia, "grasshoppers"),
  isopods: group("Isopoda", "order", animalia, "isopods"),
  liverworts: group("Marchantiophyta", "phylum", plantae, "liverworts"),
  "liverwort perianths": group("Marchantiophyta", "phylum", plantae, "liverworts"),
  locusts: group("Acrididae", "family", animalia, "locusts"),
  mammals: group("Mammalia", "class", animalia, "mammals"),
  mites: group("Acari", "subclass", animalia, "mites"),
  monocots: group("Liliopsida", "class", plantae, "monocots"),
  "mosquito larvae": group("Culicidae", "family", animalia, "mosquitoes"),
  mosses: group("Bryophyta", "phylum", plantae, "mosses"),
  "moss perianths": group("Bryophyta", "phylum", plantae, "mosses"),
  nematodes: group("Nematoda", "phylum", animalia, "nematodes"),
  oomycetes: group("Oomycota", "phylum", chromista, "oomycetes"),
  "red algae": group("Rhodophyta", "phylum", plantae, "red algae"),
  rotents: group("Rodentia", "order", animalia, "rodents"),
  rotifers: group("Rotifera", "phylum", animalia, "rotifers"),
  rusts: group("Pucciniales", "order", "Fungi", "rusts"),
  "scale insects": group("Coccoidea", "superfamily", animalia, "scale insects"),
  "scale insect larvae": group("Coccoidea", "superfamily", animalia, "scale insects"),
  "sea stars": group("Asteroidea", "class", animalia, "sea stars"),
  "slime molds": group("Mycetozoa", "phylum", "Protozoa", "slime molds"),
  snakes: group("Serpentes", "suborder", animalia, "snakes"),
  spiders: group("Araneae", "order", animalia, "spiders"),
  tardigrades: group("Tardigrada", "phylum", animalia, "tardigrades"),
  termites: group("Termitidae", "family", animalia, "termites"),
  "termites nests": group("Termitidae", "family", animalia, "termites"),
};

/**
 * The animal associations that FungalTraits records in its column of animal biotrophic capacity,
 * each read as a host where the value names a group of animals.
 */
const animalCapacities: Record<string, Group> = {
  animal_parasite: group("Animalia", "kingdom", animalia, "animals"),
  arthropod_parasite: group("Arthropoda", "phylum", animalia, "arthropods"),
  arthropod_ectosymbiont: group("Arthropoda", "phylum", animalia, "arthropods"),
  nematophagous: group("Nematoda", "phylum", animalia, "nematodes"),
  opportunistic_human_parasite: group("Homo sapiens", "species", animalia, null),
  termite_symbiont: group("Termitidae", "family", animalia, "termites"),
  vertebrate_parasite: group("Vertebrata", "subphylum", animalia, "vertebrates"),
};

/**
 * Words after a taxon name that say which part of the host the fungus lives on, as in
 * "Pinaceae needles" or "Simuliidae larvae". The part is dropped and the taxon kept.
 */
const partWords = new Set([
  "algae",
  "and",
  "cocoons",
  "cones",
  "culms",
  "eggs",
  "flowers",
  "friots",
  "fruits",
  "galls",
  "gut",
  "larvae",
  "leaves",
  "needles",
  "nests",
  "nymphs",
  "of",
  "ovaries",
  "perianths",
  "sclerotia",
  "seeds",
  "sori",
  "spikelets",
  "spikes",
  "stems",
  "witchesbrooms",
]);

const rankBySuffix: [RegExp, string][] = [
  [/aceae$|idae$/, "family"],
  [/oideae$|inae$/, "subfamily"],
  [/ales$/, "order"],
  [/mycota$|phyta$|poda$/, "phylum"],
  [/mycetes$|phyceae$/, "class"],
];

/**
 * Reads one host as FungalTraits writes it in `Specific_hosts`, with underscores for spaces:
 * a scientific name, possibly followed by the part of the host, or an informal group name.
 * Returns null for a group that no single taxon covers.
 */
export function readHostName(value: string): HostReading | null {
  const words = value.trim().replaceAll("_", " ").split(/\s+/).filter(Boolean);
  const informal = informalGroups[words.join(" ")];
  if (informal) return toInformalReading(informal);
  const [first = "", ...rest] = words;
  if (!/^[A-Z][a-z-]+$/.test(first)) return null;
  const partIndex = rest.findIndex((word) => partWords.has(word.toLowerCase()));
  const nameWords = [first, ...(partIndex === -1 ? rest : rest.slice(0, partIndex))];
  const isBinomial = nameWords.length === 2 && /^[a-z-]+$/.test(nameWords[1] ?? "");
  if (nameWords.length > 1 && !isBinomial) return null;
  const name = nameWords.join(" ");
  return {
    name,
    rank: isBinomial ? "species" : guessRank(name),
    englishName: null,
    gbifHints: {},
    qualityFlags: [],
  };
}

/** Reads a value of the animal biotrophic capacity column, which may join several with "/". */
export function readAnimalCapacity(value: string) {
  return value
    .split("/")
    .map((capacity) => capacity.trim())
    .flatMap((capacity) => {
      const found = animalCapacities[capacity];
      return found ? [{ capacity, host: toInformalReading(found) }] : [];
    });
}

function group(name: string, rank: string, kingdom: string, englishName: string | null) {
  return { name, rank, kingdom, englishName } satisfies Group;
}

function toInformalReading({ name, rank, kingdom, englishName }: Group) {
  return {
    name,
    rank,
    englishName,
    gbifHints: { kingdom, rank: rank.toUpperCase() },
    qualityFlags: ["informal_group_name"],
  } satisfies HostReading;
}

function guessRank(name: string) {
  return rankBySuffix.find(([pattern]) => pattern.test(name))?.[1] ?? "genus";
}
