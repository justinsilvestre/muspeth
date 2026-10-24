import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { listKinships } from "./kinshipQueries";

const kinds = [
  "interaction",
  "shared_substance",
  "shared_culture",
  "shared_words_and_stories",
] as const;

/**
 * Inserts two pines and the matsutake, placed in a small taxonomy, each linked through four kinds.
 * The pines share a compound that the matsutake lacks.
 */
async function insertKinshipGraph() {
  const organisms = ["red-pine", "black-pine", "matsutake"];
  const others = ["pinene", "octenol", "scroll", "matsu", "beetle"];
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO taxa (id, parent_id, rank, name, source, licence) VALUES
        ('plantae', NULL, 'kingdom', 'Plantae', 'test', 'CC0-1.0'),
        ('pinopsida', 'plantae', 'class', 'Pinopsida', 'test', 'CC0-1.0'),
        ('pinus', 'pinopsida', 'genus', 'Pinus', 'test', 'CC0-1.0'),
        ('fungi', NULL, 'kingdom', 'Fungi', 'test', 'CC0-1.0'),
        ('agaricomycetes', 'fungi', 'class', 'Agaricomycetes', 'test', 'CC0-1.0')`,
    ),
    ...[...organisms, ...others].map((id) =>
      env.DB.prepare("INSERT INTO nodes (id, kind, label) VALUES (?, ?, ?)").bind(
        id,
        organisms.includes(id) ? "organism" : "compound",
        id,
      ),
    ),
    env.DB.prepare(
      `INSERT INTO taxon_placements (node_id, taxon_id) VALUES
        ('red-pine', 'pinus'), ('black-pine', 'pinus'), ('matsutake', 'agaricomycetes')`,
    ),
    ...organisms.flatMap((organism, o) =>
      kinds.map((kind, k) =>
        env.DB.prepare(
          `INSERT INTO connections (id, source_node_id, target_node_id, kind, relation, basis, source, licence)
           VALUES (?, ?, ?, ?, 'relatedTo', 'observed', 'test', 'CC0-1.0')`,
        ).bind(100 + o * 10 + k, organism, sharedNeighbour(organism, kind), kind),
      ),
    ),
  ]);
}

function sharedNeighbour(organism: string, kind: (typeof kinds)[number]) {
  if (kind === "shared_substance") return organism === "matsutake" ? "octenol" : "pinene";
  return { interaction: "beetle", shared_culture: "scroll", shared_words_and_stories: "matsu" }[
    kind
  ];
}

async function distanceBetween(grouping: "descent" | (typeof kinds)[number], a: string, b: string) {
  const { organisms, distances } = await listKinships(env.DB);
  const ids = organisms.map(({ id }) => id);
  return distances[grouping][ids.indexOf(a)]?.[ids.indexOf(b)];
}

describe("listKinships", () => {
  it("chooses the organisms connected in at least four kinds", async () => {
    await insertKinshipGraph();
    const { organisms } = await listKinships(env.DB);
    expect(organisms.map(({ id }) => id).sort()).toEqual(["black-pine", "matsutake", "red-pine"]);
  });

  it("names each organism's kingdom and class", async () => {
    await insertKinshipGraph();
    const { organisms } = await listKinships(env.DB);
    expect(organisms.find(({ id }) => id === "matsutake")).toMatchObject({
      kingdom: "Fungi",
      className: "Agaricomycetes",
    });
  });

  it("puts organisms of different kingdoms far apart by descent", async () => {
    await insertKinshipGraph();
    expect(await distanceBetween("descent", "red-pine", "matsutake")).toBe(1);
  });

  it("brings together organisms that share a compound", async () => {
    await insertKinshipGraph();
    expect(await distanceBetween("shared_substance", "red-pine", "black-pine")).toBe(0);
  });

  it("keeps apart organisms that share no compound", async () => {
    await insertKinshipGraph();
    expect(await distanceBetween("shared_substance", "red-pine", "matsutake")).toBe(1);
  });
});
