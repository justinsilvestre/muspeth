/**
 * Selects the id and label of the organisms entered by hand in the seed sample.
 * Imports grow the graph outward from these alone, so that it stays within a step or two of them.
 */
export const seedOrganismsSql =
  "SELECT id, label FROM nodes WHERE kind = 'organism' AND source = 'sample'";
