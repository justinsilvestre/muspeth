/**
 * Runs the SQL statements in a file against the database file.
 * Usage: node scripts/executeSqlFile.ts db/seed.sql
 */
import { readFileSync } from "node:fs";
import { executeSqlScript } from "./database.ts";

const [sqlPath] = process.argv.slice(2);
if (!sqlPath) throw new Error("Give the path of a SQL file to run.");
executeSqlScript(readFileSync(sqlPath, "utf8"));
