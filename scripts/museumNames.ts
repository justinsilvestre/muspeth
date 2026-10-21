/** A taxon above an organism, up to its family, with the English names it goes by. */
export type Ancestor = { qid: string; names: string[] };

/** An organism of the graph, with the names that museum records may use for it. */
export type MuseumOrganism = {
  id: string;
  /** The scientific name. */
  label: string;
  englishNames: string[];
  /** The taxa above the organism from subgenus to family, when its Wikidata item is known. */
  ancestors: Ancestor[];
};

/** How a name relates to its organism: the scientific name, or a name used in everyday English. */
export type NameKind = "scientific" | "common";

export type SearchName = { name: string; kind: NameKind };

/** Names shorter than this are too likely to match unrelated words. */
const minNameLength = 4;

/** Lists the names to look for in museum records, without repeats and without very short names. */
export function listSearchNames({ label, englishNames }: MuseumOrganism) {
  const names = [
    { name: label, kind: "scientific" },
    ...englishNames.map((name) => ({ name, kind: "common" as const })),
  ] satisfies SearchName[];
  const unique = new Map(names.map((entry) => [normalizeName(entry.name), entry]));
  return [...unique.values()].filter(({ name }) => name.length >= minNameLength);
}

export function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Gives the English plural of a name in the usual way, as museum subject tags are plural. */
export function pluralize(name: string) {
  if (/(s|x|z|ch|sh)$/i.test(name)) return `${name}es`;
  if (/[^aeiou]y$/i.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
}

/** Tells whether a text contains the name as whole words, allowing for a plural ending. */
export function mentionsName(text: string, name: string) {
  const escaped = normalizeName(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}])${escaped}(e?s)?($|[^\\p{L}])`, "iu").test(text);
}
