import type { PlaceAndPeriodQuery } from "../../shared/placeAndPeriodQuery";
import type { DateSummary } from "../../shared/placeAndPeriodSummary";
import { readLatestData, useApiResource } from "../useApiResource";
import { ExplorerHeading } from "./ExplorerHeading";
import { PeriodTimeline } from "./PeriodTimeline";
import { searchAnytime, searchWithin, toDateSummaryParams } from "./placeSearchParams";

type PeriodExplorerTimelineProps = {
  params: URLSearchParams;
  query: PlaceAndPeriodQuery;
  onSearch: (params: URLSearchParams) => void;
};

/** Draws every date on which connections were recorded near the place, and searches any period brushed on it. */
export function PeriodExplorerTimeline({ params, query, onSearch }: PeriodExplorerTimelineProps) {
  const resource = useApiResource<{ dates: DateSummary[] }>(
    `/api/connections/dates?${toDateSummaryParams(params)}`,
  );
  const dates = readLatestData(resource)?.dates;
  return (
    <div className="space-y-1">
      <ExplorerHeading
        title="When"
        clearLabel="Search any time"
        onClear={query.from || query.to ? () => onSearch(searchAnytime(params)) : undefined}
      />
      {dates && dates.length > 0 && (
        <PeriodTimeline
          from={query.from}
          to={query.to}
          dates={dates}
          onPick={(period) => onSearch(searchWithin(params, period))}
        />
      )}
      {dates?.length === 0 && (
        <p className="text-muted text-sm">No dated connections were recorded here.</p>
      )}
      {resource.status === "failed" && (
        <p role="alert" className="text-sm">
          Could not load the dates: {resource.error.message}
        </p>
      )}
    </div>
  );
}
