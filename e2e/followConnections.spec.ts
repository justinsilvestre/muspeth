import { expect, test } from "@playwright/test";

const matsutakePath = `/organisms/${encodeURIComponent("wikidata:Q509308")}`;

test.describe("following connections to the next node", () => {
  test("opens a neighbour's page from its name in a connection", async ({ page }) => {
    await page.goto(`${matsutakePath}?basis=attributed`);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await connections.getByRole("link", { name: "matsu" }).click();
    await expect(
      page.getByRole("region", { name: "Connections of matsu", exact: true }),
    ).toBeVisible();
  });

  test("keeps the filters on the neighbour's page", async ({ page }) => {
    await page.goto(`${matsutakePath}?basis=attributed`);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await connections.getByRole("link", { name: "matsu" }).click();
    await expect(page).toHaveURL(/\/organisms\/e2e%3Amatsu\?basis=attributed$/);
  });

  test("links back to the node it came from", async ({ page }) => {
    await page.goto(`${matsutakePath}?basis=attributed`);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await connections.getByRole("link", { name: "matsu" }).click();
    const neighbours = page.getByRole("region", { name: "Connections of matsu", exact: true });
    await expect(neighbours.getByRole("link", { name: "matsutake" })).toBeVisible();
  });

  test("shows a node's own name in its connections as plain text", async ({ page }) => {
    await page.goto(matsutakePath);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await expect(connections.getByRole("link", { name: "matsutake" })).toHaveCount(0);
  });
});
