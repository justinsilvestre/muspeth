import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphNode } from "../../shared/graph";
import { createNodeCatalog } from "./createNodeCatalog";
import { NodeCombobox } from "./NodeCombobox";

function bee(id: string, label: string, englishName: string) {
  return {
    id,
    kind: "organism",
    label,
    names: [{ language: "en", name: englishName }],
  } satisfies GraphNode;
}

const catalog = createNodeCatalog([
  bee("western", "Apis mellifera", "western honey bee"),
  bee("eastern", "Apis cerana", "eastern honey bee"),
]);

function renderCombobox(selectedNodeId = "") {
  const onChange = vi.fn();
  render(
    <NodeCombobox
      label="From"
      catalog={catalog}
      selectedNodeId={selectedNodeId}
      onChange={onChange}
    />,
  );
  return { combobox: screen.getByRole("combobox", { name: "From" }), onChange };
}

function typeInto(combobox: HTMLElement, query: string) {
  fireEvent.change(combobox, { target: { value: query } });
}

function activeOptionText(combobox: HTMLElement) {
  const activeId = combobox.getAttribute("aria-activedescendant") ?? "";
  return document.getElementById(activeId)?.textContent;
}

afterEach(cleanup);

describe("NodeCombobox", () => {
  describe("when a name is typed", () => {
    it("lists the matching nodes as options", () => {
      const { combobox } = renderCombobox();
      typeInto(combobox, "honey");
      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("activates the best match", () => {
      const { combobox } = renderCombobox();
      typeInto(combobox, "honey");
      expect(activeOptionText(combobox)).toMatch(/^eastern honey bee/);
    });

    it("announces the number of matches", () => {
      const { combobox } = renderCombobox();
      typeInto(combobox, "honey");
      expect(screen.getByRole("status").textContent).toBe("2 matching nodes.");
    });
  });

  describe("when the down arrow is pressed", () => {
    it("activates the next option", () => {
      const { combobox } = renderCombobox();
      typeInto(combobox, "honey");
      fireEvent.keyDown(combobox, { key: "ArrowDown" });
      expect(activeOptionText(combobox)).toMatch(/^western honey bee/);
    });
  });

  describe("when Enter is pressed", () => {
    it("chooses the active option", () => {
      const { combobox, onChange } = renderCombobox();
      typeInto(combobox, "western");
      fireEvent.keyDown(combobox, { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("western");
    });

    it("closes the list", () => {
      const { combobox } = renderCombobox();
      typeInto(combobox, "western");
      fireEvent.keyDown(combobox, { key: "Enter" });
      expect(combobox.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("when Escape is pressed", () => {
    it("closes the list", () => {
      const { combobox } = renderCombobox();
      typeInto(combobox, "honey");
      fireEvent.keyDown(combobox, { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  describe("when an option is clicked", () => {
    it("chooses it", () => {
      const { combobox, onChange } = renderCombobox();
      typeInto(combobox, "honey");
      fireEvent.click(screen.getByRole("option", { name: /western/ }));
      expect(onChange).toHaveBeenCalledWith("western");
    });
  });

  describe("when a node has been chosen", () => {
    it("shows its name in the field", () => {
      const { combobox } = renderCombobox("eastern");
      expect((combobox as HTMLInputElement).value).toBe("eastern honey bee");
    });
  });
});
