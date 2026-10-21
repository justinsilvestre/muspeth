import { expect, test } from "@playwright/test";

const fromMatsutakeToRedPine = `/paths?from=${encodeURIComponent("wikidata:Q509308")}&to=${encodeURIComponent("wikidata:Q1044186")}`;

test.describe("reading the paths between two nodes", () => {
  test("gives the reasons for the selected path's rank", async ({ page }) => {
    await page.goto(fromMatsutakeToRedPine);
    await expect(page.getByRole("region", { name: "Path 1" })).toContainText(
      "crosses 1 kind of connection",
    );
  });

  test("offers a new search from a node the reader selects in the drawing", async ({ page }) => {
    await page.goto(fromMatsutakeToRedPine);
    await page.getByRole("button", { name: /^Japanese red pine,/ }).click();
    const details = page.getByRole("region", { name: "Japanese red pine" });
    await expect(details.getByRole("link", { name: "Find paths from here" })).toBeVisible();
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
