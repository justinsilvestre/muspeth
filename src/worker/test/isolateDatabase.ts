import { env } from "cloudflare:test";
import { beforeEach } from "vitest";
import { openSqlDatabase } from "../openSqlDatabase";

beforeEach(async () => {
  env.DB = await openSqlDatabase();
  for (const migration of env.TEST_MIGRATIONS) env.DB.exec(migration);
});
