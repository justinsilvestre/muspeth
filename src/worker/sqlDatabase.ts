import type { Database, SqlValue } from "sql.js";

type SqlBinding = string | number | null;

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
