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

  test("searches a period brushed on the timeline", async ({ page }) => {
    await page.goto("/places");
    const timeline = page.getByRole("img", { name: /^Timeline of when/ });
    await timeline.scrollIntoViewIfNeeded();
    const box = await timeline.boundingBox();
    if (!box) throw new Error("The timeline is not shown");
    await page.mouse.move(box.x + 2, box.y + 30);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 2, box.y + 30, { steps: 4 });
    await page.mouse.up();
    await expect(page).toHaveURL(/from=.*&to=/);
  });

  test("moves on to the place where a connection was recorded", async ({ page }) => {
    await page.goto("/places?from=2005&to=2005");
    await page.getByRole("link", { name: "Search near Sapporo at any time" }).click();
    await expect(page).toHaveURL(/near=43\.06%2C141\.35$/);
  });
});
