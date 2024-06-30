import { aseq } from "@lib"

it("should give empty object on empty", async () => {
    const s = aseq().toObject(x => [x, x])
    expect(await s.pull()).toEqual({})
})

it("should convert to object", async () => {
    const s = aseq.of(1, 2, 3).toObject(x => [x, x])
    expect(await s.pull()).toEqual({ 1: 1, 2: 2, 3: 3 })
})

it("should convert to object with different keys", async () => {
    const s = aseq.of(1, 2, 3).toObject(x => [x + 1, x])
    expect(await s.pull()).toEqual({ 2: 1, 3: 2, 4: 3 })
})

it("should keep set newer entry on conflicting", async () => {
    const s = aseq.of(1, 2, 3).toObject(x => [x % 2, x])
    expect(await s.pull()).toEqual({ 1: 3, 0: 2 })
})
