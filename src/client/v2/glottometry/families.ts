import boniInnovationsCsv from "./boni/innovations.csv?raw";
import demoCoordinatesCsv from "./demo/coordinates.csv?raw";
import demoInnovationsCsv from "./demo/innovations.csv?raw";
import type { LanguageFamily } from "./LanguageFamily";

export type { LanguageFamily } from "./LanguageFamily";

import { parseCoordinatesCsv } from "./parseCoordinatesCsv";
import { parseInnovationsCsv } from "./parseInnovationsCsv";

/** The families the view can draw, in the order they are offered. */
export const families = [
  {
    id: "demo",
    name: "Demo family",
    description:
      "The sample family distributed with the Historical Glottometry engine: eighteen languages named A to R, with 474 innovations and made-up coordinates.",
    citation: {
      text: "Kalyan, Siva & Alexandre François. Historical Glottometry online analyzer, sample data.",
      url: "https://marama.huma-num.fr/AF_Glottometry.htm",
    },
    table: parseInnovationsCsv(demoInnovationsCsv),
    coordinates: parseCoordinatesCsv(demoCoordinatesCsv),
  },
  {
    id: "boni",
    name: "Boni dialects",
    description:
      "Six dialects of Boni (Aweer), a Cushitic language of the Kenyan coast, with the 25 shared innovations that Elias drew from Heine and Möhlig's 1982 dialect atlas. Innovations #1 to #9 set Kilii apart from the rest; the others cut across one another.",
    citation: {
      text: "Elias, Alexander. 2019. Visualizing the Boni dialects with Historical Glottometry. Journal of Historical Linguistics 9(1), 70–91, Table 22.",
      url: "https://doi.org/10.1075/jhl.18009.eli",
    },
    table: parseInnovationsCsv(boniInnovationsCsv),
  },
] satisfies LanguageFamily[];

export const defaultFamily = families[0] as LanguageFamily;
