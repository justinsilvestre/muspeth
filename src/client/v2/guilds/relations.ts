export type RelationId =
  | "visitors"
  | "flowers"
  | "compounds"
  | "names"
  | "stories"
  | "sites"
  | "descent"
  | "species"
  | "stages"
  | "prey"
  | "predators"
  | "food"
  | "eaters"
  | "hosts"
  | "fungi"
  | "genes";

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
  stages: {
    id: "stages",
    menuLabel: "the logs they were found in",
    shared: { one: "kind of log", many: "kinds of log" },
    membrane: "found in the same kind of log at the same stage of decay",
    reach: { one: "was found in a log", many: "were found in a log" },
    dotVerb: "found in",
    guildVerb: { one: "held exactly these", many: "held exactly these" },
    sharedAreSpecies: false,
    weight: { label: "Logs dead at least", one: "year", many: "years" },
    explanation:
      "Savely cut into oak and pine logs a year after the trees died and again after three years or more, and listed what lived in each. A membrane is one kind of log at one stage of decay, so where the membranes nest and overlap they show which animals persist as the wood softens and which come and go. The glottometric reading bends least here: a stage of decay is something the log underwent, and the animals inside share it as languages share an innovation. The slider admits the logs by how long they had lain dead, so Replay starts from the oldest logs and adds the fresher ones.",
    citesSet: true,
    citations: [],
  },
  prey: {
    id: "prey",
    menuLabel: "the prey they share",
    shared: { one: "prey", many: "prey" },
    membrane: "that hunt the same prey",
    reach: { one: "has a recorded prey", many: "have a recorded prey" },
    dotVerb: "hunts",
    guildVerb: { one: "is hunted by exactly these", many: "are hunted by exactly these" },
    sharedAreSpecies: true,
    explanation:
      "A membrane is drawn by a prey animal around everything recorded eating it, so these guilds are guilds in the ecologist's sense: predators that hunt the same things. A prey that cuts across two guilds feeds both, and argues against neither.",
    citesSet: true,
    citations: [],
  },
  predators: {
    id: "predators",
    menuLabel: "the predators they share",
    shared: { one: "predator", many: "predators" },
    membrane: "hunted by the same predator",
    reach: { one: "has a recorded predator", many: "have a recorded predator" },
    dotVerb: "hunted by",
    guildVerb: { one: "hunts exactly these", many: "hunt exactly these" },
    sharedAreSpecies: true,
    explanation:
      "The food web turned round: a membrane is a predator drawn around everything it eats. Where an innovation marks what languages did together, a predator marks what befalls its prey together.",
    citesSet: true,
    citations: [],
  },
  food: {
    id: "food",
    menuLabel: "the food they share",
    shared: { one: "food", many: "foods" },
    membrane:
      "that eat the same food, other than live prey: a fungus, a plant, wood, litter or dung",
    reach: { one: "has a recorded food", many: "have a recorded food" },
    dotVerb: "eats",
    guildVerb: { one: "feeds exactly these", many: "feed exactly these" },
    sharedAreSpecies: false,
    explanation:
      "The membranes are drawn by what is eaten other than live prey: the fungi, wood, plants, litter and dung that the survey recorded as food. A fungus holding several animals together is the nearest thing here to a shared innovation, the same resource taken up separately by each of them.",
    citesSet: true,
    citations: [],
  },
  eaters: {
    id: "eaters",
    menuLabel: "the eaters they share",
    shared: { one: "eater", many: "eaters" },
    membrane: "eaten by the same animal, other than as live prey",
    reach: { one: "is eaten by a recorded animal", many: "are eaten by a recorded animal" },
    dotVerb: "eaten by",
    guildVerb: { one: "eats exactly these", many: "eat exactly these" },
    sharedAreSpecies: true,
    explanation:
      "The plants, fungi and litter of the web grouped by who eats them, with the animals that omnivores take: a membrane is a herbivore, detritivore or omnivore drawn around its foods.",
    citesSet: true,
    citations: [],
  },
  hosts: {
    id: "hosts",
    menuLabel: "the hosts they live on",
    shared: { one: "host", many: "hosts" },
    membrane: "that live on or in the same host",
    reach: { one: "has a named host", many: "have a named host" },
    dotVerb: "lives on",
    guildVerb: { one: "is home to exactly these", many: "are home to exactly these" },
    sharedAreSpecies: true,
    explanation:
      "FungalTraits names, for each fungal genus, what it lives on or in: a plant, an insect, another fungus, or a whole kingdom of animals where the source says no more. A membrane is a host drawn around its fungi. A chain of organisms living inside one another, as Tzeanania lives in Ophiocordyceps and Ophiocordyceps in insects, is a fungus that is a dot here and a membrane in the set of hosts.",
    citesSet: true,
    citations: [],
  },
  fungi: {
    id: "fungi",
    menuLabel: "the fungi that live on them",
    shared: { one: "fungus", many: "fungi" },
    membrane: "that the same fungal genus lives on",
    reach: { one: "hosts a named fungus", many: "host a named fungus" },
    dotVerb: "home to",
    guildVerb: { one: "lives on exactly these", many: "live on exactly these" },
    sharedAreSpecies: true,
    explanation:
      "The hosts turned round: a membrane is a fungal genus drawn around everything it is recorded living on. Most genera have one named host, so the membranes are drawn by the few that bridge two, such as the moulds that trap both nematodes and rotifers.",
    citesSet: true,
    citations: [],
  },
  genes: {
    id: "genes",
    menuLabel: "the genes they share by transfer",
    shared: { one: "transferred gene", many: "transferred genes" },
    membrane: "that hold the same gene passed sideways between grasses",
    reach: { one: "carries or gave a transferred gene", many: "carry or gave a transferred gene" },
    dotVerb: "tied by transfer to",
    guildVerb: { one: "passed between exactly these", many: "passed between exactly these" },
    sharedAreSpecies: false,
    explanation:
      "Hibdige and colleagues found genes in grass genomes whose nearest relatives sit in another lineage of grasses, carried across by a route still unknown rather than inherited. A membrane is one such gene, drawn around the grasses it was found in and the lineage it came from. This is the one grouping here that is itself a kind of descent: a membrane is a piece of inheritance that cuts across the family tree, which is what a cross-cutting innovation is suspected of being in a language family.",
    citesSet: true,
    citations: [
      {
        text: "Supporting information of the bioRxiv preprint, version 3 (2020), CC BY-NC-ND 4.0.",
        url: "https://doi.org/10.1101/2020.02.17.952150",
      },
    ],
  },
} satisfies Record<RelationId, Relation>;

/** The relation a sharing stands for. */
export function relationOf(id: RelationId): Relation {
  return relations[id];
}
