import { type ReactNode, type Ref, useId } from "react";
import { type NodeKind, nodeKinds } from "../../shared/graph";
import { NodeKindIcon } from "../graphics/NodeKindIcon";
import { nodeKindLabels } from "./nodeKindLabels";

const numberFormat = new Intl.NumberFormat("en");

type KindChoicesProps = {
  kind: NodeKind | undefined;
  countsByKind: Record<NodeKind, number>;
  onKindChange: (kind: NodeKind | undefined) => void;
  ref?: Ref<HTMLFieldSetElement>;
};

/** Lets the reader keep one kind of node, showing how many nodes of each kind there are. */
export function KindChoices({ kind, countsByKind, onKindChange, ref }: KindChoicesProps) {
  const name = useId();
  const totalCount = nodeKinds.reduce((sum, nodeKind) => sum + countsByKind[nodeKind], 0);
  return (
    <fieldset ref={ref} className="flex flex-wrap gap-1.5 text-sm">
      <legend className="sr-only">Kind</legend>
      <Choice
        name={name}
        label="all"
        count={totalCount}
        isChecked={!kind}
        onCheck={() => onKindChange(undefined)}
      />
      {nodeKinds.map((nodeKind) => (
        <Choice
          key={nodeKind}
          name={name}
          label={nodeKindLabels[nodeKind]}
          count={countsByKind[nodeKind]}
          isChecked={kind === nodeKind}
          onCheck={() => onKindChange(nodeKind)}
        >
          <NodeKindIcon kind={nodeKind} />
        </Choice>
      ))}
    </fieldset>
  );
}

type ChoiceProps = {
  name: string;
  label: string;
  count: number;
  isChecked: boolean;
  onCheck: () => void;
  children?: ReactNode;
};

function Choice({ name, label, count, isChecked, onCheck, children }: ChoiceProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 hover:bg-subtle has-checked:border-ink has-checked:bg-selected has-focus-visible:outline-2 has-focus-visible:outline-ink has-focus-visible:outline-offset-1">
      <input type="radio" name={name} className="sr-only" checked={isChecked} onChange={onCheck} />
      {children}
      {label}
      <span className="text-muted">{numberFormat.format(count)}</span>
    </label>
  );
}
