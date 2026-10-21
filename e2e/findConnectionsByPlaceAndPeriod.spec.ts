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
});
