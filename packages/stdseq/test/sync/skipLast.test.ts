import { seqs } from "@lib"
it("should empty on empty", () => {
    const a = seqs.empty().skipLast(1)
    expect(a.some().pull()).toBe(false)
})

it("should skip last", () => {
    const a = seqs.of(1, 2, 3).skipLast(1)
    expect(a.toArray().pull()).toEqual([1, 2])
})

it("should skip last 2", () => {
    const a = seqs.of(1, 2, 3).skipLast(2)
    expect(a.toArray().pull()).toEqual([1])
})

it("should skip everything when shorter", () => {
    const a = seqs.of(1, 2, 3).skipLast(4)
    expect(a.toArray().pull()).toEqual([])
})

it("should skip nothing when 0", () => {
    const a = seqs.of(1, 2, 3).skipLast(0)
    expect(a.toArray().pull()).toEqual([1, 2, 3])
})
