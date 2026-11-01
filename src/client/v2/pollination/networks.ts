import catimbau from "./networks/catimbau.json";
import flores from "./networks/flores.json";
import ileAuxAigrettes from "./networks/ile-aux-aigrettes.json";
import piedmont from "./networks/piedmont.json";
import type { NetworkChoice } from "./PollinationNetwork";

/** The networks the view can draw, in the order they are offered; the first is shown at the start. */
export const networks = [
  {
    ...ileAuxAigrettes,
    id: "ile-aux-aigrettes",
    name: "Île aux Aigrettes, Mauritius",
    description:
      "Flower visitors on a small coral islet off Mauritius, counted over the 1999 flowering season. The introduced honey bee visits most of the plants, and the endemic day gecko Phelsuma ornata pollinates alongside the insects.",
  },
  {
    ...flores,
    id: "flores",
    name: "Flores, Azores",
    description:
      "Flower visitors on the coast of Flores in the Azores, counted in the summer of 2000, from the same study of invaded island networks.",
  },
  {
    ...catimbau,
    id: "catimbau",
    name: "Catimbau, Brazil",
    description:
      "Oil-collecting Centris bees and the Malpighiaceae flowers they take floral oil from, in a dry caatinga park in Pernambuco, counted over a year from 2006. Visits run into the thousands.",
  },
  {
    ...piedmont,
    id: "piedmont",
    name: "Piedmont forest, North Carolina",
    description:
      "Spring wildflowers of a deciduous forest and their insect visitors, counted through the springs of 1977 to 1979 before the trees leaf out.",
  },
] satisfies NetworkChoice[];

export const defaultNetwork = networks[0] as NetworkChoice;
