-- Nodes and connections of the connection graph described in docs/connection-graph-plan.md.

CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (
    kind IN ('organism', 'compound', 'cultural_object', 'word', 'story_motif', 'recording', 'place')
  ),
  label TEXT NOT NULL
);

CREATE TABLE node_names (
  node_id TEXT NOT NULL REFERENCES nodes (id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (node_id, language, name)
);

CREATE TABLE connections (
  id INTEGER PRIMARY KEY,
  source_node_id TEXT NOT NULL REFERENCES nodes (id),
  target_node_id TEXT NOT NULL REFERENCES nodes (id),
  kind TEXT NOT NULL CHECK (
    kind IN (
      'interaction',
      'likeness',
      'shared_substance',
      'shared_culture',
      'shared_words_and_stories',
      'shared_place_and_sound'
    )
  ),
  relation TEXT NOT NULL,
  basis TEXT NOT NULL CHECK (basis IN ('observed', 'computed', 'attributed')),
  taxonomic_level TEXT,
  weight REAL,
  place TEXT,
  date TEXT,
  source TEXT NOT NULL,
  citation TEXT,
  licence TEXT NOT NULL,
  -- A JSON array of flag names, for example '["unmatched_name"]'.
  quality_flags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(quality_flags))
);

CREATE INDEX connections_source_node_id ON connections (source_node_id);
CREATE INDEX connections_target_node_id ON connections (target_node_id);
