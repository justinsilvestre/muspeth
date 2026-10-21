import { expect, test } from "@playwright/test";

test.describe("finding connections by place and period", () => {
  test("lists the connections recorded near a place", async ({ page }) => {
    await page.goto("/places");
    await page.getByRole("textbox", { name: "Latitude" }).fill("35.01");
    await page.getByRole("textbox", { name: "Longitude" }).fill("135.77");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(
      page.getByRole("list", { name: "Connections by place and period" }).getByRole("listitem"),
    ).toHaveText([/recorded at Kyoto.*0\.0 km away/, /recorded at Kyoto.*2\.4 km away/]);
  });

  test("lists the connections recorded within a period", async ({ page }) => {
    await page.goto("/places?from=2005&to=2005");
    await expect(
      page.getByRole("list", { name: "Connections by place and period" }).getByRole("listitem"),
    ).toHaveText([/^western honey bee visits flowers of Japanese red pineSapporo/]);
  });

  test("searches near a point clicked on the map", async ({ page }) => {
    await page.goto("/places");
    const map = page.getByRole("region", { name: /^Map of where/ });
    await expect(map.getByRole("button", { name: /^Search near Sapporo/ })).toBeVisible();
    await map.locator("canvas").click({ position: { x: 20, y: 20 } });
    await expect(page).toHaveURL(/near=/);
  });

  test("searches near a place chosen from its mark on the map", async ({ page }) => {
    await page.goto("/places?from=2005");
    await page.getByRole("button", { name: /^Search near Sapporo/ }).click();
    await expect(
      page.getByRole("list", { name: "Connections by place and period" }).getByRole("listitem"),
    ).toHaveText([/recorded at Sapporo|Sapporo.*0\.0 km away/]);
  });
});
