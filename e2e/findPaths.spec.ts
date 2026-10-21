import { expect, test } from "@playwright/test";

const fromHoneyBeeToMatsutake = `/paths?from=${encodeURIComponent("wikidata:Q30034")}&to=${encodeURIComponent("wikidata:Q509308")}`;

test.describe("finding paths between two nodes", () => {
  test("ranks the path through a quiet place first", async ({ page }) => {
    await page.goto("/paths");
    await page.getByRole("combobox", { name: "From" }).selectOption({ label: "western honey bee" });
    await page.getByRole("combobox", { name: "To" }).selectOption({ label: "matsutake" });
    await expect(page.getByRole("list", { name: "Paths" }).getByRole("heading").first()).toHaveText(
      "1. western honey bee → Kyoto → matsutake",
    );
  });

  test("states the kind and basis of each step", async ({ page }) => {
    await page.goto(fromHoneyBeeToMatsutake);
    await expect(page.getByRole("list", { name: "Steps of path 1" })).toContainText(
      "shared place and sound · observed",
    );
  });

  test("leaves out paths through connections whose flag is hidden", async ({ page }) => {
    await page.goto(`${fromHoneyBeeToMatsutake}&notFlaggedWith=suspected_error`);
    const headings = page.getByRole("list", { name: "Paths" }).getByRole("heading");
    await expect(headings.first()).toBeVisible();
    await expect(headings.filter({ hasText: "western honey bee → Japanese red pine" })).toHaveCount(
      0,
    );
  });
});
