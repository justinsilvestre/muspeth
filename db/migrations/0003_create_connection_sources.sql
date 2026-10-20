-- The studies that support each connection, grouped under the dataset that published them.

CREATE TABLE connection_sources (
  connection_id INTEGER NOT NULL REFERENCES connections (id) ON DELETE CASCADE,
  -- The dataset's identifier at its source, for example 'globalbioticinteractions/eppo'.
  dataset_id TEXT,
  dataset_citation TEXT,
  study_citation TEXT,
  -- A DOI resolver URL when the study has a DOI, otherwise the study's own address.
  study_url TEXT,
  -- How many source records report the connection in this study, when they were counted.
  record_count INTEGER
);

CREATE INDEX connection_sources_connection_id ON connection_sources (connection_id);

-- Keeps the citations stored so far, one line of connections.citation per row.
-- connections.citation is no longer read; dropping it would require rebuilding the table.
INSERT INTO connection_sources (connection_id, study_citation)
WITH RECURSIVE citation_lines (connection_id, line, rest) AS (
  SELECT id, NULL, citation || char(10) FROM connections WHERE citation IS NOT NULL
  UNION ALL
  SELECT
    connection_id,
    substr(rest, 1, instr(rest, char(10)) - 1),
    substr(rest, instr(rest, char(10)) + 1)
  FROM citation_lines
  WHERE rest <> ''
)
SELECT connection_id, line FROM citation_lines WHERE line <> '';
