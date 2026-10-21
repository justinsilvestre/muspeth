import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { loadDatabase } from "./loadDatabase";
import { fakeAssets } from "./test/fakeAssets";
import { insertSampleGraph } from "./test/insertSampleGraph";

describe("loadDatabase", () => {
  it("opens the database file among the assets", async () => {
    await insertSampleGraph();
    const db = await loadDatabase(fakeAssets(new Response(env.DB.export())));
    const { results } = await db.prepare("SELECT id FROM nodes").all();
    expect(results).toHaveLength(2);
  });

  it("fails when the assets hold no database file", async () => {
    const assets = fakeAssets(new Response(null, { status: 404 }));
    await expect(loadDatabase(assets)).rejects.toThrow("HTTP 404");
  });
});
