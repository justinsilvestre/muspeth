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
  (source_node_id, target_node_id, kind, relation, basis, taxonomic_level, source, citation, licence, quality_flags)
VALUES
  ('wikidata:Q509308', 'wikidata:Q1044186', 'interaction', 'mutualistOf', 'observed', 'species',
    'sample', 'Tsing, A. L. (2015). The Mushroom at the End of the World.', 'CC0-1.0', '["hand_entered_sample"]'),
  ('wikidata:Q1197786', 'wikidata:Q1044186', 'interaction', 'pathogenOf', 'observed', 'species',
    'sample', 'Tsing, A. L. (2015). The Mushroom at the End of the World.', 'CC0-1.0', '["hand_entered_sample"]'),
  ('wikidata:Q15859794', 'wikidata:Q1197786', 'interaction', 'vectorOf', 'observed', 'species',
    'sample', 'Tsing, A. L. (2015). The Mushroom at the End of the World.', 'CC0-1.0', '["hand_entered_sample"]'),
  ('wikidata:Q15859794', 'wikidata:Q1044186', 'interaction', 'eats', 'observed', 'species',
    'sample', 'Tsing, A. L. (2015). The Mushroom at the End of the World.', 'CC0-1.0', '["hand_entered_sample"]');
