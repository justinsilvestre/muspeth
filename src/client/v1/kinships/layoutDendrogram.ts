import type { ClusterTree } from "../../../shared/kinships/clusterAverageLinkage";

type Segment = { x1: number; y1: number; x2: number; y2: number; isUnrelated: boolean };
type DendrogramOptions = {
  rowHeight: number;
  width: number;
  /** A left tree has its leaves at its right edge; a right tree is mirrored. */
  side: "left" | "right";
};

/**
 * Lays out a tree as right-angled branches, one leaf per row, with each join placed across the width
 * by how distant its groups are. Joins at the greatest distance, between groups that share nothing, are marked.
 */
export function layoutDendrogram(tree: ClusterTree, options: DendrogramOptions) {
  const leafY = new Map<string, number>();
  const segments: Segment[] = [];
  const toX = (height: number) =>
    options.side === "left" ? options.width * (1 - height) : options.width * height;
  const place = (node: ClusterTree): { x: number; y: number } => {
    if (node.id !== null) {
      const y = (leafY.size + 0.5) * options.rowHeight;
      leafY.set(node.id, y);
      return { x: toX(0), y };
    }
    const [first, second] = node.children.map(place) as [
      { x: number; y: number },
      { x: number; y: number },
    ];
    const x = toX(node.height);
    const isUnrelated = node.height >= 1;
    segments.push(
      { x1: x, y1: first.y, x2: x, y2: second.y, isUnrelated },
      { x1: x, y1: first.y, x2: first.x, y2: first.y, isUnrelated },
      { x1: x, y1: second.y, x2: second.x, y2: second.y, isUnrelated },
    );
    return { x, y: (first.y + second.y) / 2 };
  };
  place(tree);
  return { leafY, segments };
}
