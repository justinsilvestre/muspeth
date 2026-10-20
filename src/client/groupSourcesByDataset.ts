import type { ConnectionSource } from "../shared/graph";

/** Groups the studies behind a connection by the dataset that published them, largest first. */
export function groupSourcesByDataset(sources: ConnectionSource[]) {
  const groups = Map.groupBy(sources, (source) => source.datasetId ?? source.datasetCitation);
  return [...groups.values()]
    .map((studies) => ({
      datasetId: studies[0]?.datasetId ?? null,
      datasetCitation: studies[0]?.datasetCitation ?? null,
      studies,
    }))
    .sort((a, b) => countRecords(b.studies) - countRecords(a.studies));
}

function countRecords(studies: ConnectionSource[]) {
  return studies.reduce((total, study) => total + (study.recordCount ?? 0), 0);
}
