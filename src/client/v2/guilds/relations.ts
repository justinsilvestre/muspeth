export type RelationId =
  | "visitors"
  | "flowers"
  | "compounds"
  | "names"
  | "stories"
  | "sites"
  | "descent"
  | "species";

/** A phrase in a singular and a plural form, for agreement with a count. */
type Forms = { one: string; many: string };

/** What a relation's membranes mean, and the plain words the view uses to say so. */
export type Relation = {
  id: RelationId;
  /** How the menu names the relation, after "grouped by": "the visitors they share". */
  menuLabel: string;
  /** What is shared, as a count noun: "visitor", "molecule". */
  shared: Forms;
  /** What a membrane wraps, after "Each membrane wraps the {dots}": "that the same visitor was seen on". */
  membrane: string;
  /** How far the relation reaches, after a count of dots: "has a recorded visitor" and "have a recorded visitor". */
  reach: Forms;
  /** How a dot stands to what it shares, after its name and before a count: "visited by". */
  dotVerb: string;
  /** How the things a guild shares stand to its members, after their names: "was seen on exactly these". */
  guildVerb: Forms;
  /** Whether the shared things are organisms with scientific names, to be abbreviated like dots. */
  sharedAreSpecies: boolean;
  /** The words of the minimum-weight control, for relations whose source counted the encounters. */
  weight?: { label: string; one: string; many: string };
  /** What such a grouping is, and how it bends the glottometric reading. */
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
    menuLabel: "the visitors they share",
    shared: { one: "visitor", many: "visitors" },
    membrane: "that the same visitor was seen on",
    reach: { one: "has a recorded visitor", many: "have a recorded visitor" },
    dotVerb: "visited by",
    guildVerb: { one: "was seen on exactly these", many: "were seen on exactly these" },
    sharedAreSpecies: true,
    weight: visits,
    explanation:
      "Plants bound together by the visitors they share are a guild. Where a glottometric membrane is drawn around languages by an innovation they underwent together, this one is drawn around plants by another organism that moves between them. A visitor that cuts across a guild is not evidence against it, as a cross-cutting innovation is against a subgroup, but a generalist that belongs to several guilds at once.",
    citesSet: true,
    citations: [],
  },
  flowers: {
    id: "flowers",
    menuLabel: "the flowers they share",
    shared: { one: "flower", many: "flowers" },
    membrane: "seen on the same flower",
    reach: { one: "was seen on a flower", many: "were seen on a flower" },
    dotVerb: "seen on",
    guildVerb: { one: "was visited by exactly these", many: "were visited by exactly these" },
    sharedAreSpecies: true,
    weight: visits,
    explanation:
      "This is the same survey turned inside out: the plants that were membranes are now what holds guilds of visitors together. A flower that cuts across a guild is one that draws visitors from several guilds at once.",
    citesSet: true,
    citations: [],
  },
  compounds: {
    id: "compounds",
    menuLabel: "the molecules they contain",
    shared: { one: "molecule", many: "molecules" },
    membrane: "that contain the same molecule",
    reach: { one: "has a listed molecule", many: "have a listed molecule" },
    dotVerb: "contains",
    guildVerb: { one: "is found in exactly these", many: "are found in exactly these" },
    sharedAreSpecies: false,
    explanation:
      "The molecules are those Wikidata lists as found in each organism. The diagram cannot tell whether two organisms share a molecule by descent, by arriving at the same chemistry separately, or because one of them ate the other. It shows only who is made of the same stuff.",
    citations: [
      {
        text: "Wikidata, statements of the property “found in taxon” (P703), CC0.",
        url: "https://www.wikidata.org/wiki/Property:P703",
      },
    ],
  },
  names: {
    id: "names",
    menuLabel: "the words people call them by",
    shared: { one: "word", many: "words" },
    membrane: "whose names share a word, in some language",
    reach: { one: "has a recorded name", many: "have a recorded name" },
    dotVerb: "named with",
    guildVerb: { one: "names exactly these", many: "name exactly these" },
    sharedAreSpecies: false,
    explanation:
      "These membranes are drawn by human speech: a word such as pine or 松 holds together whatever people have called by it, whether or not botany agrees. The names come from the GBIF backbone and the World Loanword Database.",
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
    menuLabel: "the folktales they appear in",
    shared: { one: "folktale motif", many: "folktale motifs" },
    membrane: "that appear in the same folktale motif",
    reach: { one: "appears in a motif", many: "appear in a motif" },
    dotVerb: "appears in",
    guildVerb: { one: "tells of exactly these", many: "tell of exactly these" },
    sharedAreSpecies: false,
    explanation:
      "The motifs are from Thompson's index of folk literature. A motif told of a whole group, such as birds or bees, reaches every member of that group here, so these membranes follow the categories of storytellers rather than of taxonomists.",
    citations: [
      {
        text: "Thompson, Stith. Motif-Index of Folk-Literature, as CSV.",
        url: "https://doi.org/10.17605/OSF.IO/XEB67",
      },
    ],
  },
  sites: {
    id: "sites",
    menuLabel: "the places they were seen",
    shared: { one: "survey site", many: "survey sites" },
    membrane: "seen at the same flower survey site",
    reach: { one: "was seen at a site", many: "were seen at a site" },
    dotVerb: "seen at",
    guildVerb: {
      one: "is where exactly these were seen",
      many: "are where exactly these were seen",
    },
    sharedAreSpecies: false,
    explanation:
      "These membranes are drawn by being in the same place at the same time, the one relation here that needs neither likeness nor lineage.",
    citations: [mangalSites],
  },
  descent: {
    id: "descent",
    menuLabel: "their family tree",
    shared: { one: "branch of the tree", many: "branches of the tree" },
    membrane: "of one genus, family, order, class, phylum or kingdom",
    reach: { one: "is placed in the tree", many: "are placed in the tree" },
    dotVerb: "placed in",
    guildVerb: { one: "contains exactly these", many: "contain exactly these" },
    sharedAreSpecies: false,
    explanation:
      "The tree is the GBIF backbone taxonomy. Descent draws only nested membranes, never overlapping ones: this is the tree that every other grouping here can be read against.",
    citations: [gbifBackbone],
  },
  species: {
    id: "species",
    menuLabel: "the species they share",
    shared: { one: "species", many: "species" },
    membrane: "where the same species was seen",
    reach: { one: "has a species recorded", many: "have a species recorded" },
    dotVerb: "where the surveys saw",
    guildVerb: { one: "was seen at exactly these", many: "were seen at exactly these" },
    sharedAreSpecies: true,
    explanation:
      "The honey bee reaches every site and most species reach only one, so these membranes are drawn by the organisms that travel, or that people carried with them.",
    citations: [mangalSites],
  },
} satisfies Record<RelationId, Relation>;

/** The relation a sharing stands for. */
export function relationOf(id: RelationId): Relation {
  return relations[id];
}
