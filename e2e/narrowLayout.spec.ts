/// <reference lib="dom" />
import { expect, type Page, test } from "@playwright/test";

const matsutakePath = `/organisms/${encodeURIComponent("wikidata:Q509308")}`;

function measurePageWidth(page: Page) {
  return page.evaluate<number>("document.documentElement.scrollWidth");
}

test.describe("on a narrow screen", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows an organism's connections before the node search", async ({ page }) => {
    await page.goto(matsutakePath);
    const connectionsHeading = page.getByRole("heading", { name: "Connections of matsutake" });
    await expect(connectionsHeading).toBeInViewport();
  });

  test("fits the node search's matches within the screen's width", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search nodes" }).fill("pentaoxa");
    await expect(page.getByRole("link", { name: /pentaoxaoctacyclo/ })).toBeVisible();
    expect(await measurePageWidth(page)).toBeLessThanOrEqual(375);
  });

  test("fits the path pickers within the screen's width", async ({ page }) => {
    await page.goto(`/paths?from=${encodeURIComponent("e2e:octacycle")}`);
    await page.getByRole("combobox", { name: "To" }).fill("pentaoxa");
    await expect(page.getByRole("option", { name: /pentaoxaoctacyclo/ })).toBeVisible();
    expect(await measurePageWidth(page)).toBeLessThanOrEqual(375);
  });
});
