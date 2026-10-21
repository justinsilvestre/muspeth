import { expect, test } from "@playwright/test";

const honeyBeePath = `/organisms/${encodeURIComponent("wikidata:Q30034")}`;
const matsutakePath = `/organisms/${encodeURIComponent("wikidata:Q509308")}`;

test.describe("filtering connections", () => {
  test("hides connections that carry a quality flag", async ({ page }) => {
    await page.goto(honeyBeePath);
    const connections = page.getByRole("region", { name: "Connections of western honey bee" });
    await expect(connections.getByRole("listitem")).toContainText(["visits flowers of"]);
    await connections.getByText("Filters").click();
    await connections.getByRole("combobox", { name: "suspected error" }).selectOption("hide");
    await expect(connections.getByRole("listitem")).not.toContainText(["visits flowers of"]);
  });

  test("keeps the filter in the address", async ({ page }) => {
    await page.goto(honeyBeePath);
    const connections = page.getByRole("region", { name: "Connections of western honey bee" });
    await connections.getByText("Filters").click();
    await connections.getByRole("combobox", { name: "suspected error" }).selectOption("hide");
    await expect(page).toHaveURL(/notFlaggedWith=suspected_error/);
  });

  test("keeps only connections of the checked kind", async ({ page }) => {
    await page.goto(matsutakePath);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await connections.getByText("Filters").click();
    // The checkbox reflects the address, which the router updates just after the click.
    await connections.getByRole("checkbox", { name: "shared place and sound" }).click();
    await expect(connections.getByRole("listitem")).toHaveText([/^matsutake recorded at Kyoto/]);
  });

  test("opens filtered connections from their address", async ({ page }) => {
    await page.goto(`${matsutakePath}?basis=attributed`);
    const connections = page.getByRole("region", { name: "Connections of matsutake" });
    await expect(connections.getByRole("listitem")).toHaveText([/^matsutake named by matsu/]);
  });
});
