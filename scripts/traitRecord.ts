import type { NodeName } from "../src/shared/graph.ts";

/** One organism's row in a trait database. */
export type TraitRecord<Traits> = {
  /** The scientific name the database lists, for example "Struthio camelus" or "Tricholoma". */
  name: string;
  /** A coarse group, such as "bird" or a fungal phylum, across which likeness is also sought. */
  group: string;
  traits: Traits;
  names: NodeName[];
  /** Higher taxa that help GBIF tell the name apart from homonyms, as GBIF match parameters. */
  gbifHints: Record<string, string>;
};
