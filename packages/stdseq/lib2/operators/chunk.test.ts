import { declare, type, type_of } from "declare-it"
import { type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    const f = seq
    type SType<T> = Seq<T>
    declare.it("typed as 1-N length tuple", expect => {
        expect(type_of(f([1, 2, 3]).chunk(3))).to_equal(type<SType<[number, number?, number?]>>)
        expect(type_of(f([1, 2, 3]).chunk(1))).to_equal(type<SType<[number]>>)
    })

    declare.it("typed as length 1-∞ tuple when non-literal chunk length", expect => {
        const s = f([1, 2, 3]).chunk(3 as number)
        expect(type_of(s)).to_equal(type<SType<[number, ...number[]]>>)
    })

    it("chunks empty as empty", () => {
        const s = f([]).chunk(1)
        expect(s._qr).toEqual([])
    })

    it("chunks singletons correctly", () => {
        const s = f([1, 2, 3]).chunk(1)
        expect(s._qr).toEqual([[1], [2], [3]])
    })

    it("chunks pairs", () => {
        const s = f([1, 2, 3, 4, 5]).chunk(2)
        expect(s._qr).toEqual([[1, 2], [3, 4], [5]])
    })

    it("errors on length of 0", () => {
        expect(() => f([1, 2, 3]).chunk(0)).toThrow("must be positive")
    })

    it("is not eager", () => {
        const s = seq.repeat(1, Infinity)
        const chunked = s.chunk(3)
        for (const _ of chunked) {
            break
        }
    })

    it("doesn't pull more than necessary", () => {
        const iter = jest.fn(function* () {
            yield 1
            yield 2
            fail("should not pull next element")
        })
        const s = f(iter)
        const chunked = s.chunk(2)
        expect(iter).not.toHaveBeenCalled()
        for (const _ of chunked) {
            break
        }
    })

    it("can iterate twice", () => {
        const s = f([1, 2, 3]).chunk(2)
        expect(s._qr).toEqual([[1, 2], [3]])
        expect(s._qr).toEqual([[1, 2], [3]])
    })
})

describe("async", () => {
    const _seq = aseq
    type SType<T> = ASeq<T>
    declare.it("typed as 1-N length tuple", expect => {
        expect(type_of(_seq([1, 2, 3]).chunk(3))).to_equal(type<SType<[number, number?, number?]>>)
        expect(type_of(_seq([1, 2, 3]).chunk(1))).to_equal(type<SType<[number]>>)
    })

    declare.it("typed as length 1-∞ tuple when non-literal chunk length", expect => {
        const s = _seq([1, 2, 3]).chunk(3 as number)
        expect(type_of(s)).to_equal(type<SType<[number, ...number[]]>>)
    })

    it("chunks empty as empty", async () => {
        const s = _seq([]).chunk(1)
        await expect(s._qr).resolves.toEqual([])
    })

    it("chunks singletons correctly", async () => {
        const s = _seq([1, 2, 3]).chunk(1)
        await expect(s._qr).resolves.toEqual([[1], [2], [3]])
    })

    it("chunks pairs", async () => {
        const s = _seq([1, 2, 3, 4, 5]).chunk(2)
        await expect(s._qr).resolves.toEqual([[1, 2], [3, 4], [5]])
    })

    it("errors on chunk length of 0 immediately", async () => {
        expect(() => _seq([1, 2, 3]).chunk(0)).toThrow("must be positive")
    })

    it("is not eager", async () => {
        const s = aseq.repeat(1, Infinity)
        const chunked = s.chunk(3)
        for await (const _ of chunked) {
            break
        }
    })

    it("doesn't pull more than necessary", async () => {
        const iter = jest.fn(async function* () {
            yield 1
            yield 2
            fail("should not pull next element")
        })
        const s = _seq(iter)
        const chunked = s.chunk(2)
        expect(iter).not.toHaveBeenCalled()
        for await (const _ of chunked) {
            break
        }
    })

    it("can iterate twice", async () => {
        const s = _seq([1, 2, 3]).chunk(2)
        await expect(s._qr).resolves.toEqual([[1, 2], [3]])
        await expect(s._qr).resolves.toEqual([[1, 2], [3]])
    })
})
