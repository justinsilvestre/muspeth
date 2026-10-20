---
paths:
  - "src/worker/**"
  - "src/shared/**"
---

# Worker

- Code here runs in the Cloudflare Workers runtime, not Node. Do not import Node built-ins such as `node:fs`.
- Reach the database only through the `DB` binding on the Hono context or the `env` from `cloudflare:test`.
- After changing `wrangler.jsonc`, run `npm run typegen` to regenerate the `Env` type.
- Response shapes shared with the client belong in `src/shared/`, which must stay free of runtime-specific code.
- Tests run inside the Workers runtime. Migrations are applied before each test and all storage is reset after it, so each test inserts the data it needs.
