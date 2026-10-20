import { expect, test } from "@playwright/test";

test.describe("viewing the taxonomic tree", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Taxonomic tree" }).click();
  });

  test("outlines the matsutake's lineage from its kingdom", async ({ page }) => {
    const outline = page.getByRole("list", { name: "Taxonomic tree outline" });
    await expect(outline.getByRole("listitem").filter({ hasText: /^kingdom Fungi/ })).toContainText(
      "genus Tricholoma",
    );
  });

  test("places the organisms' labels on the 3D tree", async ({ page }) => {
    const label = page.getByTestId("tree-labels").locator("span", { hasText: /^matsutake$/ });
    await expect(label).toHaveCSS("transform", /^matrix/);
  });
});
