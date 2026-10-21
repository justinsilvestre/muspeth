/**
 * Selects the organisms that the likeness import finds neighbours for: the seed's organisms and
 * those with an interaction.
 * It goes by connections rather than by each node's source, since a node passes to another import
 * when the import that added it drops it.
 * Other kinds of connection do not count, since imports such as the words import link any organism
 * in the graph, including those that the likeness import itself added, and counting them would
 * grow the graph by a ring of neighbours on every run.
 */
export const traitStartOrganismsSql = `SELECT id, label FROM nodes WHERE kind = 'organism' AND (
  source = 'sample' OR EXISTS (SELECT 1 FROM connections WHERE kind = 'interaction'
    AND (source_node_id = nodes.id OR target_node_id = nodes.id))
) ORDER BY id`;
