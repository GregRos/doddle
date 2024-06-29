import { seqs } from "@lib"
it("should leave it empty", () => {
    const s = seqs.empty().map(X => 1)
    expect(s.some().pull()).toBe(false)
})

it("should map", () => {
    const s = seqs.of(1, 2, 3).map(v => v + 1)
    expect(s.toArray().pull()).toEqual([2, 3, 4])
})
