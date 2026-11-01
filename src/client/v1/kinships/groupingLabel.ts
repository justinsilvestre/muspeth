import type { KinshipGrouping } from "../../../shared/kinships/kinships";
import { termLabel } from "../termLabel";

/** Names a grouping of organisms in words, such as "descent" or "shared substance". */
export function groupingLabel(grouping: KinshipGrouping) {
  return termLabel(grouping);
}
