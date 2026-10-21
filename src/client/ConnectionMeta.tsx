import type { ConnectionBasis, ConnectionKind } from "../shared/graph";
import { type QualityFlag, qualityFlags } from "../shared/qualityFlags";
import { ExternalLink } from "./ExternalLink";
import { licenceLabel, licenceLink } from "./licenceLabel";
import { sourceDisplayName } from "./sourceDisplayName";
import { termLabel } from "./termLabel";

export type ConnectionMetaProps = {
  /** The kind of connection, left out where a heading already names it. */
  kind?: ConnectionKind;
  basis: ConnectionBasis;
  source: string;
  licence: string;
  qualityFlags: QualityFlag[];
};

/** States how a connection is known, where it comes from, under what licence, and what doubts it carries. */
export function ConnectionMeta({
  kind,
  basis,
  source,
  licence,
  qualityFlags: flags,
}: ConnectionMetaProps) {
  return (
    <p className="text-muted text-sm">
      {kind && `${termLabel(kind)} · `}
      {basis} · {sourceDisplayName(source)} · <Licence licence={licence} />
      {flags.length > 0 && (
        <>
          {" · flagged: "}
          {flags.map((flag, index) => (
            <span key={flag}>
              {index > 0 && ", "}
              {termLabel(flag)}
              <span className="sr-only"> ({qualityFlags[flag]})</span>
            </span>
          ))}
        </>
      )}
    </p>
  );
}

function Licence({ licence }: { licence: string }) {
  const link = licenceLink(licence);
  return (
    <span className="whitespace-nowrap">
      {link ? (
        <ExternalLink href={link}>{licenceLabel(licence)}</ExternalLink>
      ) : (
        licenceLabel(licence)
      )}
    </span>
  );
}
