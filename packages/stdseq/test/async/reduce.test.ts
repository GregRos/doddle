import { aseqs } from "@lib"

it("should default on empty", async () => {
    expect(
        await aseqs
            .empty()
            .reduce(async (a, b) => a + b, 0)
            .pull()
    ).toEqual(0)
})

it("should reduce", async () => {
    expect(
        await aseqs
            .of(1, 2, 3)
            .reduce(async (a, b) => a + b, 0)
            .pull()
    ).toEqual(6)
})
