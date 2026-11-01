import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThresholdSlider } from "./ThresholdSlider";

afterEach(cleanup);

describe("ThresholdSlider", () => {
  it("shows the current threshold", () => {
    render(<ThresholdSlider value={1} onChange={() => {}} />);
    expect(screen.getByRole("status").textContent).toBe("θ = 1.0");
  });

  it("reports the new threshold as a number when moved", () => {
    const onChange = vi.fn();
    render(<ThresholdSlider value={1} onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "2.5" } });
    expect(onChange).toHaveBeenCalledWith(2.5);
  });
});
