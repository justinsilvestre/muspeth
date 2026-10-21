import type { ConnectionFilter } from "../../shared/connectionFilter";
import { type QualityFlag, qualityFlags } from "../../shared/qualityFlags";
import { termLabel } from "../termLabel";
import {
  chooseQualityFlag,
  type QualityFlagChoice,
  qualityFlagChoiceOf,
  qualityFlagChoices,
} from "./qualityFlagChoice";

type QualityFlagChoicesProps = {
  filter: ConnectionFilter;
  onChange: (filter: ConnectionFilter) => void;
};

/** Lets the reader show, show only, or hide the connections that carry each quality flag. */
export function QualityFlagChoices({ filter, onChange }: QualityFlagChoicesProps) {
  const choose = (flag: QualityFlag, choice: string) =>
    onChange(chooseQualityFlag(filter, flag, choice as QualityFlagChoice));

  return (
    <fieldset>
      <legend className="mb-1 font-medium">Quality flags</legend>
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
        {(Object.entries(qualityFlags) as [QualityFlag, string][]).map(([flag, meaning]) => (
          <label key={flag} className="contents">
            <span title={meaning}>{termLabel(flag)}</span>
            <select
              className="rounded border border-line bg-page px-1 py-0.5"
              value={qualityFlagChoiceOf(filter, flag)}
              onChange={(event) => choose(flag, event.target.value)}
            >
              {qualityFlagChoices.map((choice) => (
                <option key={choice} value={choice}>
                  {choice}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
