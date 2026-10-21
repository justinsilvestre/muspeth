import { createExecutionContext, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "./index";
import { fakeAssets } from "./test/fakeAssets";
import { insertSampleGraph } from "./test/insertSampleGraph";

async function request(path: string) {
  await insertSampleGraph();
  const assets = fakeAssets(new Response(env.DB.export()));
  const deployedEnv = { ...env, ASSETS: assets };
  return worker.fetch(
    new Request(`https://muspeth.test${path}`),
    deployedEnv,
    createExecutionContext(),
  );
}

describe("the Worker", () => {
  it("answers the API from the database among the assets", async () => {
    const response = await request("/api/nodes");
    const { nodes } = await response.json<{ nodes: unknown[] }>();
    expect(nodes).toHaveLength(2);
  });

  it("keeps the database file from the public", async () => {
    const response = await request("/_data/muspeth.sqlite");
    expect(response.status).toBe(404);
  });
});
