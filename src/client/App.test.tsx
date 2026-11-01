import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { ColorSchemeProvider } from "./theme/useColorScheme";

vi.mock("./v1/V1App", () => ({ V1App: () => <p>First version</p> }));
vi.mock("./v2/V2App", () => ({ V2App: () => <p>Second version</p> }));

afterEach(cleanup);

function LocationReadout() {
  const { pathname, search } = useLocation();
  return <output>{`${pathname}${search}`}</output>;
}

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ColorSchemeProvider>
        <App />
        <LocationReadout />
      </ColorSchemeProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("shows the first version under /v1", () => {
    renderApp("/v1/paths");
    expect(screen.getByText("First version")).toBeDefined();
  });

  it("shows the second version under /v2", () => {
    renderApp("/v2");
    expect(screen.getByText("Second version")).toBeDefined();
  });

  it("sends the root address to the first version", () => {
    renderApp("/");
    expect(screen.getByRole("status").textContent).toBe("/v1");
  });

  it("sends an unprefixed address to the same page of the first version", () => {
    renderApp("/paths?from=a&to=b");
    expect(screen.getByRole("status").textContent).toBe("/v1/paths?from=a&to=b");
  });
});
