import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"
it("empty on empty", () => {
    const a = seqs.empty().takeLast(1)
    expect(a.some().pull()).toBe(false)
})

it("should take last", () => {
    const a = seqs.of(1, 2, 3).takeLast(1)
    expect(a.toArray().pull()).toBeEqual([3])
})

it("should take last 2", () => {
    const a = seqs.of(1, 2, 3).takeLast(2)
    expect(a.toArray().pull()).toBeEqual([2, 3])
})

it("should take everything when shorter", () => {
    const a = seqs.of(1, 2, 3).takeLast(4)
    expect(a.toArray().pull()).toBeEqual([1, 2, 3])
})

it("should take nothing when 0", () => {
    const a = seqs.of(1, 2, 3).takeLast(0)
    expect(a.toArray().pull()).toBeEqual([])
})
