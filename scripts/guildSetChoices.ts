/** The sets of bodies that the guilds view offers, as the export script reads them from the database. */
import type { ExtraRelation } from "./guildSetQueries.ts";

/** Flower surveys, each giving a set of plants and a set of visitors. */
export const surveys = [
  {
    id: "ile-aux-aigrettes",
    datasetId: "mangal:934",
    name: "Île aux Aigrettes, Mauritius",
    description:
      "Flower visitors on a small coral islet off Mauritius, counted over the 1999 flowering season. The introduced honey bee visits most of the plants, and the endemic day gecko Phelsuma ornata pollinates alongside the insects.",
  },
  {
    id: "flores",
    datasetId: "mangal:935",
    name: "Flores, Azores",
    description:
      "Flower visitors on the coast of Flores in the Azores, counted in the summer of 2000, from the same study of invaded island networks.",
  },
  {
    id: "catimbau",
    datasetId: "mangal:929",
    name: "Catimbau, Brazil",
    description:
      "Oil-collecting Centris bees and the Malpighiaceae flowers they take floral oil from, in a dry caatinga park in Pernambuco, counted over a year from 2006. Visits run into the thousands.",
  },
  {
    id: "piedmont",
    datasetId: "mangal:945",
    name: "Piedmont forest, North Carolina",
    description:
      "Spring wildflowers of a deciduous forest and their insect visitors, counted through the springs of 1977 to 1979 before the trees leaf out.",
  },
];

/**
 * The four networks of the rotting-log survey, each one kind of log at one stage of decay, with
 * the years the logs had lain dead: the weight that orders the stages in the view.
 */
export const rottingLogStages: Record<string, { name: string; stepName: string; years: number }> = {
  "mangal:1494": { name: "oak logs a year dead", stepName: "a year dead", years: 1 },
  "mangal:1495": {
    name: "oak logs three years dead or more",
    stepName: "three years dead or more",
    years: 3,
  },
  "mangal:1496": { name: "pine logs a year dead", stepName: "a year dead", years: 1 },
  "mangal:1497": {
    name: "pine logs three years dead or more",
    stepName: "three years dead or more",
    years: 3,
  },
};

/** A set of organisms chosen by hand, by their labels, with the relations read for it beyond those every organism has. */
type OrganismSet = {
  id: string;
  name: string;
  /** The heading the set is listed under in the menu; sets from across the database need none. */
  group?: string;
  description: string;
  bodyNoun: { one: string; many: string };
  organisms: string[];
  /** The study the set is taken from, cited under the relations that read its links. */
  citation?: { text: string; url: string };
  /** The networks whose links the food-web relations are read from, so that other studies' links stay out. */
  datasetIds?: string[];
  relations?: ExtraRelation[];
};

const rottingLogs = {
  group: "From food webs",
  citation: {
    text: "Savely, H. E. (1939). Ecological relations of certain animals in dead pine and oak logs. Ecological Monographs, 9(3), 321–385; Mangal networks 1494 to 1497.",
    url: "https://doi.org/10.2307/1943233",
  },
  datasetIds: Object.keys(rottingLogStages),
};

const jena = {
  group: "From food webs",
  citation: {
    text: "Hines, J., Giling, D. P., Rzanny, M., Voigt, W., Meyer, S. T., Weisser, W. W., Eisenhauer, N., & Ebeling, A. (2019). A meta-food web for invertebrate species collected in a European grassland. Ecology, 100(4), e02679; Mangal network 5013.",
    url: "https://doi.org/10.1002/ecy.2679",
  },
  datasetIds: ["mangal:5013"],
};

const fungalTraits = {
  group: "From other studies",
  citation: {
    text: "Põlme, S., Abarenkov, K., Nilsson, R. H., et al. (2020). FungalTraits: a user-friendly traits database of fungi and fungus-like stramenopiles. Fungal Diversity, 105, 1–16.",
    url: "https://doi.org/10.1007/s13225-020-00466-2",
  },
};

/** Sets of organisms chosen by hand from across the database, by their labels. */
export const organismSets: OrganismSet[] = [
  {
    id: "rotting-log",
    name: "Life on a rotting log",
    ...rottingLogs,
    description:
      "Animals that Savely found inside dead oak and pine logs in Duke Forest, North Carolina, in the 1930s, cut open a year after the trees died and again after three years or more: springtails and ants that persist through every stage, bark beetles and their predators in the fresh pine, and the millipedes, snails and termites of the softened wood.",
    bodyNoun: { one: "animal", many: "animals" },
    organisms: [
      "Isotoma sensibilis",
      "Entomobrya ligata",
      "Leptothorax curvispinosus",
      "Ponera coarctata",
      "Camponotus herculeanus",
      "Geophilus varians",
      "Linotaenia bidens",
      "Platysoma leconti",
      "Tachyta nana",
      "Alaus myops",
      "Alaus oculatus",
      "Orthotomicus coelatus",
      "Megalodacne fasciata",
      "Odontotaenius disjunctus",
      "Cambala annulata",
      "Zonitoides arboreus",
      "Philomycus carolinensis",
      "Reticulitermes flavipes",
      "Monochamus titillator",
      "Dendroctonus valens",
      "Ips grandicollis",
      "Thanasimus dubius",
      "Temnochila virescens",
      "Xyleborus fitchi",
    ],
    relations: ["stages", "food", "prey", "predators"],
  },
  {
    id: "jena-grassland",
    name: "A grassland food web, Jena",
    ...jena,
    description:
      "Spiders, ground beetles, bugs, rove beetles, woodlice and clovers from the meta-food web of the Jena Experiment's grassland plots in Germany: who eats whom among the thousand invertebrate species collected there, read for two dozen of the most connected.",
    bodyNoun: { one: "organism", many: "organisms" },
    organisms: [
      "Argiope bruennichi",
      "Mangora acalypha",
      "Araniella cucurbitina",
      "Xysticus cristatus",
      "Tibellus oblongus",
      "Pisaura mirabilis",
      "Pterostichus minor",
      "Harpalus rubripes",
      "Ophonus azureus",
      "Diachromus germanus",
      "Chlamydatus pullus",
      "Drymus sylvaticus",
      "Megalonotus emarginatus",
      "Peritrechus geniculatus",
      "Rhyparochromus pini",
      "Phyllotreta undulata",
      "Acalypta carinata",
      "Mycetoporus nigricollis",
      "Sepedophilus marshami",
      "Drusilla canaliculata",
      "Porcellio scaber",
      "Armadillidium vulgare",
      "Trifolium pratense",
      "Trifolium repens",
      "Lotus corniculatus",
      "Medicago lupulina",
      "Vicia cracca",
      "fungi",
    ],
    relations: ["prey", "predators", "food", "eaters"],
  },
  {
    id: "fungi-on-hosts",
    name: "Fungi and what they live on",
    ...fungalTraits,
    description:
      "Two dozen fungal genera with named hosts in FungalTraits: parasites of insects, of other fungi and of people, the cultivated fungus of termite mounds, smuts and ergots of grasses, and moulds that live on other moulds. Tzeanania lives in Ophiocordyceps, which lives in insects.",
    bodyNoun: { one: "fungus", many: "fungi" },
    organisms: [
      "Tzeanania",
      "Ophiocordyceps",
      "Cordyceps",
      "Tolypocladium",
      "Metarhizium",
      "Entomophthora",
      "Laboulbenia",
      "Septobasidium",
      "Escovopsis",
      "Termitomyces",
      "Termitosphaera",
      "Podostroma",
      "Chalciporus",
      "Sphaerostilbella",
      "Sporophagomyces",
      "Tyrannicordyceps",
      "Ustilago",
      "Tilletia",
      "Eudarluca",
      "Piptocephalis",
      "Syncephalis",
      "Dispira",
      "Arthrobotrys",
      "Harposporium",
      "Candida",
      "Aspergillus",
      "Trichophyton",
      "Pneumocystis",
    ],
    relations: ["hosts"],
  },
  {
    id: "hosts-of-fungi",
    name: "Hosts and the fungi on them",
    ...fungalTraits,
    description:
      "The other side of the same table: hosts, from whole kingdoms to single genera, drawn as dots, and grouped by the fungal genera that live on more than one of them, such as the moulds that eat both nematodes and rotifers, or both mosses and liverworts.",
    bodyNoun: { one: "host", many: "hosts" },
    organisms: [
      "Animalia",
      "Arthropoda",
      "Homo sapiens",
      "Nematoda",
      "Rotifera",
      "Rodentia",
      "Chiroptera",
      "Termitidae",
      "Formicidae",
      "Coccoidea",
      "Ophiocordyceps",
      "Mucorales",
      "Ascomycota",
      "Chaetomium",
      "Amanita",
      "Claviceps",
      "Bryophyta",
      "Marchantiophyta",
      "Poaceae",
      "Cyperaceae",
      "Juncaceae",
      "Arecaceae",
      "Pinus",
      "Pinaceae",
      "Bacillariophyceae",
      "Phaeophyceae",
    ],
    relations: ["fungi"],
  },
  {
    id: "grasses-genes",
    name: "Grasses and their borrowed genes",
    group: "From other studies",
    citation: {
      text: "Hibdige, S. G. S., Raimondeau, P., Christin, P.-A., & Dunning, L. T. (2021). Widespread lateral gene transfer among grasses. New Phytologist, 230(6), 2474–2486.",
      url: "https://doi.org/10.1111/nph.17328",
    },
    description:
      "The thirteen grass genomes in which Hibdige and colleagues found genes passed sideways from another lineage of grasses, with six of those lineages and a few close relatives the same genes turned up in. Wheat, maize, sorghum, millets and the C4 grass Alloteropsis are among them.",
    bodyNoun: { one: "grass", many: "grasses" },
    organisms: [
      "Brachypodium distachyon",
      "Triticum aestivum",
      "Leersia perrieri",
      "Eragrostis tef",
      "Sorghum bicolor",
      "Zea mays",
      "Cenchrus americanus",
      "Alloteropsis semialata",
      "Dichanthelium oligosanthes",
      "Echinochloa crus-galli",
      "Panicum hallii",
      "Panicum virgatum",
      "Setaria italica",
      "Andropogoneae",
      "Paniceae",
      "Cenchrinae",
      "Panicinae",
      "Chloridoideae",
      "Pooideae",
      "Cenchrus sieberianus",
      "Themeda triandra",
      "Aegilops tauschii",
      "Triticum urartu",
      "Panicum capillare",
      "Alloteropsis angusta",
    ],
    relations: ["genes"],
  },
  {
    id: "pines-and-company",
    name: "Pines and their company",
    description:
      "The red pine and matsutake of the sample with the honey bee, other conifers, and the herbs that share the most compounds with the red pine: resin terpenes bind a fennel to a larch.",
    bodyNoun: { one: "organism", many: "organisms" },
    organisms: [
      "Pinus densiflora",
      "Tricholoma matsutake",
      "Apis mellifera",
      "Pinus sylvestris",
      "Pinus massoniana",
      "Pinus strobus",
      "Larix kaempferi",
      "Cedrus libani",
      "Picea abies",
      "Cryptomeria japonica",
      "Cistus monspeliensis",
      "Foeniculum vulgare",
      "Cinnamomum verum",
      "Daucus carota",
      "Achillea millefolium",
      "Crithmum maritimum",
    ],
  },
  {
    id: "kitchen-plants",
    name: "Kitchen plants",
    description:
      "Sixteen crops, herbs and weeds of the kitchen garden, those with the most compounds listed in Wikidata, from tea and apple to dandelion.",
    bodyNoun: { one: "plant", many: "plants" },
    organisms: [
      "Camellia sinensis",
      "Borago officinalis",
      "Malus domestica",
      "Cucurbita pepo",
      "Foeniculum vulgare",
      "Coriandrum sativum",
      "Cinnamomum verum",
      "Rubus idaeus",
      "Cichorium intybus",
      "Triticum aestivum",
      "Medicago sativa",
      "Fagopyrum esculentum",
      "Brassica juncea",
      "Helianthus annuus",
      "Taraxacum officinale",
      "Daucus carota",
    ],
  },
];

export const placeSetId = "survey-sites";

/** Labels for the survey sites in the scene, short enough to sit beside a dot. */
export const siteLabels: Record<string, string> = {
  "site:33.400,131.500": "Yufu",
  "site:35.583,138.383": "Kushigata",
  "site:28.128,-17.249": "Garajonay",
  "site:-8.505,-37.201": "Catimbau",
  "site:-20.420,57.733": "Île aux Aigrettes",
  "site:-20.426,57.451": "Black River Gorges",
  "site:28.217,-16.633": "Tenerife",
  "site:81.817,-71.300": "Lake Hazen",
  "site:-4.667,55.433": "Mahé",
  "site:-43.028,171.785": "Cass",
  "site:-43.099,171.720": "Craigieburn",
  "site:39.445,-31.194": "Flores",
  "site:17.917,-76.192": "Morant Point",
  "site:36.075,-79.002": "Piedmont",
};

/** Short names for the survey sites, by their place node identifier. */
export const siteNames: Record<string, string> = {
  "site:33.400,131.500": "Mt. Yufu, Japan",
  "site:35.583,138.383": "Mt. Kushigata, Japan",
  "site:28.128,-17.249": "Garajonay, La Gomera",
  "site:-8.505,-37.201": "Catimbau, Brazil",
  "site:-20.420,57.733": "Île aux Aigrettes, Mauritius",
  "site:-20.426,57.451": "Black River Gorges, Mauritius",
  "site:28.217,-16.633": "Tenerife",
  "site:81.817,-71.300": "Lake Hazen, Ellesmere Island",
  "site:-4.667,55.433": "Mahé, Seychelles",
  "site:-43.028,171.785": "Cass, New Zealand",
  "site:-43.099,171.720": "Craigieburn, New Zealand",
  "site:39.445,-31.194": "Flores, Azores",
  "site:17.917,-76.192": "Morant Point, Jamaica",
  "site:36.075,-79.002": "Piedmont, North Carolina",
};
