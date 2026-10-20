import type { ConnectionFilter } from "../../shared/connectionFilter";
import type { QualityFlag } from "../../shared/qualityFlags";

/** Whether a filter shows connections with a flag alongside others, shows only those, or hides them. */
export type QualityFlagChoice = "show" | "only" | "hide";

export const qualityFlagChoices = ["show", "only", "hide"] as const satisfies QualityFlagChoice[];

export function qualityFlagChoiceOf(filter: ConnectionFilter, flag: QualityFlag) {
  if (filter.flaggedWith.includes(flag)) return "only";
  if (filter.notFlaggedWith.includes(flag)) return "hide";
  return "show";
}

/** Returns a copy of the filter with the given choice made for one flag. */
export function chooseQualityFlag(
  filter: ConnectionFilter,
  flag: QualityFlag,
  choice: QualityFlagChoice,
) {
  const without = (flags: QualityFlag[]) => flags.filter((candidate) => candidate !== flag);
  const flaggedWith = without(filter.flaggedWith);
  const notFlaggedWith = without(filter.notFlaggedWith);
  return {
    ...filter,
    flaggedWith: choice === "only" ? [...flaggedWith, flag] : flaggedWith,
    notFlaggedWith: choice === "hide" ? [...notFlaggedWith, flag] : notFlaggedWith,
  } satisfies ConnectionFilter;
}
