import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorSchemeProvider } from "../theme/useColorScheme";
import { V2App } from "./V2App";

vi.mock("./scene/CellScene", () => ({ default: () => null }));
vi.mock("./guilds/GuildScene", () => ({ default: () => null }));

afterEach(cleanup);

function renderV2App(path = "/v2") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ColorSchemeProvider>
        <V2App />
      </ColorSchemeProvider>
    </MemoryRouter>,
  );
}

describe("V2App", () => {
  it("marks the Historical glottometry tab as open", () => {
    renderV2App();
    expect(
      screen.getByRole("link", { name: "Historical glottometry" }).getAttribute("aria-current"),
    ).toBe("page");
  });

  it("marks the Organism guilds tab as open at its address", () => {
    renderV2App("/v2/guilds");
    expect(screen.getByRole("link", { name: "Organism guilds" }).getAttribute("aria-current")).toBe(
      "page",
    );
  });
});
