import { aseq } from "@lib"
it("gives empty on empty argslist", async () => {
    await expect(aseq.of()._qr).resolves.toEqual([])
})

it("gives singleton on singleton argslist", async () => {
    await expect(aseq.of(1)._qr).resolves.toEqual([1])
})

it("gives argslist as is", async () => {
    await expect(aseq.of(1, 2, 3)._qr).resolves.toEqual([1, 2, 3])
})

it("can be called using spread", async () => {
    const args = [1, 2, 3]
    await expect(aseq.of(...args)._qr).resolves.toEqual(args)
})
