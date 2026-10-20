#!/bin/sh
# Starts the dev server on a freshly seeded database, kept apart from the one used in development.
set -e
state_path=.wrangler/e2e-state
rm -rf "$state_path"
npm run db:migrate -- --persist-to "$state_path"
npm run db:seed -- --persist-to "$state_path"
npx wrangler d1 execute muspeth --local --file=e2e/queryFixture.sql --persist-to "$state_path"
PERSIST_STATE_PATH="$state_path" exec npx vite --port 5180 --strictPort
