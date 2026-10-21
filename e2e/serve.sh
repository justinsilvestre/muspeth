#!/bin/sh
# Starts the dev server on a freshly seeded database, kept apart from the one used in development.
set -e
export DATABASE_PATH="$PWD/e2e/database.local.sqlite"
rm -f "$DATABASE_PATH"
npm run db:migrate
npm run db:seed
node scripts/executeSqlFile.ts e2e/queryFixture.sql
exec npx vite --port 5180 --strictPort
