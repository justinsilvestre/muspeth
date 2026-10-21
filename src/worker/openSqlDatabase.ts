import initSqlJs, { type SqlJsStatic } from "sql.js/dist/sql-wasm-browser.js";
import sqlJsWasm from "sql.js/dist/sql-wasm-browser.wasm";
import { SqlDatabase } from "./sqlDatabase";

let sqlJs: Promise<SqlJsStatic> | undefined;

/** Opens a SQLite database in memory, from the contents of a database file or else empty. */
export async function openSqlDatabase(bytes?: Uint8Array) {
  sqlJs ??= loadSqlJs();
  const { Database } = await sqlJs;
  return new SqlDatabase(new Database(bytes));
}

// Emscripten takes any runtime that defines WorkerGlobalScope for a browser's Web Worker,
// and reads the URL of its script while sql.js initializes. A Cloudflare Worker has no such URL,
// so a placeholder stands in for it during that call only.
function loadSqlJs() {
  if ("location" in globalThis) return initSqlJs({ instantiateWasm });
  const placeholder = { href: "https://worker.invalid/" };
  Object.defineProperty(globalThis, "location", { value: placeholder, configurable: true });
  try {
    return initSqlJs({ instantiateWasm });
  } finally {
    Reflect.deleteProperty(globalThis, "location");
  }
}

// Workers may not compile WebAssembly at runtime, so sql.js receives the module compiled at deploy.
function instantiateWasm(
  imports: WebAssembly.Imports,
  receiveInstance: (instance: WebAssembly.Instance) => void,
) {
  WebAssembly.instantiate(sqlJsWasm, imports).then(receiveInstance);
  return {};
}
