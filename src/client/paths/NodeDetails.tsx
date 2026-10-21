import { Link, useSearchParams } from "react-router";
import { MediaCredit } from "../media/MediaCredit";
import { NodeThumbnail } from "../media/NodeThumbnail";
import { NodeLink } from "../NodeLink";
import { termLabel } from "../termLabel";
import { countNeighbors, type DescribePathNode } from "./createPathNodeDescriber";
import type { PathGroup } from "./groupPathVariants";

type NodeDetailsProps = {
  nodeId: string;
  groups: PathGroup[];
  describeNode: DescribePathNode;
};

/** Describes a node of the paths found, and offers to start a new search from it or to it. */
export function NodeDetails({ nodeId, groups, describeNode }: NodeDetailsProps) {
  const [searchParams] = useSearchParams();
  const { name, kind, media, neighborCount } = describeNode(nodeId);
  const ranks = groups.flatMap(({ paths }, index) =>
    paths.some(({ nodeIds }) => nodeIds.includes(nodeId)) ? [index + 1] : [],
  );
  const searchFrom = (end: "from" | "to") => {
    const next = new URLSearchParams(searchParams);
    next.set(end, nodeId);
    return `/paths?${next}`;
  };
  return (
    <section aria-labelledby="node-details-heading" className="space-y-2">
      <div className="flex items-center gap-3">
        <NodeThumbnail media={media} kind={kind} />
        <div className="min-w-0">
          <h3 id="node-details-heading" className="wrap-anywhere font-medium">
            <NodeLink nodeId={nodeId} name={name} />
          </h3>
          <p className="text-muted text-sm">
            {termLabel(kind ?? "node")} · {countNeighbors(neighborCount)} · on{" "}
            {ranks.length === 1 ? "path" : "paths"} {ranks.join(", ")}
          </p>
        </div>
      </div>
      {media && kind !== "recording" && (
        <p className="text-muted text-xs">
          Image: <MediaCredit media={media} />
        </p>
      )}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {searchParams.get("from") !== nodeId && (
          <SearchLink to={searchFrom("from")}>Find paths from here</SearchLink>
        )}
        {searchParams.get("to") !== nodeId && (
          <SearchLink to={searchFrom("to")}>Find paths to here</SearchLink>
        )}
      </p>
    </section>
  );
}

function SearchLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="underline underline-offset-2">
      {children}
    </Link>
  );
}
