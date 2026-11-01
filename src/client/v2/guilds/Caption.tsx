import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import { type BodySet, countOf } from "./BodySet";
import type { Relation } from "./relations";

type CaptionProps = { set: BodySet; relation: Relation; table: InnovationTable };

/** Says in one sentence what the dots and the membranes are, and how much of the set the relation reaches. */
export function Caption({ set, relation, table }: CaptionProps) {
  const linked = new Set(table.innovations.flatMap(({ members }) => [...members])).size;
  return (
    <p className="text-sm">
      <b>{countOf(set.bodies.length, set.bodyNoun)}</b>, each membrane the {set.bodyNoun.many} that
      share a <b>{relation.partner.one}</b>.{" "}
      <span className="text-muted">
        {countOf(table.innovations.length, relation.partner)} recorded, reaching {linked} of the{" "}
        {set.bodyNoun.many}.
      </span>
    </p>
  );
}
