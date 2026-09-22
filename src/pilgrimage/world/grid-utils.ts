export const ROUTE_DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

/** Pilgrimage deterministic min-heap used by organic clearing growth. */
export class MinHeap {
  private items: number[] = []
  private keys: number[] = []
  private orders: number[] = []
  private pushed = 0

  get size(): number {
    return this.items.length
  }

  push(item: number, key: number): void {
    this.items.push(item)
    this.keys.push(key)
    this.orders.push(this.pushed++)
    this.siftUp(this.items.length - 1)
  }

  pop(): number {
    const top = this.items[0]
    const lastItem = this.items.pop()!
    const lastKey = this.keys.pop()!
    const lastOrder = this.orders.pop()!
    if (this.items.length > 0) {
      this.items[0] = lastItem
      this.keys[0] = lastKey
      this.orders[0] = lastOrder
      this.siftDown(0)
    }
    return top
  }

  private less(a: number, b: number): boolean {
    return this.keys[a] < this.keys[b] || (this.keys[a] === this.keys[b] && this.orders[a] < this.orders[b])
  }

  private swap(a: number, b: number): void {
    ;[this.items[a], this.items[b]] = [this.items[b], this.items[a]]
    ;[this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]]
    ;[this.orders[a], this.orders[b]] = [this.orders[b], this.orders[a]]
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (!this.less(i, parent)) return
      this.swap(i, parent)
      i = parent
    }
  }

  private siftDown(i: number): void {
    const n = this.items.length
    for (;;) {
      const left = 2 * i + 1
      const right = left + 1
      let smallest = i
      if (left < n && this.less(left, smallest)) smallest = left
      if (right < n && this.less(right, smallest)) smallest = right
      if (smallest === i) return
      this.swap(i, smallest)
      i = smallest
    }
  }
}
