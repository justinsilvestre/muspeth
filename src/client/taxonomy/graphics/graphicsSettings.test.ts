import { afterEach, describe, expect, it } from "vitest";
import {
  defaultGraphicsSettings,
  graphicsSettingsReducer,
  readStoredGraphicsSettings,
  storeGraphicsSettings,
} from "./graphicsSettings";

afterEach(() => localStorage.clear());

describe("graphicsSettingsReducer", () => {
  it("applies changes and keeps the other settings", () => {
    const settings = graphicsSettingsReducer(defaultGraphicsSettings, {
      type: "changed",
      changes: { leafSize: 2 },
    });
    expect(settings).toEqual({ ...defaultGraphicsSettings, leafSize: 2 });
  });

  it("restores the defaults on reset", () => {
    const changed = { ...defaultGraphicsSettings, trunkRadius: 1 };
    expect(graphicsSettingsReducer(changed, { type: "reset" })).toEqual(defaultGraphicsSettings);
  });
});

describe("readStoredGraphicsSettings", () => {
  it("returns the stored settings", () => {
    storeGraphicsSettings({ ...defaultGraphicsSettings, leafGap: 0.2 });
    expect(readStoredGraphicsSettings().leafGap).toBe(0.2);
  });

  it("fills settings missing from storage with defaults", () => {
    localStorage.setItem("graphicsSettings", JSON.stringify({ leafGap: 0.2 }));
    expect(readStoredGraphicsSettings().trunkRadius).toBe(defaultGraphicsSettings.trunkRadius);
  });

  it("falls back to the defaults when storage holds invalid JSON", () => {
    localStorage.setItem("graphicsSettings", "{");
    expect(readStoredGraphicsSettings()).toEqual(defaultGraphicsSettings);
  });
});
