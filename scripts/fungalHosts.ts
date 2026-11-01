import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import { type HostReading, readAnimalCapacity, readHostName } from "./fungalHostNames.ts";
import { readGbifHints } from "./fungalTraits.ts";
import { parseTsv } from "./parseTsv.ts";

/** A fungal genus with the hosts FungalTraits names for it. */
export type FungalHostRecord = {
  genus: string;
  gbifHints: Record<string, string>;
  hosts: FungalHost[];
};

/** One host of a genus, with how the genus lives on it, as a relation name of the OBO Relation Ontology. */
export type FungalHost = HostReading & { relation: string };

/** The relation that the lifestyle words of FungalTraits imply, where they imply one. */
const relationByLifestyleWord: [RegExp, string][] = [
  [/pathogen/, "pathogenOf"],
  [/parasite|nematophagous/, "parasiteOf"],
  [/symbiont/, "symbiontOf"],
];

/**
 * Reads the hosts of each genus from the FungalTraits genus table: the named hosts of the
 * `Specific_hosts` column, and the groups of animals that the animal biotrophic capacity column
 * names. Genera without a host are left out, and a genus listed twice is read once.
 */
export function parseFungalHosts(text: string) {
  const records = new Map<string, FungalHostRecord>();
  for (const row of parseTsv(text)) {
    const genus = row.GENUS?.trim();
    if (!genus || records.has(genus)) continue;
    const hosts = listHosts(row);
    if (hosts.length > 0) records.set(genus, { genus, gbifHints: readGbifHints(row), hosts });
  }
  return [...records.values()];
}

function listHosts(row: Record<string, string>) {
  const lifestyleRelation = toRelation(
    [row.primary_lifestyle, row.Secondary_lifestyle].join(" "),
    "hasHost",
  );
  const named = (row.Specific_hosts ?? "")
    .split(",")
    .flatMap((value) => readHostName(value) ?? [])
    .map((host) => ({ ...host, relation: lifestyleRelation }));
  const animals = readAnimalCapacity(row.Animal_biotrophic_capacity_template ?? "").map(
    ({ capacity, host }) => ({ ...host, relation: toRelation(capacity, "hasHost") }),
  );
  return uniqueHosts([...named, ...animals]);
}

function toRelation(words: string, fallback: string) {
  return relationByLifestyleWord.find(([pattern]) => pattern.test(words))?.[1] ?? fallback;
}

function uniqueHosts(hosts: FungalHost[]) {
  const byKey = new Map<string, FungalHost>();
  for (const host of hosts) {
    const key = `${host.relation}\n${host.name}`;
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeHosts(existing, host) : host);
  }
  return [...byKey.values()];
}

function mergeHosts(first: FungalHost, second: FungalHost): FungalHost {
  const flags = [...new Set([...first.qualityFlags, ...second.qualityFlags])] as QualityFlag[];
  return { ...first, englishName: first.englishName ?? second.englishName, qualityFlags: flags };
}
