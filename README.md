# Multispecies ethnography

An experiment in exploring connections between organisms and the things around them.

## Repository structure

| Path | Contents |
|---|---|
| `src/client/` | React frontend, styled with Tailwind |
| `src/worker/` | Cloudflare Worker: a Hono API under `/api`, which also serves the frontend |
| `src/shared/` | Types shared by the frontend and the API |
| `db/migrations/` | D1 (SQLite) schema migrations |
| `db/seed.sql` | A small hand-entered sample of the matsutake system |
| `scripts/` | Reproducible imports from public data sources into the database |
| `e2e/` | Playwright end-to-end tests |
| `docs/` | Product documentation and research notes |

## Setup

Install Node 24.22.0, the version pinned in `package.json`, then:

```bash
npm install
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

The last two commands create and fill a local database under `.wrangler/`. Run `db:seed` only once, since it fails on a database that already holds the sample.

## Importing data

Two scripts grow the database from public sources. Run them in this order, since the second places every organism the first adds:

```bash
npm run db:import-interactions
```

```bash
npm run db:import-taxa
```

| Command | Does |
|---|---|
| `npm run db:import-interactions` | Adds the organisms that the sample's organisms interact with, those interactions, and the studies that report each one, from [GloBI](https://www.globalbioticinteractions.org). It keeps at most 60 partners per organism. |
| `npm run db:import-taxa` | Places every organism in the [GBIF backbone taxonomy](https://doi.org/10.15468/39omei). |

Both scripts write to the local database, or to the deployed one when given `-- --remote`. Each can be re-run: it updates what its previous run wrote instead of duplicating it.

## Development

```bash
npm run dev
```

This serves the app at http://localhost:5173, with the API running in the local Workers runtime.

| Command | Does |
|---|---|
| `npm run lint` | Lints and checks formatting with Biome |
| `npm run lint:fix` | Applies Biome's fixes and formatting |
| `npm run typecheck` | Type-checks the client, Worker and config projects |
| `npm test` | Runs unit tests, with Worker tests inside the Workers runtime |
| `npm run test:e2e` | Runs Playwright tests against a separately seeded dev server |

A pre-commit hook formats and lints staged files. In VS Code, install the recommended Biome extension to format on save.

Playwright's WebKit build no longer runs on macOS 14. On that system, run only the Chromium tests locally with `npm run test:e2e -- --project=chromium`. CI runs all browsers.

## Deployment

The app runs on Cloudflare's free tier: one Worker serves the frontend and the API, and the data lives in a D1 database.

### First deployment

1. Create a free account at https://dash.cloudflare.com/sign-up.
2. Log in from the terminal: `npx wrangler login`.
3. Create the database: `npx wrangler d1 create muspeth`.
4. Copy the printed `database_id` into `wrangler.jsonc`, then run `npm run typegen`.
5. Deploy: `npm run deploy`.
6. Seed the deployed database: `npx wrangler d1 execute muspeth --remote --file=db/seed.sql`.
7. Import data into it: `npm run db:import-interactions -- --remote`, then `npm run db:import-taxa -- --remote`.

The app is then live at `https://muspeth.<your-subdomain>.workers.dev`.

### Releases

Every push to `main` deploys automatically once CI passes. To enable this, add two repository secrets on GitHub:
- `CLOUDFLARE_ACCOUNT_ID`, shown on the Workers overview page of the Cloudflare dashboard;
- `CLOUDFLARE_API_TOKEN`, created from the "Edit Cloudflare Workers" template with the **Account › D1 › Edit** permission added.

Without these secrets, the deploy job is skipped.

### Monitoring

Worker logs and errors appear under **Workers & Pages › muspeth › Observability** in the Cloudflare dashboard.
