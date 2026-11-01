import { expect, test } from "@playwright/test";

test.describe("app versions", () => {
  test("sends an address from before the versions to the first version", async ({ page }) => {
    await page.goto("/paths");
    await expect(page).toHaveURL(/\/v1\/paths$/);
  });

  test("shows a canvas in the second version's Historical glottometry tab", async ({ page }) => {
    await page.goto("/v2");
    await expect(
      page.getByRole("region", { name: "Historical glottometry" }).locator("canvas"),
    ).toBeVisible();
  });

  test("shows a canvas in the second version's Pollination guilds tab", async ({ page }) => {
    await page.goto("/v2/pollination");
    await expect(
      page.getByRole("region", { name: "Pollination guilds" }).locator("canvas"),
    ).toBeVisible();
  });
});
