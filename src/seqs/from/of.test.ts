import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    it("gives empty on empty argslist", () => {
        expect(seq.of()._qr).toEqual([])
    })

    it("gives singleton on singleton argslist", () => {
        expect(seq.of(1)._qr).toEqual([1])
    })

    it("gives argslist as is", () => {
        expect(seq.of(1, 2, 3)._qr).toEqual([1, 2, 3])
    })

    it("can be called using spread", () => {
        const args = [1, 2, 3]
        expect(seq.of(...args)._qr).toEqual(args)
    })
})

describe("async", () => {
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
})
