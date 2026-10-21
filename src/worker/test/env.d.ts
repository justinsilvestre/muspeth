import type { SqlDatabase } from "../sqlDatabase";

declare global {
  namespace Cloudflare {
    interface Env {
      /** The contents of each migration file, in order. */
      TEST_MIGRATIONS: string[];
      /** The SQL of the sample data in `db/seed.sql`. */
      TEST_SEED: string;
      /** The responses the build precomputes from the sample data, by the path of each static file. */
      TEST_PRECOMPUTED_RESPONSES: Record<string, string>;
      /** An empty database with every migration applied, replaced before each test. */
      DB: SqlDatabase;
    }
  }
}
