import { toConnectionImportSql } from "./connectionImportSql.ts";
import { executeSqlScript, queryDatabase } from "./database.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import { quoteSql } from "./quoteSql.ts";

/**
 * Stores an import's nodes and connections under `source`, in place of what its previous run
 * stored.
 */
export function writeConnectionImport(
  source: string,
  nodes: NodeDraft[],
  connections: ConnectionDraft[],
) {
  const previousNodes = queryDatabase<{ id: string }>(
    `SELECT id FROM nodes WHERE source = ${quoteSql(source)}`,
  );
  const previousNodeIds = previousNodes.map(({ id }) => id);
  executeSqlScript(toConnectionImportSql(source, nodes, connections, previousNodeIds));
}
