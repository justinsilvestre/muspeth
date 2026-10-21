# Multispecies ethnography

An experiment in exploring connections between organisms and the things around them.

## Repository structure

| Path | Contents |
|---|---|
| `src/client/` | React frontend, styled with Tailwind |
| `src/worker/` | Cloudflare Worker: a Hono API under `/api`, which also serves the frontend |
| `src/shared/` | Types and pure logic shared by the frontend and the API, including the path search |
| `db/migrations/` | D1 (SQLite) schema migrations |
| `db/seed.sql` | A small hand-entered sample: the matsutake system and the honey bee |
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

Six scripts grow the database from public sources. Run them all, in order, with:

```bash
npm run db:import-all
```

The order matters: GloBI starts from the sample's organisms, the next imports work on the organisms already present, and the taxa import runs last so that it places every organism the others add.

| Command | Does |
|---|---|
| `npm run db:import-interactions` | Adds the organisms that the sample's organisms interact with, those interactions, and the studies that report each one, from [GloBI](https://www.globalbioticinteractions.org). It keeps at most 60 partners per organism. |
| `npm run db:import-networks` | Adds whole plant–pollinator networks from [Mangal](https://mangal.io) that contain a sample organism, plus Makoto Kato's two Japanese surveys. It takes at most 30 networks and 4,000 links, preferring small per-site networks, and records other copies of each network in `network_copies`. |
| `npm run db:import-likeness` | Links each bird, mammal and fungus in the graph to its nearest neighbours by diet and body mass ([EltonTraits 1.0](https://doi.org/10.1890/13-1917.1)) or by lifestyle ([FungalTraits](https://doi.org/10.1007/s13225-020-00466-2)). It keeps at most five neighbours per organism, adding those not yet in the graph. |
| `npm run db:import-substances-culture` | Adds, from [Wikidata](https://www.wikidata.org), the compounds found in organisms (at most 15 shared and 5 unshared per organism, with the studies that report them) and the products organisms are a source of. Adds artworks that depict organisms from the [Met](https://metmuseum.github.io) and the [Cleveland Museum of Art](https://openaccess-api.clevelandart.org), at most 10 per organism per museum. Pass `-- --only=wikidata,met,cleveland` to run some sources; the Met's firewall slows fast clients, so its part is slow. |
| `npm run db:import-words-motifs` | Adds vernacular names from the [GBIF backbone](https://doi.org/10.15468/39omei) and the words those names share, words and their loanword sources from the [World Loanword Database](https://wold.clld.org), and motifs that name organisms from [Thompson's Motif-Index](https://doi.org/10.17605/OSF.IO/XEB67). |
| `npm run db:import-taxa` | Places every organism in the [GBIF backbone taxonomy](https://doi.org/10.15468/39omei). |

Each script writes to the local database, or to the deployed one when given `-- --remote`; `db:import-all` writes only to the local one. Each can be re-run: it replaces what its previous run wrote instead of duplicating it. Each node records the import that added it in `nodes.source`, and hand-entered nodes belong to `sample`. Re-running an import removes only the nodes that no other import or the sample still uses. Matches by text, links pushed down from a coarser taxonomic group, and other doubtful records are kept and carry quality flags (`src/shared/qualityFlags.ts`).

A new import builds `NodeDraft`s and `ConnectionDraft`s (`scripts/graphDrafts.ts`) and stores them with `writeConnectionImport` (`scripts/writeConnectionImport.ts`), under its own source key.

## Development

```bash
npm run dev
```

This serves the app at http://localhost:5173, with the API running in the local Workers runtime.

The API's query endpoints are `GET /api/nodes/:id/connections`, `GET /api/paths?from=&to=`, `GET /api/connections?near=lat,lon&radiusKm=&from=&to=` and `GET /api/graph`. Each takes the repeatable filter parameters `kind`, `basis`, `source`, `flaggedWith` and `notFlaggedWith`. `src/shared/findPaths.ts` ranks paths without a server, for example over the output of `/api/graph`.

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
7. Import data into it by running each import in the order of `db:import-all`, adding `-- --remote` to each.

The app is then live at `https://muspeth.<your-subdomain>.workers.dev`.

### Releases

Every push to `main` deploys automatically once CI passes. To enable this, add two repository secrets on GitHub:
- `CLOUDFLARE_ACCOUNT_ID`, shown on the Workers overview page of the Cloudflare dashboard;
- `CLOUDFLARE_API_TOKEN`, created from the "Edit Cloudflare Workers" template with the **Account › D1 › Edit** permission added.

Without these secrets, the deploy job is skipped.

### Monitoring

Worker logs and errors appear under **Workers & Pages › muspeth › Observability** in the Cloudflare dashboard.
