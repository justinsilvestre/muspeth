-- The taxonomic tree that organism nodes belong to, imported from the GBIF backbone taxonomy.

CREATE TABLE taxa (
  -- A source-prefixed identifier, for example 'gbif:5' for the kingdom Fungi.
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES taxa (id),
  rank TEXT NOT NULL CHECK (
    rank IN ('kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species')
  ),
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  licence TEXT NOT NULL
);

CREATE INDEX taxa_parent_id ON taxa (parent_id);

-- Places each organism node on the taxon it was matched to.
CREATE TABLE taxon_placements (
  node_id TEXT PRIMARY KEY REFERENCES nodes (id) ON DELETE CASCADE,
  taxon_id TEXT NOT NULL REFERENCES taxa (id),
  -- A JSON array of flag names, for example '["fuzzy_name_match"]'.
  quality_flags TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(quality_flags))
);
