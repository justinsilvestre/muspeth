import { executeSqlScript } from "./database.ts";
import { type NodeMediaLink, toNodeMediaSql } from "./nodeMediaSql.ts";

/**
 * Links media to nodes already in the database under `source`, in place of what the previous run
 * of the same import linked.
 */
export function writeNodeMedia(source: string, links: NodeMediaLink[]) {
  executeSqlScript(toNodeMediaSql(source, links));
}
