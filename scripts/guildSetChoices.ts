/** The sets of bodies that the guilds view offers, as the export script reads them from the database. */

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

/** Sets of organisms chosen by hand from across the database, by their labels. */
export const organismSets = [
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
