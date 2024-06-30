import { aseq } from "@lib"

it("get at 0", async () => {
    const s = aseq.of(1, 2, 3)
    expect(await s.at(0).pull()).toEqual(1)
})

it("get at number", async () => {
    const s = aseq.of(1, 2, 3)
    expect(await s.at(1).pull()).toEqual(2)
})

it("get at missing index is undefined", async () => {
    const s = aseq.of(1, 2, 3)
    expect(await s.at(3).pull()).toBeNull()
})

it("get at negative index", async () => {
    const s = aseq.of(1, 2, 3)
    expect(await s.at(-1).pull()).toEqual(3)
})
