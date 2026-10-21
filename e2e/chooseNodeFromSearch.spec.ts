import { expect, type Page, test } from "@playwright/test";

const matsutakePath = `/organisms/${encodeURIComponent("wikidata:Q509308")}`;

/** Follows the last of many matches in the node search, and returns its link. */
async function chooseLastMatch(page: Page) {
  await page.goto(matsutakePath);
  const search = page.getByRole("region", { name: "Nodes" });
  await search.getByRole("searchbox", { name: "Search nodes" }).fill("a");
  const lastMatch = search.getByRole("list").getByRole("link").last();
  await lastMatch.click();
  await expect(lastMatch).toHaveAttribute("aria-current", "page");
  return lastMatch;
}

test.describe("choosing a node far down the node search", () => {
  // A short screen puts the last of the few test nodes well below the start of the connections.
  test.use({ viewport: { width: 1280, height: 400 } });

  test("brings the start of its connections into view", async ({ page }) => {
    await chooseLastMatch(page);
    await expect(page.getByRole("heading", { name: /^Connections of / })).toBeInViewport();
  });

  test("moves focus to the start of its connections", async ({ page }) => {
    await chooseLastMatch(page);
    await expect(page.getByRole("heading", { name: /^Connections of / })).toBeFocused();
  });

  test("keeps the chosen match in view", async ({ page }) => {
    const lastMatch = await chooseLastMatch(page);
    await expect(lastMatch).toBeInViewport();
  });

  test.describe("on a narrow screen", () => {
    test.use({ viewport: { width: 375, height: 500 } });

    test("brings the start of its connections into view", async ({ page }) => {
      await chooseLastMatch(page);
      await expect(page.getByRole("heading", { name: /^Connections of / })).toBeInViewport();
    });
  });
});
