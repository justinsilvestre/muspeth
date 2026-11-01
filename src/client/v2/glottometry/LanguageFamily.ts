import type { LanguageCoordinates } from "./parseCoordinatesCsv";
import type { InnovationTable } from "./parseInnovationsCsv";

/** A language family with its table of shared innovations, ready to be drawn. */
export type LanguageFamily = {
  id: string;
  name: string;
  /** One or two sentences on what the languages are and where the innovations come from. */
  description: string;
  citation: { text: string; url: string };
  table: InnovationTable;
  /** Where each language is spoken; families without coordinates are laid out by likeness instead. */
  coordinates?: LanguageCoordinates[];
};
