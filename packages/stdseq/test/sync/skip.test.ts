import { seq } from "@lib"
it("should do nothing on empty", () => {
    const a = seq.empty().skip(1)
    expect(a.some().pull()).toEqual(false)
})

it("should skip", () => {
    const a = seq.of(1, 2, 3).skip(1)
    expect(a.toArray().pull()).toEqual([2, 3])
})

it("should skip all", () => {
    const a = seq.of(1, 2, 3).skip(3)
    expect(a.toArray().pull()).toEqual([])
})

it("should skip more than all", () => {
    const a = seq.of(1, 2, 3).skip(4)
    expect(a.toArray().pull()).toEqual([])
})
