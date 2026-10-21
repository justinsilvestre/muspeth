import { expect, test } from "@playwright/test";

test.describe("browsing connections", () => {
  test("shows how the pinewood nematode connects to the Japanese red pine", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Japanese red pine/ }).click();
    await expect(
      page.getByRole("region", { name: /Connections of/ }).getByRole("listitem"),
    ).toContainText(["pinewood nematode pathogenOf Japanese red pine"]);
  });

  test("finds a node by a name in another language", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Search nodes" }).fill("セイヨウミツバチ");
    await page.getByRole("link", { name: /western honey bee/ }).click();
    await expect(
      page.getByRole("region", { name: "Connections of western honey bee" }),
    ).toBeVisible();
  });

  test("opens an organism's connections directly from its address", async ({ page }) => {
    await page.goto(`/organisms/${encodeURIComponent("wikidata:Q1044186")}`);
    await expect(
      page.getByRole("region", { name: "Connections of Japanese red pine" }),
    ).toBeVisible();
  });

  test("shows the study behind a connection", async ({ page }) => {
    await page.goto(`/organisms/${encodeURIComponent("wikidata:Q1197786")}`);
    const connection = page
      .getByRole("region", { name: "Connections of pinewood nematode" })
      .getByRole("listitem")
      .filter({ hasText: "pathogenOf Japanese red pine" });
    await connection.getByText("Sources").click();
    await expect(connection).toContainText("The Mushroom at the End of the World");
  });
});
