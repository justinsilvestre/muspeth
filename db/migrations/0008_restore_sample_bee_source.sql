-- Credits the honey bee to the hand-entered sample again.
-- Migration 0004 credited it to GloBI because it had no sample connections, and imports that start from sample organisms then skipped it.
UPDATE nodes SET source = 'sample' WHERE id = 'wikidata:Q30034' AND source <> 'sample';
