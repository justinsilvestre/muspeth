---
paths:
  - "db/**"
---

# Database

- Never edit a migration that has been committed, since it may already be applied to `db/muspeth.sqlite`. Add a new numbered file in `db/migrations/` instead.
- After adding a migration, run `npm run db:migrate` and commit the updated `db/muspeth.sqlite` with it. A test fails while the file lacks a migration.
- Keep `db/seed.sql` valid against the latest schema.
- `db/seed.sql` holds a hand-entered sample only. Real data comes from reproducible import scripts, as the connection graph plan requires.
