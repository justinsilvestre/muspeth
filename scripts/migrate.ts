/**
 * Applies the migrations in `db/migrations` that the database file does not have yet.
 * Usage: npm run db:migrate
 */
import { databasePath, openDatabase } from "./database.ts";
import { migrateDatabase, readMigrations } from "./migrateDatabase.ts";

const applied = migrateDatabase(openDatabase(), readMigrations());
console.log(`Applied ${applied.length} migrations to ${databasePath}.`);
