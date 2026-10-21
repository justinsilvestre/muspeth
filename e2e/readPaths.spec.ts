import { expect, test } from "@playwright/test";

const fromMatsutakeToRedPine = `/paths?from=${encodeURIComponent("wikidata:Q509308")}&to=${encodeURIComponent("wikidata:Q1044186")}`;

test.describe("reading the paths between two nodes", () => {
  test("explains how paths are ranked", async ({ page }) => {
    await page.goto(fromMatsutakeToRedPine);
    await expect(page.getByText(/^Paths through nodes with fewer neighbours/)).toContainText(
      "mix kinds of connection, are listed first",
    );
  });

  test("gives the reasons for a path's rank", async ({ page }) => {
    await page.goto(fromMatsutakeToRedPine);
    await expect(
      page.getByRole("list", { name: "Paths" }).getByRole("listitem").first(),
    ).toContainText("1 step · crosses 1 kind of connection");
  });

  test("folds a step's parallel connections behind a disclosure", async ({ page }) => {
    await page.goto(fromMatsutakeToRedPine);
    const steps = page.getByRole("list", { name: "Steps of path 1" });
    await expect(steps.locator("summary")).toHaveText("+2 more connections");
  });

  test("shows a step's parallel connections once the reader opens them", async ({ page }) => {
    await page.goto(fromMatsutakeToRedPine);
    const steps = page.getByRole("list", { name: "Steps of path 1" });
    await steps.getByText("+2 more connections").click();
    await expect(steps.getByText("Japanese red pine symbiont of matsutake")).toBeVisible();
  });
});
