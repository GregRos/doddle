import { aseq } from "@lib"

it("should default on empty", async () => {
    expect(
        await aseq
            .empty()
            .reduce(async (a, b) => a + b, 0)
            .pull()
    ).toEqual(0)
})

it("should reduce", async () => {
    expect(
        await aseq
            .of(1, 2, 3)
            .reduce(async (a, b) => a + b, 0)
            .pull()
    ).toEqual(6)
})
