import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLingeringIds } from "./useLingeringIds";

const lingerMs = 300;

function renderWithIds(ids: string[]) {
  return renderHook((props: { ids: Set<string> }) => useLingeringIds(props.ids, lingerMs), {
    initialProps: { ids: new Set(ids) },
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useLingeringIds", () => {
  it("includes the current IDs", () => {
    const { result } = renderWithIds(["a", "b"]);
    expect([...result.current].sort()).toEqual(["a", "b"]);
  });

  describe("when an ID is dropped", () => {
    it("keeps it for the lingering time", () => {
      const hook = renderWithIds(["a", "b"]);
      hook.rerender({ ids: new Set(["a"]) });
      act(() => vi.advanceTimersByTime(lingerMs - 1));
      expect(hook.result.current.has("b")).toBe(true);
    });

    it("removes it after the lingering time", () => {
      const hook = renderWithIds(["a", "b"]);
      hook.rerender({ ids: new Set(["a"]) });
      act(() => vi.advanceTimersByTime(lingerMs));
      expect(hook.result.current.has("b")).toBe(false);
    });

    it("keeps it if it returns before the lingering time ends", () => {
      const hook = renderWithIds(["a", "b"]);
      hook.rerender({ ids: new Set(["a"]) });
      hook.rerender({ ids: new Set(["a", "b"]) });
      act(() => vi.advanceTimersByTime(lingerMs));
      expect(hook.result.current.has("b")).toBe(true);
    });
  });
});
