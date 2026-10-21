import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ColorSchemeSwitcher } from "./ColorSchemeSwitcher";
import { ColorSchemeProvider } from "./useColorScheme";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});

function renderSwitcher() {
  render(
    <ColorSchemeProvider>
      <ColorSchemeSwitcher />
    </ColorSchemeProvider>,
  );
}

/** Finds a menu item, which jsdom always treats as hidden because it cannot open popovers. */
function getMenuItem(name: string) {
  return screen.getByRole("button", { name, hidden: true });
}

describe("ColorSchemeSwitcher", () => {
  it("names its menu button", () => {
    renderSwitcher();
    expect(screen.getByRole("button", { name: "Color scheme" })).toBeDefined();
  });

  it("marks the current preference as pressed", () => {
    renderSwitcher();
    expect(getMenuItem("System").getAttribute("aria-pressed")).toBe("true");
  });

  describe("when a preference is chosen", () => {
    it("applies it to the page", () => {
      renderSwitcher();
      fireEvent.click(getMenuItem("Dark"));
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
