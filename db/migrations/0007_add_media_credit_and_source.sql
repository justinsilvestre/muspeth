-- Credits each node's media as its licence asks, and records which import linked it.

-- The author or holder of the media, as the licence asks it to be credited.
ALTER TABLE nodes ADD COLUMN media_credit TEXT;

-- The page that describes the media and its licence, for example a Wikimedia Commons file page.
ALTER TABLE nodes ADD COLUMN media_page_url TEXT;

-- The import that linked the media, which can differ from the import that added the node.
-- An import's next run replaces the media it linked and leaves other imports' media alone.
ALTER TABLE nodes ADD COLUMN media_source TEXT;

UPDATE nodes SET media_source = source WHERE media_url IS NOT NULL;

CREATE INDEX nodes_media_source ON nodes (media_source);
