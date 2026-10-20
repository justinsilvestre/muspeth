-- Prepares the graph for imports from several sources.

-- The coordinates where a connection was recorded. connections.place stays a human-readable name.
ALTER TABLE connections ADD COLUMN latitude REAL;
ALTER TABLE connections ADD COLUMN longitude REAL;

-- The import that added each node, so that an import can remove the nodes its previous run added.
-- Nodes entered by hand, such as those in db/seed.sql, belong to 'sample'.
ALTER TABLE nodes ADD COLUMN source TEXT NOT NULL DEFAULT 'sample';

-- A link to an image or recording of the node, with the media's own licence.
ALTER TABLE nodes ADD COLUMN media_url TEXT;
ALTER TABLE nodes ADD COLUMN media_licence TEXT;

-- Gives GloBI the organisms that its import has so far treated as its own,
-- which are those whose every connection came from it.
UPDATE nodes SET source = 'globi'
WHERE kind = 'organism'
  AND EXISTS (
    SELECT 1 FROM connections
    WHERE (source_node_id = nodes.id OR target_node_id = nodes.id) AND source = 'globi'
  )
  AND NOT EXISTS (
    SELECT 1 FROM connections
    WHERE (source_node_id = nodes.id OR target_node_id = nodes.id) AND source <> 'globi'
  );

CREATE INDEX nodes_source ON nodes (source);
CREATE INDEX connections_kind ON connections (kind);
CREATE INDEX connections_source ON connections (source);
CREATE INDEX connections_basis ON connections (basis);
