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
  /** What a membrane wraps, after "Each membrane wraps the {dots}": "that one and the same visitor comes to". */
  membrane: string;
  /** How far the relation reaches, after a count of dots: "has a recorded visitor" and "have a recorded visitor". */
  reach: Forms;
  /** What a dot does with what it shares, before a count of them: "draws", as in "draws 8 visitors". */
  dotVerb: string;
  /** What the things a membrane shares do to its members, between their names and "these plants": "visits" and "visit". */
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
    membrane: "that one and the same visitor comes to",
    reach: { one: "has a recorded visitor", many: "have a recorded visitor" },
    dotVerb: "draws",
    guildVerb: { one: "visits", many: "visit" },
    sharedAreSpecies: true,
    weight: visits,
    explanation:
      "Plants that share visitors form a group of their own. Where a glottometric membrane is drawn around languages by an innovation they underwent together, this one is drawn around plants by another organism that moves between them. A visitor that cuts across a group is not evidence against it, as a cross-cutting innovation is against a subgroup, but a generalist that belongs to several groups at once.",
    citesSet: true,
    citations: [],
  },
  flowers: {
    id: "flowers",
    menuLabel: "the flowers they share",
    shared: { one: "flower", many: "flowers" },
    membrane: "that visit the same flower",
    reach: { one: "visits a flower", many: "visit a flower" },
    dotVerb: "visits",
    guildVerb: { one: "attracts", many: "attract" },
    sharedAreSpecies: true,
    weight: visits,
    explanation:
      "Visitors that share flowers form groups of their own: the insects, birds or geckos that work the same blossoms. A flower that cuts across a group is one that draws visitors from several groups at once.",
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
    guildVerb: { one: "occurs in", many: "occur in" },
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
    dotVerb: "goes by",
    guildVerb: { one: "names", many: "name" },
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
    guildVerb: { one: "tells of", many: "tell of" },
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
    membrane: "that live at the same flower survey site",
    reach: { one: "lives at a survey site", many: "live at a survey site" },
    dotVerb: "lives at",
    guildVerb: { one: "hosts", many: "host" },
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
    reach: { one: "sits on the tree", many: "sit on the tree" },
    dotVerb: "sits on",
    guildVerb: { one: "holds", many: "hold" },
    sharedAreSpecies: false,
    explanation:
      "The tree is the GBIF backbone taxonomy. Descent draws only nested membranes, never overlapping ones: this is the tree that every other grouping here can be read against.",
    citations: [gbifBackbone],
  },
  species: {
    id: "species",
    menuLabel: "the species they share",
    shared: { one: "species", many: "species" },
    membrane: "that host the same species",
    reach: { one: "hosts a species", many: "host a species" },
    dotVerb: "hosts",
    guildVerb: { one: "turns up at", many: "turn up at" },
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
