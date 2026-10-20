-- A hand-entered sample of the matsutake system, used until real imports exist.
-- Every connection carries the 'hand_entered_sample' flag so it can be told apart from imported data.

INSERT INTO nodes (id, kind, label) VALUES
  ('wikidata:Q509308', 'organism', 'Tricholoma matsutake'),
  ('wikidata:Q1044186', 'organism', 'Pinus densiflora'),
  ('wikidata:Q1197786', 'organism', 'Bursaphelenchus xylophilus'),
  ('wikidata:Q15859794', 'organism', 'Monochamus alternatus');

INSERT INTO node_names (node_id, language, name) VALUES
  ('wikidata:Q509308', 'en', 'matsutake'),
  ('wikidata:Q509308', 'ja', 'マツタケ'),
  ('wikidata:Q1044186', 'en', 'Japanese red pine'),
  ('wikidata:Q1044186', 'ja', 'アカマツ'),
  ('wikidata:Q1197786', 'en', 'pinewood nematode'),
  ('wikidata:Q1197786', 'ja', 'マツノザイセンチュウ'),
  ('wikidata:Q15859794', 'en', 'Japanese pine sawyer'),
  ('wikidata:Q15859794', 'ja', 'マツノマダラカミキリ');

INSERT INTO connections
  (id, source_node_id, target_node_id, kind, relation, basis, taxonomic_level, source, licence, quality_flags)
VALUES
  (1, 'wikidata:Q509308', 'wikidata:Q1044186', 'interaction', 'mutualistOf', 'observed', 'species',
    'sample', 'CC0-1.0', '["hand_entered_sample"]'),
  (2, 'wikidata:Q1197786', 'wikidata:Q1044186', 'interaction', 'pathogenOf', 'observed', 'species',
    'sample', 'CC0-1.0', '["hand_entered_sample"]'),
  (3, 'wikidata:Q15859794', 'wikidata:Q1197786', 'interaction', 'vectorOf', 'observed', 'species',
    'sample', 'CC0-1.0', '["hand_entered_sample"]'),
  (4, 'wikidata:Q15859794', 'wikidata:Q1044186', 'interaction', 'eats', 'observed', 'species',
    'sample', 'CC0-1.0', '["hand_entered_sample"]');

INSERT INTO connection_sources (connection_id, study_citation) VALUES
  (1, 'Tsing, A. L. (2015). The Mushroom at the End of the World.'),
  (2, 'Tsing, A. L. (2015). The Mushroom at the End of the World.'),
  (3, 'Tsing, A. L. (2015). The Mushroom at the End of the World.'),
  (4, 'Tsing, A. L. (2015). The Mushroom at the End of the World.');

-- Lineages copied from the GBIF backbone taxonomy (https://doi.org/10.15468/39omei).
INSERT INTO taxa (id, parent_id, rank, name, source, licence) VALUES
  ('gbif:5', NULL, 'kingdom', 'Fungi', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:34', 'gbif:5', 'phylum', 'Basidiomycota', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:186', 'gbif:34', 'class', 'Agaricomycetes', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:1499', 'gbif:186', 'order', 'Agaricales', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:8787', 'gbif:1499', 'family', 'Tricholomataceae', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:2527766', 'gbif:8787', 'genus', 'Tricholoma', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:5241820', 'gbif:2527766', 'species', 'Tricholoma matsutake', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:6', NULL, 'kingdom', 'Plantae', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:7707728', 'gbif:6', 'phylum', 'Tracheophyta', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:194', 'gbif:7707728', 'class', 'Pinopsida', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:640', 'gbif:194', 'order', 'Pinales', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:3925', 'gbif:640', 'family', 'Pinaceae', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:2684241', 'gbif:3925', 'genus', 'Pinus', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:5285104', 'gbif:2684241', 'species', 'Pinus densiflora', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:1', NULL, 'kingdom', 'Animalia', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:5967481', 'gbif:1', 'phylum', 'Nematoda', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:11133537', 'gbif:5967481', 'class', 'Chromadorea', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:440', 'gbif:11133537', 'order', 'Rhabditida', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:2566', 'gbif:440', 'family', 'Aphelenchoididae', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:6756641', 'gbif:2566', 'genus', 'Bursaphelenchus', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:8848401', 'gbif:6756641', 'species', 'Bursaphelenchus xylophilus', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:54', 'gbif:1', 'phylum', 'Arthropoda', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:216', 'gbif:54', 'class', 'Insecta', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:1470', 'gbif:216', 'order', 'Coleoptera', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:5602', 'gbif:1470', 'family', 'Cerambycidae', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:7372826', 'gbif:5602', 'genus', 'Monochamus', 'gbif_backbone', 'CC-BY-4.0'),
  ('gbif:4739415', 'gbif:7372826', 'species', 'Monochamus alternatus', 'gbif_backbone', 'CC-BY-4.0');

INSERT INTO taxon_placements (node_id, taxon_id) VALUES
  ('wikidata:Q509308', 'gbif:5241820'),
  ('wikidata:Q1044186', 'gbif:5285104'),
  ('wikidata:Q1197786', 'gbif:8848401'),
  ('wikidata:Q15859794', 'gbif:4739415');
