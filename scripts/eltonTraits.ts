import { parseTsv } from "./parseTsv.ts";
import type { TraitRecord } from "./traitRecord.ts";

/** The diet columns of EltonTraits 1.0, each the percentage of the diet from one kind of food. */
const dietColumns = [
  "Diet-Inv",
  "Diet-Vend",
  "Diet-Vect",
  "Diet-Vfish",
  "Diet-Vunk",
  "Diet-Scav",
  "Diet-Fruit",
  "Diet-Nect",
  "Diet-Seed",
  "Diet-PlantO",
];
/** Body masses this many orders of magnitude apart count as entirely unlike. */
const massRangeInOrders = 3;
const classOfGroup = { bird: "Aves", mammal: "Mammalia" };

/** What EltonTraits records of a species' diet and size. */
export type EltonTraits = {
  /** The share of each kind of food in the diet, adding up to 1. */
  diet: number[];
  /** The base-10 logarithm of the body mass in grams. */
  log10Mass: number;
};

/** Reads one EltonTraits 1.0 table, skipping rows without a name or a known diet. */
export function parseEltonTraits(text: string, group: keyof typeof classOfGroup) {
  return parseTsv(text).flatMap((row) => {
    const percentages = dietColumns.map((column) => Number(row[column]) || 0);
    const total = percentages.reduce((sum, percentage) => sum + percentage, 0);
    const mass = Number(row["BodyMass-Value"]);
    if (!row.Scientific || total === 0 || !(mass > 0)) return [];
    return [
      {
        name: row.Scientific.trim(),
        group,
        traits: {
          diet: percentages.map((percentage) => percentage / total),
          log10Mass: Math.log10(mass),
        },
        names: row.English ? [{ language: "en", name: row.English.trim() }] : [],
        gbifHints: { kingdom: "Animalia", class: classOfGroup[group] },
      } satisfies TraitRecord<EltonTraits>,
    ];
  });
}

/**
 * Rates how alike two species are in diet and body mass, from 0 to 1.
 * It averages two parts with equal weight: the share of diet the two have in common
 * (Schoener's proportional overlap), and the closeness of their masses on a logarithmic scale.
 */
export function compareEltonTraits(first: EltonTraits, second: EltonTraits) {
  const dietOverlap = first.diet.reduce(
    (sum, share, i) => sum + Math.min(share, second.diet[i] ?? 0),
    0,
  );
  const massDifference = Math.abs(first.log10Mass - second.log10Mass) / massRangeInOrders;
  return (dietOverlap + 1 - Math.min(1, massDifference)) / 2;
}
