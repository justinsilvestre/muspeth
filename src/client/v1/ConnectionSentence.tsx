import { NodeLink } from "./NodeLink";
import { relationLabel } from "./relationLabel";

type ConnectionSentenceProps = {
  sourceId: string;
  relation: string;
  targetId: string;
  nameOf: (nodeId: string) => string;
};

/** States a connection as its source, relation and target, for example "pine mutualist of matsutake". */
export function ConnectionSentence({
  sourceId,
  relation,
  targetId,
  nameOf,
}: ConnectionSentenceProps) {
  return (
    <p>
      <NodeLink nodeId={sourceId} name={nameOf(sourceId)} />{" "}
      <span className="text-muted">{relationLabel(relation)}</span>{" "}
      <NodeLink nodeId={targetId} name={nameOf(targetId)} />
    </p>
  );
}
