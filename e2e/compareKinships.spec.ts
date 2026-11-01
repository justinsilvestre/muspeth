/// <reference lib="dom" />
import { expect, test } from "@playwright/test";

test.describe("comparing kinships under several groupings", () => {
  test("names the matsutake's closest kin by interaction", async ({ page }) => {
    await page.goto("/kinships");
    const interaction = page
      .getByRole("term")
      .filter({ hasText: /^interaction$/ })
      .locator("..");
    await expect(interaction.getByRole("link", { name: "Japanese pine sawyer" })).toBeVisible();
  });

  test("says when an organism shares nothing by descent", async ({ page }) => {
    await page.goto("/kinships");
    const descent = page
      .getByRole("term")
      .filter({ hasText: /^descent$/ })
      .locator("..");
    await expect(descent.getByText("Shares nothing with the others here.")).toBeVisible();
  });

  test("faces the descent tree with the grouping chosen", async ({ page }) => {
    await page.goto("/kinships");
    await page
      .getByRole("combobox", { name: "Compare descent with" })
      .selectOption({ label: "shared substance" });
    await expect(page.locator("figure svg")).toContainText("shared substance");
  });

  test.describe("on a narrow screen", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("fits the page within the screen's width", async ({ page }) => {
      await page.goto("/kinships");
      await expect(page.locator("figure svg")).toBeVisible();
      expect(
        await page.evaluate<number>("document.documentElement.scrollWidth"),
      ).toBeLessThanOrEqual(375);
    });
  });
});
