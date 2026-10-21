import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { emptyConnectionFilter } from "../../shared/connectionFilter";
import { QualityFlagChoices } from "./QualityFlagChoices";

afterEach(cleanup);

describe("QualityFlagChoices", () => {
  it("shows the meaning of each flag as text", () => {
    render(<QualityFlagChoices filter={emptyConnectionFilter} onChange={() => {}} />);
    expect(screen.getByText(/The record is likely wrong/)).toBeDefined();
  });

  it("names each flag's menu by the flag alone", () => {
    render(<QualityFlagChoices filter={emptyConnectionFilter} onChange={() => {}} />);
    expect(screen.getByRole("combobox", { name: "suspected error" })).toBeDefined();
  });

  it("describes each flag's menu by the flag's meaning", () => {
    render(<QualityFlagChoices filter={emptyConnectionFilter} onChange={() => {}} />);
    expect(
      screen.getByRole("combobox", { name: "suspected error" }).getAttribute("aria-describedby"),
    ).toBe("flag-suspected_error-meaning");
  });
});
