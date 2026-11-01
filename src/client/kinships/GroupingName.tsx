import type { KinshipGrouping } from "../../shared/kinships/kinships";
import { KindMark } from "../KindMark";
import { groupingLabel } from "./groupingLabel";

/** Names a grouping, marked with its kind's colour, or in ink for descent. */
export function GroupingName({ grouping }: { grouping: KinshipGrouping }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {grouping === "descent" ? (
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ink" />
      ) : (
        <KindMark kind={grouping} shape="dot" />
      )}
      {groupingLabel(grouping)}
    </span>
  );
}
