/// <reference lib="dom" />
import { expect, test } from "@playwright/test";

const matsutakePath = `/organisms/${encodeURIComponent("wikidata:Q509308")}`;

test.describe("on a narrow screen", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows an organism's connections before the list of nodes", async ({ page }) => {
    await page.goto(matsutakePath);
    const connectionsHeading = page.getByRole("heading", { name: "Connections of matsutake" });
    await expect(connectionsHeading).toBeInViewport();
  });

  test("fits the node list within the screen's width", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /pentaoxaoctacyclo/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      375,
    );
  });

  test("fits the path pickers within the screen's width", async ({ page }) => {
    await page.goto(`/paths?from=${encodeURIComponent("e2e:octacycle")}`);
    await expect(page.getByRole("combobox", { name: "From" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      375,
    );
  });
});
