import initSqlJs, {
  type Database,
  type SqlJsStatic,
  type SqlValue,
} from "sql.js/dist/sql-wasm-browser.js";
import sqlJsWasm from "sql.js/dist/sql-wasm-browser.wasm";

type SqlBinding = string | number | null;

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

/** A SQLite database held in memory, queried through the part of D1's interface that the API uses. */
export class SqlDatabase {
  readonly #database: Database;

  constructor(database: Database) {
    this.#database = database;
  }

  prepare(sql: string) {
    return new SqlStatement(this.#database, sql, []);
  }

  async batch(statements: SqlStatement[]) {
    for (const statement of statements) await statement.run();
  }

  exec(sql: string) {
    this.#database.exec(sql);
  }

  export() {
    return this.#database.export();
  }
}

class SqlStatement {
  readonly #database: Database;
  readonly #sql: string;
  readonly #bindings: SqlBinding[];

  constructor(database: Database, sql: string, bindings: SqlBinding[]) {
    this.#database = database;
    this.#sql = sql;
    this.#bindings = bindings;
  }

  bind(...bindings: SqlBinding[]) {
    return new SqlStatement(this.#database, this.#sql, bindings);
  }

  async all<Row>() {
    return { results: this.#readRows() as Row[] };
  }

  async first<Row>() {
    return (this.#readRows()[0] as Row | undefined) ?? null;
  }

  async run() {
    this.#database.run(this.#sql, this.#bindings);
  }

  #readRows() {
    const statement = this.#database.prepare(this.#sql, this.#bindings);
    try {
      const columns = statement.getColumnNames();
      const rows = [];
      while (statement.step()) rows.push(toRow(columns, statement.get()));
      return rows;
    } finally {
      statement.free();
    }
  }
}

function toRow(columns: string[], values: SqlValue[]) {
  const row: Record<string, SqlValue> = {};
  for (let index = 0; index < columns.length; index++)
    row[columns[index] as string] = values[index] ?? null;
  return row;
}
