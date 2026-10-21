import { describe, expect, it } from "vitest";
import { closedComboboxState, nodeComboboxReducer } from "./nodeComboboxReducer";

const openState = { query: "pine", isOpen: true, activeIndex: 1 };

describe("nodeComboboxReducer", () => {
  describe("when the reader types", () => {
    it("opens the list with the first option active", () => {
      expect(nodeComboboxReducer(closedComboboxState, { type: "typed", query: "ma" })).toEqual({
        query: "ma",
        isOpen: true,
        activeIndex: 0,
      });
    });
  });

  describe("when the active option moves", () => {
    it("moves by the given offset", () => {
      const action = { type: "movedBy", offset: 1, optionCount: 5 } as const;
      expect(nodeComboboxReducer(openState, action).activeIndex).toBe(2);
    });

    it("stops at the last option", () => {
      const action = { type: "movedBy", offset: 1, optionCount: 2 } as const;
      expect(nodeComboboxReducer(openState, action).activeIndex).toBe(1);
    });

    it("stops at the first option", () => {
      const action = { type: "movedBy", offset: -3, optionCount: 5 } as const;
      expect(nodeComboboxReducer(openState, action).activeIndex).toBe(0);
    });

    it("opens a closed list without moving", () => {
      const action = { type: "movedBy", offset: 1, optionCount: 5 } as const;
      expect(nodeComboboxReducer(closedComboboxState, action)).toEqual({
        ...closedComboboxState,
        isOpen: true,
      });
    });
  });

  describe("when Escape is pressed", () => {
    it("closes an open list but keeps the query", () => {
      expect(nodeComboboxReducer(openState, { type: "escaped" })).toEqual({
        ...openState,
        isOpen: false,
      });
    });

    it("drops the query of a closed list", () => {
      const closedWithQuery = { ...openState, isOpen: false };
      expect(nodeComboboxReducer(closedWithQuery, { type: "escaped" }).query).toBeNull();
    });
  });

  describe("when an option is chosen", () => {
    it("closes the list and drops the query", () => {
      expect(nodeComboboxReducer(openState, { type: "chosen" })).toEqual(closedComboboxState);
    });
  });

  describe("when the field loses focus", () => {
    it("closes the list and drops the query", () => {
      expect(nodeComboboxReducer(openState, { type: "left" })).toEqual(closedComboboxState);
    });
  });
});
