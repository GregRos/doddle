import { aseq } from "../seq/aseq.ctor"
import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    it("gives empty for 0 count", () => {
        expect(seq.repeat(1, 0)._qr).toEqual([])
    })

    it("gives singleton for 1 count", () => {
        expect(seq.repeat(1, 1)._qr).toEqual([1])
    })

    it("repeats N times", () => {
        expect(seq.repeat(1, 3)._qr).toEqual([1, 1, 1])
    })

    it("can be called using Infinity", () => {
        const inf = seq.repeat(1, Infinity).take(1000)
        expect(inf._qr).toEqual(Array(1000).fill(1))
    })
})

describe("async", () => {
    it("gives empty for 0 count", async () => {
        expect(await aseq.repeat(1, 0)._qr).toEqual([])
    })

    it("gives singleton for 1 count", async () => {
        expect(await aseq.repeat(1, 1)._qr).toEqual([1])
    })

    it("repeats N times", async () => {
        expect(await aseq.repeat(1, 3)._qr).toEqual([1, 1, 1])
    })

    it("can be called using Infinity", async () => {
        const inf = aseq.repeat(1, Infinity).take(1000)
        expect(await inf._qr).toEqual(Array(1000).fill(1))
    })
})
