import { expect } from "@assertive-ts/core"
import { seqs } from "@lib"

it("empty sequence", () => {
    const s = seqs.empty().filter(() => false)
    expect(s.toArray().pull()).toBeEqual([])
})

it("single element", () => {
    const s = seqs.of(1).filter(() => true)
    expect(s.toArray().pull()).toBeEqual([1])
})

it("multiple elements", () => {
    const s = seqs.of(1, 2, 3).filter(v => v % 2 === 0)
    expect(s.toArray().pull()).toBeEqual([2])
})

it("no elements", () => {
    const s = seqs.of(1, 2, 3).filter(() => false)
    expect(s.toArray().pull()).toBeEqual([])
})
