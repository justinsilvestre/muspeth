import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const location = process.argv.includes("--remote") ? "--remote" : "--local";

/** Runs a query against the database chosen by the `--remote` flag and returns its rows. */
export function queryD1<Row>(sql: string) {
  const output = runWrangler(["--json", "--command", sql]);
  const [{ results }] = JSON.parse(output) as [{ results: Row[] }];
  return results;
}

/** Runs a script of SQL statements against the database chosen by the `--remote` flag. */
export function executeD1Script(sql: string) {
  const sqlPath = path.join(mkdtempSync(path.join(tmpdir(), "muspeth-import-")), "import.sql");
  writeFileSync(sqlPath, sql);
  runWrangler([`--file=${sqlPath}`]);
}

function runWrangler(args: string[]) {
  return execFileSync("wrangler", ["d1", "execute", "muspeth", location, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}
