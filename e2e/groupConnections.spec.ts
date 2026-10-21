import { expect, test } from "@playwright/test";

const honeyBeePath = `/organisms/${encodeURIComponent("wikidata:Q30034")}`;

test.describe("grouping a node's connections", () => {
  test("heads each kind with its count", async ({ page }) => {
    await page.goto(honeyBeePath);
    const connections = page.getByRole("region", { name: "Connections of western honey bee" });
    await expect(connections.locator("summary").filter({ hasText: " · " })).toHaveText([
      "Interaction · 1",
      "Likeness · 1",
      "Shared place and sound · 1",
    ]);
  });

  test("counts all of the node's connections", async ({ page }) => {
    await page.goto(honeyBeePath);
    const connections = page.getByRole("region", { name: "Connections of western honey bee" });
    await expect(connections.getByText(/^\d+ connections$/)).toHaveText("3 connections");
  });
});
