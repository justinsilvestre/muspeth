import { env } from "cloudflare:test";
import { insertSampleGraph } from "./insertSampleGraph";

/** Inserts the sample graph, with the pine placed in a three-level lineage. */
export async function insertSampleTaxonomy() {
  await insertSampleGraph();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO taxa (id, parent_id, rank, name, source, licence) VALUES
         ('gbif:6', NULL, 'kingdom', 'Plantae', 'test', 'CC-BY-4.0'),
         ('gbif:2684241', 'gbif:6', 'genus', 'Pinus', 'test', 'CC-BY-4.0'),
         ('gbif:5285104', 'gbif:2684241', 'species', 'Pinus densiflora', 'test', 'CC-BY-4.0')`,
    ),
    env.DB.prepare(
      `INSERT INTO taxon_placements (node_id, taxon_id, quality_flags)
       VALUES ('pine', 'gbif:5285104', '["fuzzy_name_match"]')`,
    ),
  ]);
}
