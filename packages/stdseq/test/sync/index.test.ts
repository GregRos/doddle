import { seq } from "@lib"
it("should do nothing on empty", () => {
    const a = seq.empty().index()
    expect(a.some().pull()).toBe(false)
})

it("should attach index", () => {
    const a = seq.of(1, 2, 3).index()
    expect(a.toArray().pull()).toEqual([
        [0, 1],
        [1, 2],
        [2, 3]
    ])
})
