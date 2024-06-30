import { aseq } from "@lib"

it("true on empty", async () => {
    const s = aseq.empty().every(async () => false)
    expect(await s.pull()).toBe(true)
})

it("false on once", async () => {
    const s = aseq.of(1).every(async () => false)
    expect(await s.pull()).toBe(false)
})

it("evaluates", async () => {
    const s = aseq.of(1, 2, 3).every(async v => v < 4)
    expect(await s.pull()).toBe(true)
})
