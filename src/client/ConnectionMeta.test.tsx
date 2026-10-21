import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ConnectionMetaProps } from "./ConnectionMeta";
import { ConnectionMeta } from "./ConnectionMeta";

afterEach(cleanup);

const mangalInteraction = {
  kind: "interaction",
  basis: "observed",
  source: "mangal",
  licence: "CC-BY-4.0",
  qualityFlags: [],
} satisfies ConnectionMetaProps;

describe("ConnectionMeta", () => {
  it("gives the kind, basis, source and licence in words", () => {
    render(<ConnectionMeta {...mangalInteraction} />);
    expect(screen.getByRole("paragraph").textContent).toBe(
      "interaction · observed · Mangal · CC BY 4.0",
    );
  });

  it("links a licence to its deed", () => {
    render(<ConnectionMeta {...mangalInteraction} />);
    expect(screen.getByRole("link", { name: "CC BY 4.0" }).getAttribute("href")).toBe(
      "https://creativecommons.org/licenses/by/4.0/",
    );
  });

  it("leaves a licence without a deed unlinked", () => {
    render(<ConnectionMeta {...mangalInteraction} licence="LicenseRef-web-of-life-attribution" />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("labels each quality flag in words", () => {
    render(<ConnectionMeta {...mangalInteraction} qualityFlags={["duplicate_network_copy"]} />);
    expect(screen.getByRole("paragraph").textContent).toContain("duplicate network copy");
  });

  it("describes each quality flag for assistive technology", () => {
    render(<ConnectionMeta {...mangalInteraction} qualityFlags={["duplicate_network_copy"]} />);
    expect(screen.getByText(/a network also held elsewhere/)).toBeDefined();
  });
});
