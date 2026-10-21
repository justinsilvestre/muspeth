import { type Context, Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { parseConnectionFilter } from "../shared/connectionFilter";
import { parsePathQuery } from "../shared/pathQuery";
import {
  parseOptionalPlaceAndPeriodQuery,
  parsePlaceAndPeriodQuery,
} from "../shared/placeAndPeriodQuery";
import type { QueryParseResult } from "../shared/queryParameters";
import { exportGraph, listConnectionSourceNames } from "./graphExportQueries";
import { findNode, listConnectionMedia, listConnections, listNodes } from "./graphQueries";
import { findPathsBetween } from "./pathQueries";
import { listConnectionsByPlaceAndPeriod } from "./placeQueries";
import { listDateSummaries, listPlaceSummaries } from "./placeSummaryQueries";
import type { SqlDatabase } from "./sqlDatabase";
import { listPlacedOrganismMedia, listTaxa, listTaxonPlacements } from "./taxonomyQueries";

type AppEnv = { Bindings: { DB: SqlDatabase } };
type AppContext = Context<AppEnv>;

/** Lets browsers reuse a successful answer for an hour, since the data changes only on deploy. */
const cacheData = createMiddleware(async (context, next) => {
  await next();
  if (context.res.ok) context.header("Cache-Control", "public, max-age=3600");
});

const app = new Hono<AppEnv>()
  .basePath("/api")
  .get("/health", (context) => context.json({ ok: true }))
  // Registered after the health check, so that it applies to every other route.
  .use(cacheData)
  .get("/nodes", async (context) => context.json({ nodes: await listNodes(context.env.DB) }))
  .get("/nodes/:id/connections", async (context) => {
    const nodeId = context.req.param("id");
    const filter = parseConnectionFilter(searchParamsOf(context));
    if (!filter.ok) return badRequest(context, filter);
    if (!(await findNode(context.env.DB, nodeId))) return notFound(context, "Node not found");
    const [connections, media] = await Promise.all([
      listConnections(context.env.DB, nodeId, filter.value),
      listConnectionMedia(context.env.DB, nodeId, filter.value),
    ]);
    return context.json({ connections, media });
  })
  .get("/connections", async (context) => {
    const query = parsePlaceAndPeriodQuery(searchParamsOf(context));
    if (!query.ok) return badRequest(context, query);
    return context.json({
      connections: await listConnectionsByPlaceAndPeriod(context.env.DB, query.value),
    });
  })
  .get("/connections/places", async (context) => {
    const query = parseOptionalPlaceAndPeriodQuery(searchParamsOf(context));
    if (!query.ok) return badRequest(context, query);
    return context.json({ places: await listPlaceSummaries(context.env.DB, query.value) });
  })
  .get("/connections/dates", async (context) => {
    const query = parseOptionalPlaceAndPeriodQuery(searchParamsOf(context));
    if (!query.ok) return badRequest(context, query);
    return context.json({ dates: await listDateSummaries(context.env.DB, query.value) });
  })
  .get("/paths", async (context) => {
    const query = parsePathQuery(searchParamsOf(context));
    if (!query.ok) return badRequest(context, query);
    const ends = [query.value.fromId, query.value.toId];
    const nodes = await Promise.all(ends.map((id) => findNode(context.env.DB, id)));
    if (nodes.includes(null)) return notFound(context, "Node not found");
    return context.json(await findPathsBetween(context.env.DB, query.value));
  })
  .get("/graph", async (context) => {
    const filter = parseConnectionFilter(searchParamsOf(context));
    if (!filter.ok) return badRequest(context, filter);
    return context.json(await exportGraph(context.env.DB, filter.value));
  })
  .get("/sources", async (context) =>
    context.json({ sources: await listConnectionSourceNames(context.env.DB) }),
  )
  .get("/taxonomy", async (context) => {
    const [taxa, placements, media] = await Promise.all([
      listTaxa(context.env.DB),
      listTaxonPlacements(context.env.DB),
      listPlacedOrganismMedia(context.env.DB),
    ]);
    return context.json({ taxa, placements, media });
  })
  .onError((error, context) => {
    console.error(error);
    return context.text("Internal Server Error", 500);
  });

function searchParamsOf(context: AppContext) {
  return new URL(context.req.url).searchParams;
}

function badRequest(
  context: AppContext,
  result: Extract<QueryParseResult<unknown>, { ok: false }>,
) {
  return context.json({ error: result.error }, 400);
}

function notFound(context: AppContext, error: string) {
  return context.json({ error }, 404);
}

export type App = typeof app;

export default app;
