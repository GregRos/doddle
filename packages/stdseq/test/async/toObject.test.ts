import { aseq, aseqs, ASeq } from "@lib"
import { expect } from "@assertive-ts/core"

it("should give empty object on empty", async () => {
    const s = aseq().toObject(x => [x, x])
    expect(await s.pull()).toBeEqual({})
})

it("should convert to object", async () => {
    const s = aseqs.of(1, 2, 3).toObject(x => [x, x])
    expect(await s.pull()).toBeEqual({ 1: 1, 2: 2, 3: 3 })
})

it("should convert to object with different keys", async () => {
    const s = aseqs.of(1, 2, 3).toObject(x => [x + 1, x])
    expect(await s.pull()).toBeEqual({ 2: 1, 3: 2, 4: 3 })
})

it("should keep set newer entry on conflicting", async () => {
    const s = aseqs.of(1, 2, 3).toObject(x => [x % 2, x])
    expect(await s.pull()).toBeEqual({ 1: 3, 0: 2 })
})
