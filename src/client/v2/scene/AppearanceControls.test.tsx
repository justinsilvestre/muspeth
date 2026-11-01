import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppearanceControls } from "./AppearanceControls";
import { defaultAppearance } from "./appearance";

afterEach(cleanup);

function renderControls(onChange = vi.fn(), onReset = vi.fn()) {
  render(<AppearanceControls value={defaultAppearance} onChange={onChange} onReset={onReset} />);
  return { onChange, onReset };
}

describe("AppearanceControls", () => {
  it("reports a changed slider inside its group, leaving the rest as it was", () => {
    const { onChange } = renderControls();
    fireEvent.change(screen.getByLabelText("Depth"), { target: { value: "1.2" } });
    expect(onChange).toHaveBeenCalledWith({
      ...defaultAppearance,
      shape: { ...defaultAppearance.shape, depth: 1.2 },
    });
  });

  it("reports a chosen finish", () => {
    const { onChange } = renderControls();
    fireEvent.change(screen.getByLabelText("Finish"), { target: { value: "glassy" } });
    expect(onChange.mock.calls[0]?.[0].material.finish).toBe("glassy");
  });

  it("reports a toggled setting", () => {
    const { onChange } = renderControls();
    fireEvent.click(screen.getByLabelText("Auto-rotate"));
    expect(onChange.mock.calls[0]?.[0].movement.autoRotate).toBe(true);
  });

  it("asks to reset when the reset button is pressed", () => {
    const { onReset } = renderControls();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalled();
  });
});
