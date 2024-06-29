import { seqs } from "@lib"
it("should do nothing on empty", () => {
    const a = seqs.empty().index()
    expect(a.some().pull()).toBe(false)
})

it("should attach index", () => {
    const a = seqs.of(1, 2, 3).index()
    expect(a.toArray().pull()).toEqual([
        [0, 1],
        [1, 2],
        [2, 3]
    ])
})
