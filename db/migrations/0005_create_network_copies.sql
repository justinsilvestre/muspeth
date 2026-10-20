-- Copies of the networks that imports took connections from.
-- Sources copy one another's networks, so the graph holds each network's connections once, under
-- one canonical copy, and records its other copies here as provenance.

CREATE TABLE network_copies (
  id INTEGER PRIMARY KEY,
  -- The canonical copy, as connection_sources.dataset_id gives it, for example 'mangal:948'.
  canonical_network_id TEXT NOT NULL,
  -- The collection that holds this copy, for example 'mangal', 'web-of-life' or 'globi'.
  collection TEXT NOT NULL,
  -- The copy's identifier in its collection, when known, for example 'M_PL_056'.
  network_id TEXT,
  url TEXT,
  -- The import that recorded the copy, so that its next run can replace what it recorded.
  source TEXT NOT NULL
);

CREATE INDEX network_copies_canonical_network_id ON network_copies (canonical_network_id);
CREATE INDEX network_copies_source ON network_copies (source);
