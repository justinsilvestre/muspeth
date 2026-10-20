---
paths:
  - "db/**"
---

# Database

- Never edit a migration that has been committed, since it may already be applied to the deployed database. Add a new numbered file in `db/migrations/` instead.
- Keep `db/seed.sql` valid against the latest schema.
- `db/seed.sql` holds a hand-entered sample only. Real data comes from reproducible import scripts, as the connection graph plan requires.
