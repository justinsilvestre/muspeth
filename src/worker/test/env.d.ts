import type { SqlDatabase } from "../sqlDatabase";

declare global {
  namespace Cloudflare {
    interface Env {
      /** The contents of each migration file, in order. */
      TEST_MIGRATIONS: string[];
      /** An empty database with every migration applied, replaced before each test. */
      DB: SqlDatabase;
    }
  }
}
