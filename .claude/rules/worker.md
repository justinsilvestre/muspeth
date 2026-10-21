---
paths:
  - "src/worker/**"
  - "src/shared/**"
---

# Worker

- Code here runs in the Cloudflare Workers runtime, not Node. Do not import Node built-ins such as `node:fs`.
- Reach the database only through the `DB` binding on the Hono context or the `env` from `cloudflare:test`. It is a read-only copy of `db/muspeth.sqlite`, held in memory, so never write to it outside tests.
- After changing `wrangler.jsonc`, run `npm run typegen` to regenerate the `Env` type.
- Response shapes shared with the client belong in `src/shared/`, which must stay free of runtime-specific code.
- Tests run inside the Workers runtime. Each test gets a new empty database with every migration applied, so it inserts the data it needs.
