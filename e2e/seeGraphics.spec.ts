import { expect, test } from "@playwright/test";

test.describe("the graphics of the Paths view", () => {
  test("sketch how paths work on an empty page", async ({ page }) => {
    await page.goto("/paths");
    await expect(page.getByRole("img", { name: /^How paths work/ })).toBeVisible();
  });

  test("draw the paths of an example search as chains", async ({ page }) => {
    await page.goto("/paths");
    await page.getByRole("link", { name: /matsutake → Japanese red pine/i }).click();
    await expect(page.getByRole("img", { name: /^Path 1 drawn as a chain/ })).toBeVisible();
  });
});

test.describe("the graphics of the Places and periods view", () => {
  test("sketch how searching works on an empty page", async ({ page }) => {
    await page.goto("/places");
    await expect(
      page.getByRole("img", { name: /^How searching by place and period works/ }),
    ).toBeVisible();
  });

  test("draw a timeline for an example period", async ({ page }) => {
    await page.goto("/places");
    await page.getByRole("link", { name: "From 1990 to 1992" }).click();
    await expect(page.getByRole("img", { name: /^Timeline of when/ })).toBeVisible();
  });

  test("map the connections found near a place", async ({ page }) => {
    await page.goto("/places?near=35.01,135.77");
    await expect(page.getByRole("img", { name: /^Map of where/ })).toContainText("2 connections");
  });
});
