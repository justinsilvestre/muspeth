import { describe, expect, it } from "vitest";
import { MinHeap } from "./minHeap";

function drain(heap: MinHeap<number>) {
  const items: number[] = [];
  for (let item = heap.pop(); item !== undefined; item = heap.pop()) items.push(item);
  return items;
}

describe("MinHeap", () => {
  it("yields its items smallest first", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    for (const item of [5, 1, 4, 2, 8, 3, 7, 6, 1]) heap.push(item);
    expect(drain(heap)).toEqual([1, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("returns undefined when empty", () => {
    expect(new MinHeap<number>((a, b) => a - b).pop()).toBeUndefined();
  });

  it("counts its items", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    heap.push(2);
    heap.push(1);
    expect(heap.size).toBe(2);
  });
});
