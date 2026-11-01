import { correlateDistances } from "../../../shared/kinships/correlateDistances";
import { countRelatedPairs } from "../../../shared/kinships/countRelatedPairs";
import {
  type KinshipGrouping,
  type Kinships,
  kinshipGroupings,
} from "../../../shared/kinships/kinships";
import { GroupingName } from "./GroupingName";
import { groupingLabel } from "./groupingLabel";

/** Below this many pairs that share something, a grouping's agreement with others rests on too few pairs to show. */
const minRelatedPairs = 10;

/** Shows, for each pair of groupings, how far they agree about which organisms belong together. */
export function AgreementMatrix({ kinships }: { kinships: Kinships }) {
  const relatedPairs = Object.fromEntries(
    kinshipGroupings.map((grouping) => [grouping, countRelatedPairs(kinships.distances[grouping])]),
  ) as Record<KinshipGrouping, number>;
  const pairCount = (kinships.organisms.length * (kinships.organisms.length - 1)) / 2;
  const isComparable = (grouping: KinshipGrouping) => relatedPairs[grouping] >= minRelatedPairs;
  return (
    <section aria-labelledby="agreement-heading" className="space-y-3">
      <h3 id="agreement-heading" className="font-medium">
        How far the groupings agree
      </h3>
      <p className="max-w-prose text-muted text-sm">
        Each cell compares the distances two groupings give every pair of organisms: 1 means they
        rank every pair alike, 0 that they are unrelated. A dash means one of the two groupings
        finds fewer than {minRelatedPairs} of the {pairCount} pairs sharing anything, too few to
        compare.
      </p>
      <div className="overflow-x-auto">
        <table className="text-sm tabular-nums">
          <thead>
            <tr>
              <td />
              {kinshipGroupings.map((grouping) => (
                <th
                  key={grouping}
                  scope="col"
                  className="px-2 py-1 text-left align-bottom font-normal text-muted"
                >
                  <span className="block w-16 text-xs leading-tight">
                    {groupingLabel(grouping)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kinshipGroupings.map((row) => (
              <tr key={row}>
                <th scope="row" className="whitespace-nowrap py-1 pr-3 text-left font-normal">
                  <GroupingName grouping={row} />
                  <span className="ml-2 text-muted text-xs">{relatedPairs[row]} pairs</span>
                </th>
                {kinshipGroupings.map((column) => (
                  <AgreementCell
                    key={column}
                    agreement={
                      row === column
                        ? 1
                        : isComparable(row) && isComparable(column)
                          ? correlateDistances(kinships.distances[row], kinships.distances[column])
                          : null
                    }
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AgreementCell({ agreement }: { agreement: number | null }) {
  if (agreement === null) return <td className="px-2 py-1 text-center text-muted">–</td>;
  const strength = Math.round(Math.max(agreement, 0) * 60);
  return (
    <td
      className="px-2 py-1 text-center"
      style={{ background: `color-mix(in srgb, var(--color-ink) ${strength}%, transparent)` }}
    >
      <span className={strength > 35 ? "text-page" : undefined}>{agreement.toFixed(2)}</span>
    </td>
  );
}
