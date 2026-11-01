export type RelationId =
  | "visitors"
  | "flowers"
  | "compounds"
  | "names"
  | "stories"
  | "sites"
  | "descent"
  | "species";

/** What a relation's membranes mean, and the words the view uses to say so. */
export type Relation = {
  id: RelationId;
  name: string;
  partner: { one: string; many: string };
  /** How a body stands to one of its partners, after the body's name: "visited by". */
  bodyVerb: string;
  /** How a guild's partners stand to its members, after their count: "seen on exactly these". */
  guildVerb: string;
  /** Whether partners are organisms with scientific names, to be abbreviated like bodies. */
  partnersAreSpecies: boolean;
  /** The words of the minimum-weight control, for relations whose source counted the encounters. */
  weight?: { label: string; one: string; many: string };
  /** What a membrane means here, and how that bends the glottometric reading. */
  explanation: string;
  /** Whether the set's own study is the source, as for a flower survey. */
  citesSet?: boolean;
  citations: { text: string; url: string }[];
};

const visits = { label: "Visits at least", one: "time", many: "times" };

const gbifBackbone = {
  text: "GBIF Secretariat. GBIF Backbone Taxonomy.",
  url: "https://doi.org/10.15468/39omei",
};

const mangalSites = {
  text: "Mangal, the ecological interactions database: the sites of the surveys in the first version's database.",
  url: "https://mangal.io",
};

export const relations = {
  visitors: {
    id: "visitors",
    name: "Shared visitors",
    partner: { one: "visitor", many: "visitors" },
    bodyVerb: "visited by",
    guildVerb: "seen on exactly these",
    partnersAreSpecies: true,
    weight: visits,
    explanation:
      "A visitor was seen on each of the plants it encloses. Where a glottometric membrane is drawn around languages by an innovation they underwent together, this one is drawn around plants by another organism that moves between them. A visitor that cuts across a guild is not evidence against it, as a cross-cutting innovation is against a subgroup, but a generalist that belongs to several guilds at once.",
    citesSet: true,
    citations: [],
  },
  flowers: {
    id: "flowers",
    name: "Shared flowers",
    partner: { one: "flower", many: "flowers" },
    bodyVerb: "seen on",
    guildVerb: "visited by exactly these",
    partnersAreSpecies: true,
    weight: visits,
    explanation:
      "A flower was visited by each of the visitors it encloses: the same survey turned inside out, so that the plants that were membranes become the partners holding guilds of insects together. A flower that cuts across a guild is one that draws visitors from several guilds at once.",
    citesSet: true,
    citations: [],
  },
  compounds: {
    id: "compounds",
    name: "Shared compounds",
    partner: { one: "compound", many: "compounds" },
    bodyVerb: "contains",
    guildVerb: "found in exactly these",
    partnersAreSpecies: false,
    explanation:
      "A compound is found in each of the organisms it encloses, according to Wikidata. The diagram cannot tell whether they share it by descent, by arriving at the same chemistry separately, or because one of them ate the other. It shows only who is made of the same molecules.",
    citations: [
      {
        text: "Wikidata, statements of the property “found in taxon” (P703), CC0.",
        url: "https://www.wikidata.org/wiki/Property:P703",
      },
    ],
  },
  names: {
    id: "names",
    name: "Shared names",
    partner: { one: "name", many: "names" },
    bodyVerb: "named by",
    guildVerb: "naming exactly these",
    partnersAreSpecies: false,
    explanation:
      "A word occurs in the vernacular names of each of the organisms it encloses, in some language. These membranes are drawn by human speech: a word such as pine or 松 holds together whatever people have called by it, whether or not botany agrees.",
    citations: [
      { ...gbifBackbone, text: "GBIF Secretariat. GBIF Backbone Taxonomy, vernacular names." },
      {
        text: "Haspelmath, Martin & Uri Tadmor (eds.). 2009. World Loanword Database.",
        url: "https://wold.clld.org",
      },
    ],
  },
  stories: {
    id: "stories",
    name: "Shared stories",
    partner: { one: "motif", many: "motifs" },
    bodyVerb: "appears in",
    guildVerb: "telling of exactly these",
    partnersAreSpecies: false,
    explanation:
      "A folklore motif from Thompson's index names each of the organisms it encloses. A motif told of a whole group, such as birds or bees, reaches every member of that group in the set, so these membranes follow the categories of storytellers rather than of taxonomists.",
    citations: [
      {
        text: "Thompson, Stith. Motif-Index of Folk-Literature, as CSV.",
        url: "https://doi.org/10.17605/OSF.IO/XEB67",
      },
    ],
  },
  sites: {
    id: "sites",
    name: "Shared sites",
    partner: { one: "site", many: "sites" },
    bodyVerb: "observed at",
    guildVerb: "where exactly these were observed",
    partnersAreSpecies: false,
    explanation:
      "Each of the organisms a membrane encloses was observed at the same flower survey site. These membranes are drawn by being in the same place at the same time, the one relation here that needs neither likeness nor lineage.",
    citations: [mangalSites],
  },
  descent: {
    id: "descent",
    name: "Descent",
    partner: { one: "taxon", many: "taxa" },
    bodyVerb: "placed in",
    guildVerb: "containing exactly these",
    partnersAreSpecies: false,
    explanation:
      "A taxon of the GBIF backbone, from genus to kingdom, contains each of the organisms it encloses. Descent draws only nested membranes, never overlapping ones: this is the tree that the other relations can be read against.",
    citations: [gbifBackbone],
  },
  species: {
    id: "species",
    name: "Shared species",
    partner: { one: "species", many: "species" },
    bodyVerb: "where the surveys observed",
    guildVerb: "observed at exactly these",
    partnersAreSpecies: true,
    explanation:
      "A species was observed at each of the sites it encloses. The honey bee reaches every site and most species reach only one, so these membranes are drawn by the organisms that travel, or that people carried with them.",
    citations: [mangalSites],
  },
} satisfies Record<RelationId, Relation>;

/** The relation a sharing stands for. */
export function relationOf(id: RelationId): Relation {
  return relations[id];
}
