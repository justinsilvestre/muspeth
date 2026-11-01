import type { QualityFlag } from "../src/shared/qualityFlags.ts";

/** One lateral gene transfer: a gene found in grasses that received it from another lineage of grasses. */
export type GeneTransfer = {
  /** The study's name for the gene tree in which the transfer was found, unique to the transfer. */
  id: string;
  /** The gene's identifier in the genome it was first found in. */
  geneId: string;
  /** The protein the gene codes for, as the study annotates it, or null where it gave none. */
  protein: string | null;
  /** The grass lineage the gene came from, or null where the study could not say. */
  donor: Lineage | null;
  /** The grasses the gene was found in, the sampled genome first. */
  recipients: Recipient[];
};

export type Lineage = { name: string; rank: string };

export type Recipient = { name: string; rank: string; qualityFlags: QualityFlag[] };

/** The ranks of the donor lineages the study names, within the grass family. */
const lineageRanks: Record<string, string> = {
  Andropogoneae: "tribe",
  Paniceae: "tribe",
  Cenchrinae: "subtribe",
  Panicinae: "subtribe",
  Chloridoideae: "subfamily",
  Pooideae: "subfamily",
};

/** Spellings in the study's tables that differ from the names of the species meant. */
const corrections: Record<string, string> = {
  Chlorodoideae: "Chloridoideae",
  "Capillipedium venstrum": "Capillipedium venustum",
  "Cenchrus siberianus": "Cenchrus sieberianus",
  "Dicathium aristatum": "Dichanthium aristatum",
  "Panicum capilliare": "Panicum capillare",
  "Panicum vigratum": "Panicum virgatum",
  "Themda sp.": "Themeda sp.",
};

const missing = new Set(["", "-", "NA"]);

/**
 * Reads the transfers from a "Genes" sheet of the study's supporting tables. Each row is one copy
 * of a transferred gene in one grass, grouped under the gene tree it was found in; rows for other
 * grasses the gene was found in name them as "Non-target (…)".
 */
export function parseGeneTransfers(rows: string[][]) {
  const [header = [], ...body] = rows;
  const column = (name: string) => header.findIndex((cell) => cell === name);
  const treefileColumns = header.flatMap((cell, i) => (cell === "Treefile" ? [i] : []));
  const columns = {
    species: column("Species"),
    gene: column("LGT") === -1 ? column("Gene") : column("LGT"),
    donor: column("Donor"),
    protein: column("Protein"),
  };
  const transfers = new Map<string, GeneTransfer>();
  for (const row of body) {
    const id = treefileColumns.map((i) => row[i] ?? "").find((cell) => cell !== "");
    const species = row[columns.species] ?? "";
    if (!id || species === "") continue;
    const transfer = transfers.get(id) ?? {
      id,
      geneId: "",
      protein: null,
      donor: null,
      recipients: [],
    };
    transfers.set(id, addRow(transfer, row, columns));
  }
  return [...transfers.values()].filter(({ geneId }) => geneId !== "");
}

function addRow(
  transfer: GeneTransfer,
  row: string[],
  columns: { species: number; gene: number; donor: number; protein: number },
) {
  const species = row[columns.species] ?? "";
  const recipient = readRecipient(species);
  const isSampled = !species.startsWith("Non-target");
  const recipients = transfer.recipients.some(({ name }) => name === recipient.name)
    ? transfer.recipients
    : [...transfer.recipients, recipient];
  return {
    ...transfer,
    geneId: transfer.geneId || (isSampled ? (row[columns.gene] ?? "") : ""),
    protein: transfer.protein ?? readValue(row[columns.protein]),
    donor: transfer.donor ?? readLineage(row[columns.donor]),
    recipients,
  } satisfies GeneTransfer;
}

function readValue(cell: string | undefined) {
  const value = cell?.trim() ?? "";
  return missing.has(value) ? null : value;
}

function readLineage(cell: string | undefined) {
  const value = readValue(cell);
  if (value === null) return null;
  const name = corrections[value] ?? value;
  return { name, rank: lineageRanks[name] ?? "tribe" } satisfies Lineage;
}

/**
 * Reads a grass from its name in the tables: "Non-target (Alloteropsis angusta AAN4-8)" is the
 * species Alloteropsis angusta, and "Themeda sp." an unnamed species, read as its genus.
 */
export function readRecipient(species: string): Recipient {
  const bare = species
    .replace(/^Non-target\s*\(/, "")
    .replace(/\)\s*$/, "")
    .replace(/[‐-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const corrected = corrections[bare] ?? bare;
  const flags: QualityFlag[] = corrected === bare ? [] : ["fuzzy_name_match"];
  const [genus = "", epithet = ""] = corrected.split(/\s+/);
  if (epithet === "sp." || epithet === "")
    return { name: genus, rank: "genus", qualityFlags: flags };
  return { name: `${genus} ${epithet}`, rank: "species", qualityFlags: flags };
}
