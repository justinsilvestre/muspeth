/** Gives a path's cost as a fraction of the worst cost among the paths listed, for drawing as a bar. */
export function measureCostBar(cost: number, worstCost: number) {
  return worstCost > 0 ? cost / worstCost : 0;
}
