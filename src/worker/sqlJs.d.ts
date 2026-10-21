declare module "sql.js/dist/sql-wasm-browser.js" {
  import initSqlJs from "sql.js";
  export default initSqlJs;
  export type { Database, SqlJsStatic, SqlValue } from "sql.js";
}
