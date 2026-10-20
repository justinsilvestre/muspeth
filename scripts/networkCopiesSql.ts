import { quoteSql } from "./quoteSql.ts";

/** A copy of a network whose connections the graph holds under another copy, the canonical one. */
export type NetworkCopy = {
  /** The canonical copy, as its connections' sources identify it, for example "mangal:948". */
  canonicalNetworkId: string;
  /** The collection that holds this copy, for example "mangal", "web-of-life" or "globi". */
  collection: string;
  /** The copy's identifier in its collection, when known, for example "M_PL_056". */
  networkId: string | null;
  url: string | null;
};

/** Writes SQL that replaces the network copies that an earlier run of the same import recorded. */
export function toNetworkCopiesSql(source: string, copies: NetworkCopy[]) {
  const rows = copies.map((copy) => {
    const values = [copy.canonicalNetworkId, copy.collection, copy.networkId, copy.url, source];
    return `(${values.map(quoteSql).join(", ")})`;
  });
  return [
    `DELETE FROM network_copies WHERE source = ${quoteSql(source)};`,
    ...rows.map(
      (row) =>
        `INSERT INTO network_copies (canonical_network_id, collection, network_id, url, source) VALUES ${row};`,
    ),
  ].join("\n");
}
