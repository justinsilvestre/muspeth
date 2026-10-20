/** A priority queue that yields its items smallest first, according to the given comparison. */
export class MinHeap<Item> {
  readonly #items: Item[] = [];
  readonly #compare: (a: Item, b: Item) => number;

  constructor(compare: (a: Item, b: Item) => number) {
    this.#compare = compare;
  }

  get size() {
    return this.#items.length;
  }

  push(item: Item) {
    this.#items.push(item);
    this.#siftUp(this.#items.length - 1);
  }

  /** Removes and returns the smallest item, or undefined when the heap is empty. */
  pop() {
    const smallest = this.#items[0];
    const last = this.#items.pop();
    if (this.#items.length > 0 && last !== undefined) {
      this.#items[0] = last;
      this.#siftDown(0);
    }
    return smallest;
  }

  #siftUp(start: number) {
    let index = start;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (!this.#isLess(index, parent)) return;
      this.#swap(index, parent);
      index = parent;
    }
  }

  #siftDown(start: number) {
    let index = start;
    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      if (left < this.#items.length && this.#isLess(left, smallest)) smallest = left;
      if (right < this.#items.length && this.#isLess(right, smallest)) smallest = right;
      if (smallest === index) return;
      this.#swap(index, smallest);
      index = smallest;
    }
  }

  #isLess(a: number, b: number) {
    return this.#compare(this.#items[a] as Item, this.#items[b] as Item) < 0;
  }

  #swap(a: number, b: number) {
    [this.#items[a], this.#items[b]] = [this.#items[b] as Item, this.#items[a] as Item];
  }
}
