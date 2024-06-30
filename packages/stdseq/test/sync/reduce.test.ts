import { seq } from "@lib"
it("should default on empty", () => {
    expect(
        seq
            .empty()
            .reduce((a, b) => a + b, 0)
            .pull()
    ).toEqual(0)
})

it("should reduce", () => {
    expect(
        seq
            .of(1, 2, 3)
            .reduce((a, b) => a + b, 0)
            .pull()
    ).toEqual(6)
})
