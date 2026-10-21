import { type Context, Hono } from "hono";
import { parseConnectionFilter } from "../shared/connectionFilter";
import { parsePathQuery } from "../shared/pathQuery";
import { parsePlaceAndPeriodQuery } from "../shared/placeAndPeriodQuery";
import type { QueryParseResult } from "../shared/queryParameters";
import { isDailyLimitError, secondsUntilLimitReset } from "./dailyLimitError";
import { exportGraph, listConnectionSourceNames } from "./graphExportQueries";
import { findNode, listConnections, listNodes } from "./graphQueries";
import { findPathsBetween } from "./pathQueries";
import { listConnectionsByPlaceAndPeriod } from "./placeQueries";
import { listTaxa, listTaxonPlacements } from "./taxonomyQueries";

type AppContext = Context<{ Bindings: Env }>;

const dailyLimitMessage =
  "The database has reached its daily usage limit. Please try again after midnight UTC.";

const app = new Hono<{ Bindings: Env }>()
  .basePath("/api")
  .get("/health", (context) => context.json({ ok: true }))
  .get("/nodes", async (context) => context.json({ nodes: await listNodes(context.env.DB) }))
  .get("/nodes/:id/connections", async (context) => {
    const nodeId = context.req.param("id");
    const filter = parseConnectionFilter(searchParamsOf(context));
    if (!filter.ok) return badRequest(context, filter);
    if (!(await findNode(context.env.DB, nodeId))) return notFound(context, "Node not found");
    return context.json({
      connections: await listConnections(context.env.DB, nodeId, filter.value),
    });
  })
  .get("/connections", async (context) => {
    const query = parsePlaceAndPeriodQuery(searchParamsOf(context));
    if (!query.ok) return badRequest(context, query);
    return context.json({
      connections: await listConnectionsByPlaceAndPeriod(context.env.DB, query.value),
    });
  })
  .get("/paths", async (context) => {
    const query = parsePathQuery(searchParamsOf(context));
    if (!query.ok) return badRequest(context, query);
    const ends = [query.value.fromId, query.value.toId];
    const nodes = await Promise.all(ends.map((id) => findNode(context.env.DB, id)));
    if (nodes.includes(null)) return notFound(context, "Node not found");
    return context.json({ paths: await findPathsBetween(context.env.DB, query.value) });
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
    const [taxa, placements] = await Promise.all([
      listTaxa(context.env.DB),
      listTaxonPlacements(context.env.DB),
    ]);
    return context.json({ taxa, placements });
  })
  .onError((error, context) => {
    console.error(error);
    if (!isDailyLimitError(error)) return context.text("Internal Server Error", 500);
    context.header("Retry-After", String(secondsUntilLimitReset(new Date())));
    return context.json({ error: dailyLimitMessage }, 503);
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
