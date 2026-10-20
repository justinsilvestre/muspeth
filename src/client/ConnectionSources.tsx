import type { Connection, ConnectionSource } from "../shared/graph";
import { CitationText } from "./CitationText";
import { ExternalLink } from "./ExternalLink";
import { groupSourcesByDataset } from "./groupSourcesByDataset";
import { sourceDisplayName } from "./sourceDisplayName";
import { splitCitationLinks } from "./splitCitationLinks";

type ConnectionSourcesProps = {
  connection: Connection;
};

/** Lists the studies behind a connection, under the datasets that published them. */
export function ConnectionSources({ connection }: ConnectionSourcesProps) {
  return (
    <details className="mt-1 text-sm">
      <summary className="cursor-pointer text-muted">Sources</summary>
      <p className="mt-1">From {sourceDisplayName(connection.source)}</p>
      <ul className="mt-1 space-y-2">
        {groupSourcesByDataset(connection.sources).map((group) => {
          const datasetCitation = group.datasetCitation ?? group.datasetId;
          return (
            <li key={group.datasetId ?? group.datasetCitation ?? ""} className="break-words">
              {datasetCitation && (
                <p className="text-muted">
                  Dataset: <CitationText citation={datasetCitation} />
                </p>
              )}
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {group.studies.map((study) => (
                  <StudyItem key={`${study.studyCitation} ${study.studyUrl}`} study={study} />
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

type StudyItemProps = {
  study: ConnectionSource;
};

function StudyItem({ study }: StudyItemProps) {
  const citation = study.studyCitation ?? "Unnamed study";
  const isLinkedInCitation = splitCitationLinks(citation).some(
    ({ href }) => href === study.studyUrl,
  );
  return (
    <li>
      <CitationText citation={citation} />
      {study.studyUrl && !isLinkedInCitation && (
        <>
          {" · "}
          <ExternalLink href={study.studyUrl}>View study</ExternalLink>
        </>
      )}
      {study.recordCount !== null &&
        ` · ${study.recordCount} ${study.recordCount === 1 ? "record" : "records"}`}
    </li>
  );
}
