import { executeD1Script } from "./d1.ts";
import { type NodeMediaLink, toNodeMediaSql } from "./nodeMediaSql.ts";

/**
 * Links media to nodes already in the database under `source`, in place of what the previous run
 * of the same import linked, in the database chosen by the `--remote` flag.
 */
export function writeNodeMedia(source: string, links: NodeMediaLink[]) {
  executeD1Script(toNodeMediaSql(source, links));
}
