import { expect } from "@assertive-ts/core"
import { aseqs } from "@lib"

it("get at 0", async () => {
    const s = aseqs.of(1, 2, 3)
    expect(await s.at(0).pull()).toBeEqual(1)
})

it("get at number", async () => {
    const s = aseqs.of(1, 2, 3)
    expect(await s.at(1).pull()).toBeEqual(2)
})

it("get at missing index is undefined", async () => {
    const s = aseqs.of(1, 2, 3)
    expect(await s.at(3).pull()).toBeNull()
})

it("get at negative index", async () => {
    const s = aseqs.of(1, 2, 3)
    expect(await s.at(-1).pull()).toBeEqual(3)
})
