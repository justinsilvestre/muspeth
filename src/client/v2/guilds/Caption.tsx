import type { InnovationTable } from "../glottometry/parseInnovationsCsv";
import { aOrAn, type BodySet, countOf } from "./BodySet";
import type { Relation } from "./relations";

type CaptionProps = { set: BodySet; relation: Relation; table: InnovationTable };

/** Says in plain words what the dots and the membranes are, and how much of the set the relation reaches. */
export function Caption({ set, relation, table }: CaptionProps) {
  const total = set.bodies.length;
  const reached = new Set(table.innovations.flatMap(({ members }) => [...members])).size;
  return (
    <p className="text-sm">
      Each dot is {aOrAn(set.bodyNoun.one)}. Each membrane wraps the {set.bodyNoun.many}{" "}
      {relation.membrane}.{" "}
      <span className="text-muted">
        {countOf(table.innovations.length, relation.shared)} recorded;{" "}
        {reached === total
          ? `every ${set.bodyNoun.one} ${relation.reach.one}`
          : `${reached} of the ${countOf(total, set.bodyNoun)} ${reached === 1 ? relation.reach.one : relation.reach.many}`}
        .
      </span>
    </p>
  );
}
