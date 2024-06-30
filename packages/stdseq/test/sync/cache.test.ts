import { seq } from "@lib"
it("should not mess up seq", () => {
    const s = seq.of(1, 2, 3).cache()
    expect(s.toArray().pull()).toEqual([1, 2, 3])
})

it("should not show side effects", () => {
    let i = 0
    const s = seq
        .of(1, 2, 3)
        .map(x => i++)
        .cache()
    expect(s.toArray().pull()).toEqual([0, 1, 2])
    expect(s.toArray().pull()).toEqual([0, 1, 2])
})
