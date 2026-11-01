import boniInnovationsCsv from "./boni/innovations.csv?raw";
import demoCoordinatesCsv from "./demo/coordinates.csv?raw";
import demoInnovationsCsv from "./demo/innovations.csv?raw";
import germanicInnovationsCsv from "./germanic/innovations.csv?raw";
import type { LanguageFamily } from "./LanguageFamily";

export { type LanguageFamily, labelOf } from "./LanguageFamily";

import { parseCoordinatesCsv } from "./parseCoordinatesCsv";
import { parseInnovationsCsv } from "./parseInnovationsCsv";

/** The families the view can draw, in the order they are offered; the first is shown at the start. */
export const families = [
  {
    id: "germanic",
    name: "Early Germanic languages",
    description:
      "Six early Germanic languages with the 167 shared innovations of Agee's 2018 thesis, transcribed from its Table 1. A label's [*] marks an innovation that may be a parallel development and [?] one whose classification is complicated. The thesis weighs such cases one by one, so its own scores differ somewhat from those computed here.",
    citation: {
      text: "Agee, Joshua. 2018. A Glottometric Subgrouping of the Early Germanic Languages. MA thesis, San José State University, Table 1.",
      url: "https://scholarworks.sjsu.edu/etd_theses/4926/",
    },
    table: parseInnovationsCsv(germanicInnovationsCsv),
    abbreviations: {
      Gothic: "GO",
      "Old Norse": "ON",
      "Old English": "OE",
      "Old Frisian": "OFr",
      "Old Saxon": "OS",
      "Old High German": "OHG",
    },
  },
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
    abbreviations: Object.fromEntries(
      parseInnovationsCsv(demoInnovationsCsv).languages.map((name) => [
        name,
        name.replace("Ⓛ", ""),
      ]),
    ),
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

/** The engine's sample family, whose languages carry abbreviations; handy in tests. */
export const demoFamily = families.find((family) => family.id === "demo") as LanguageFamily;
