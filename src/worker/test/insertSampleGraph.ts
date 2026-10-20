import { env } from "cloudflare:test";

/** Inserts two organisms joined by one connection, from the pine to the fungus, with its one study. */
export async function insertSampleGraph() {
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO nodes (id, kind, label) VALUES ('pine', 'organism', 'Pinus densiflora'), ('fungus', 'organism', 'Tricholoma matsutake')",
    ),
    env.DB.prepare(
      "INSERT INTO node_names (node_id, language, name) VALUES ('pine', 'ja', 'アカマツ')",
    ),
    env.DB.prepare(
      `INSERT INTO connections (id, source_node_id, target_node_id, kind, relation, basis, source, licence, quality_flags)
       VALUES (1, 'pine', 'fungus', 'interaction', 'mutualistOf', 'observed', 'test', 'CC0-1.0', '["unmatched_name"]')`,
    ),
    env.DB.prepare(
      `INSERT INTO connection_sources (connection_id, dataset_id, dataset_citation, study_citation, study_url, record_count)
       VALUES (1, 'test/dataset', 'A dataset.', 'A study.', 'https://doi.org/10.1000/study', 2)`,
    ),
  ]);
}
