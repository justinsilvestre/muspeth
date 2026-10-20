import { expect, test } from "@playwright/test";

test.describe("browsing connections", () => {
  test("shows how the pinewood nematode connects to the Japanese red pine", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Japanese red pine/ }).click();
    await expect(
      page.getByRole("region", { name: /Connections of/ }).getByRole("listitem"),
    ).toContainText(["pinewood nematode pathogenOf Japanese red pine"]);
  });
});
