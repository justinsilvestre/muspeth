import { Link, useParams, useSearchParams } from "react-router";
import { keepConnectionFilterParameters } from "./filters/keepConnectionFilterParameters";
import { organismPath } from "./organismPath";

type NodeLinkProps = {
  nodeId: string;
  name: string;
};

/**
 * Links a node's name to its page, keeping the connection filter of the current address.
 * On the node's own page the name is plain text.
 */
export function NodeLink({ nodeId, name }: NodeLinkProps) {
  const { nodeId: currentNodeId } = useParams();
  const [searchParams] = useSearchParams();
  if (nodeId === currentNodeId) return <>{name}</>;

  const filterParams = keepConnectionFilterParameters(searchParams).toString();
  return (
    <Link
      to={{ pathname: organismPath(nodeId), search: filterParams }}
      className="rounded-xs underline decoration-faint underline-offset-2 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
    >
      {name}
    </Link>
  );
}
