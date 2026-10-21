/// <reference lib="dom" />
import { expect, type Locator, test } from "@playwright/test";

const matsutakePath = `/organisms/${encodeURIComponent("wikidata:Q509308")}`;

/** Returns how far below the top of the screen the scrolling column around an element ends. */
function measureColumnBottom(element: Locator) {
  return element.evaluate((node) => node.parentElement?.getBoundingClientRect().bottom ?? 0);
}

test.describe("on a wide screen", () => {
  test.use({ viewport: { width: 1100, height: 500 } });

  test("fits the node search within the screen", async ({ page }) => {
    await page.goto(matsutakePath);
    const search = page.getByRole("region", { name: "Nodes" });
    expect(await measureColumnBottom(search)).toBeLessThanOrEqual(500);
  });

  test("fits a node's connections within the screen", async ({ page }) => {
    await page.goto(matsutakePath);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    expect(await measureColumnBottom(connections)).toBeLessThanOrEqual(500);
  });

  test("shows a node's connections from their start after going back", async ({ page }) => {
    // A short screen lets the few connections of the test nodes scroll.
    await page.setViewportSize({ width: 1100, height: 250 });
    await page.goto(matsutakePath);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await connections.getByRole("link", { name: "matsu" }).click();
    const neighbours = page.getByRole("region", { name: "Connections of matsu", exact: true });
    await neighbours.evaluate((region) => region.parentElement?.scrollTo({ top: 10_000 }));
    await page.goBack();
    await expect(page.getByRole("heading", { name: "Connections of matsutake" })).toBeInViewport();
  });
});
