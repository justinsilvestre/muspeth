import { toConnectionImportSql } from "./connectionImportSql.ts";
import { executeD1Script, queryD1 } from "./d1.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import { quoteSql } from "./quoteSql.ts";

/**
 * Stores an import's nodes and connections under `source`, in place of what its previous run
 * stored, in the database chosen by the `--remote` flag.
 */
export function writeConnectionImport(
  source: string,
  nodes: NodeDraft[],
  connections: ConnectionDraft[],
) {
  const previousNodes = queryD1<{ id: string }>(
    `SELECT id FROM nodes WHERE source = ${quoteSql(source)}`,
  );
  const previousNodeIds = previousNodes.map(({ id }) => id);
  executeD1Script(toConnectionImportSql(source, nodes, connections, previousNodeIds));
}
