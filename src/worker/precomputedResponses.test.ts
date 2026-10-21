import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { precomputedResponsePaths } from "../shared/precomputedResponsePaths";
import app from "./app";

describe("the responses precomputed at build time", () => {
  for (const [apiPath, filePath] of Object.entries(precomputedResponsePaths)) {
    it(`match the Worker's answer to ${apiPath} byte for byte`, async () => {
      env.DB.exec(env.TEST_SEED);
      const response = await app.request(apiPath, {}, env);
      expect(await response.text()).toBe(env.TEST_PRECOMPUTED_RESPONSES[filePath]);
    });
  }
});
