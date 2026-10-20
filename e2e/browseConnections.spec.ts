import { expect, test } from "@playwright/test";

test.describe("browsing connections", () => {
  test("shows how the pinewood nematode connects to the Japanese red pine", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Japanese red pine/ }).click();
    await expect(
      page.getByRole("region", { name: /Connections of/ }).getByRole("listitem"),
    ).toContainText(["pinewood nematode pathogenOf Japanese red pine"]);
  });

  test("opens an organism's connections directly from its address", async ({ page }) => {
    await page.goto(`/organisms/${encodeURIComponent("wikidata:Q1044186")}`);
    await expect(
      page.getByRole("region", { name: "Connections of Japanese red pine" }),
    ).toBeVisible();
  });
});
