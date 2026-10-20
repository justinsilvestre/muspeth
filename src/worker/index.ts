import { Hono } from "hono";
import { findNode, listConnections, listNodes } from "./graphQueries";
import { listTaxa, listTaxonPlacements } from "./taxonomyQueries";

const app = new Hono<{ Bindings: Env }>()
  .basePath("/api")
  .get("/health", (context) => context.json({ ok: true }))
  .get("/nodes", async (context) => context.json({ nodes: await listNodes(context.env.DB) }))
  .get("/nodes/:id/connections", async (context) => {
    const nodeId = context.req.param("id");
    if (!(await findNode(context.env.DB, nodeId))) {
      return context.json({ error: "Node not found" }, 404);
    }
    return context.json({ connections: await listConnections(context.env.DB, nodeId) });
  })
  .get("/taxonomy", async (context) => {
    const [taxa, placements] = await Promise.all([
      listTaxa(context.env.DB),
      listTaxonPlacements(context.env.DB),
    ]);
    return context.json({ taxa, placements });
  });

export type App = typeof app;

export default app;
