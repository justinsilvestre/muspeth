import { expect, test } from "@playwright/test";

test.describe("app versions", () => {
  test("sends an address from before the versions to the first version", async ({ page }) => {
    await page.goto("/paths");
    await expect(page).toHaveURL(/\/v1\/paths$/);
  });

  test("shows a canvas in the second version's Scene tab", async ({ page }) => {
    await page.goto("/v2");
    await expect(page.getByRole("region", { name: "Scene" }).locator("canvas")).toBeVisible();
  });
});
