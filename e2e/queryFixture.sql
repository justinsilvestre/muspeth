-- Connections of several kinds, bases, places and dates, added to the seed sample for end-to-end tests of querying.
-- They are invented for testing and are not real observations.

INSERT INTO nodes (id, kind, label, source) VALUES
  ('e2e:kyoto', 'place', 'Kyoto', 'e2e_fixture'),
  ('e2e:octenol', 'compound', '1-octen-3-ol', 'e2e_fixture'),
  ('e2e:matsu', 'word', 'matsu', 'e2e_fixture');

INSERT INTO node_names (node_id, language, name) VALUES
  ('e2e:matsu', 'ja', '松');

INSERT INTO connections
  (id, source_node_id, target_node_id, kind, relation, basis, place, latitude, longitude, date, source, licence, quality_flags)
VALUES
  (101, 'wikidata:Q30034', 'e2e:kyoto', 'shared_place_and_sound', 'recordedAt', 'observed',
    'Kyoto', 35.01, 135.77, '2019-05-12', 'e2e_fixture', 'CC0-1.0', '[]'),
  (102, 'wikidata:Q509308', 'e2e:kyoto', 'shared_place_and_sound', 'recordedAt', 'observed',
    'Kyoto', 35.03, 135.78, '1990/1992', 'e2e_fixture', 'CC0-1.0', '[]'),
  (103, 'wikidata:Q509308', 'e2e:octenol', 'shared_substance', 'containsCompound', 'observed',
    NULL, NULL, NULL, NULL, 'e2e_fixture', 'CC0-1.0', '[]'),
  (104, 'wikidata:Q1044186', 'e2e:matsu', 'shared_words_and_stories', 'namedBy', 'attributed',
    NULL, NULL, NULL, NULL, 'e2e_fixture', 'CC0-1.0', '[]'),
  (105, 'wikidata:Q509308', 'e2e:matsu', 'shared_words_and_stories', 'namedBy', 'attributed',
    NULL, NULL, NULL, NULL, 'e2e_fixture', 'CC0-1.0', '[]'),
  (106, 'wikidata:Q30034', 'wikidata:Q1044186', 'interaction', 'visitsFlowersOf', 'observed',
    'Sapporo', 43.06, 141.35, '2005-07', 'e2e_fixture', 'CC0-1.0', '["suspected_error"]'),
  (107, 'wikidata:Q15859794', 'wikidata:Q30034', 'likeness', 'similarBodySize', 'computed',
    NULL, NULL, NULL, NULL, 'e2e_fixture', 'CC0-1.0', '["sampling_bias"]');

-- A node with a long unbroken name, to check that narrow layouts wrap it instead of overflowing.
INSERT INTO nodes (id, kind, label, source) VALUES
  ('e2e:octacycle', 'compound',
    '6,8,18,20,28-pentaoxaoctacyclo[17.11.1.17,15.02,17.05,16.09,14.021,30.024,29]dotriaconta-2(17),3,5(16)',
    'e2e_fixture');
