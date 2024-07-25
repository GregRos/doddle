import { aseq } from "../wrappers/aseq.ctor"
import { type ASeq } from "../wrappers/aseq.class"
import { seq } from "../wrappers/seq.ctor"
import { Seq } from "../wrappers/seq.class"
import { declare, type, type_of } from "declare-it"

describe("sync", () => {
    const f = seq
    declare.it("typed as fixed-length tuple when AllowSmaller is not set", expect => {
        expect(type_of(f([1, 2, 3]).chunk(3))).to_equal(type<Seq<[number, number, number]>>)
        expect(type_of(f([1, 2, 3]).chunk(2))).to_equal(type<Seq<[number, number]>>)
        expect(type_of(f([1, 2, 3]).chunk(1))).to_equal(type<Seq<[number]>>)
    })

    declare.it(
        "typed as optional tuple when AllowSmaller is set, except for first element",
        expect => {
            expect(type_of(f([1, 2, 3]).chunk(3, true))).to_equal(
                type<Seq<[number, number?, number?]>>
            )
            expect(type_of(f([1, 2, 3]).chunk(1, true))).to_equal(type<Seq<[number]>>)
        }
    )

    declare.it("typed as length 1+ tuple for non-literal chunk length", expect => {
        const s = f([1, 2, 3]).chunk(3 as number)
        expect(type_of(s)).to_equal(type<Seq<[number, ...number[]]>>)
    })

    declare.it("typed as length 1-Length for non-literal allowSmaller", expect => {
        const s = f([1, 2, 3]).chunk(3, true as boolean)
        expect(type_of(s)).to_equal(type<Seq<[number, number?, number?]>>)
    })

    declare.it("typed as length 1+ tuple for non-literal chunk length and allowSmaller", expect => {
        const s = f([1, 2, 3]).chunk(3 as number, true as boolean)
        expect(type_of(s)).to_equal(type<Seq<[number, ...number[]]>>)
    })

    it("chunks correctly, defaults to no allowSmaller", () => {
        const s = f([1, 2, 3, 4, 5]).chunk(2)
        expect(s._qr).toEqual([
            [1, 2],
            [3, 4]
        ])
    })

    it("chunks correctly, with allowSmaller", () => {
        const s = f([1, 2, 3, 4, 5]).chunk(2, true)
        expect(s._qr).toEqual([[1, 2], [3, 4], [5]])
    })

    it("errors on length of 0", () => {
        expect(() => f([1, 2, 3]).chunk(0)).toThrow("must be positive")
    })

    it("empty on empty", () => {
        const s = f([]).chunk(1)
        expect(s._qr).toEqual([])
    })

    it("is not eager", () => {
        const s = f(function* () {
            while (true) {
                yield 1
            }
        })
        const chunked = s.chunk(3)
        for (const _ of chunked) {
            break
        }
    })

    it("has no side-effects before iterate", () => {
        const fn = jest.fn(function* () {})
        const s = f(fn)
        const chunked = s.chunk(3)
        expect(fn).not.toHaveBeenCalled()
        for (const _ of chunked) {
            break
        }
        expect(fn).toHaveBeenCalledTimes(1)
    })
})

describe("async", () => {
    const f = aseq
    declare.it("typed as fixed-length tuple when AllowSmaller is not set", expect => {
        expect(type_of(f([1, 2, 3]).chunk(3))).to_equal(type<ASeq<[number, number, number]>>)
        expect(type_of(f([1, 2, 3]).chunk(2))).to_equal(type<ASeq<[number, number]>>)
        expect(type_of(f([1, 2, 3]).chunk(1))).to_equal(type<ASeq<[number]>>)
    })

    declare.it(
        "typed as optional tuple when AllowSmaller is set, except for first element",
        expect => {
            expect(type_of(f([1, 2, 3]).chunk(3, true))).to_equal(
                type<ASeq<[number, number?, number?]>>
            )
            expect(type_of(f([1, 2, 3]).chunk(1, true))).to_equal(type<ASeq<[number]>>)
        }
    )

    declare.it("typed as length 1+ tuple for non-literal chunk length", expect => {
        const s = f([1, 2, 3]).chunk(3 as number).__T
        expect(type_of(s)).to_equal(type<[number, ...number[]]>)
    })

    declare.it("typed as length 1-Length for non-literal allowSmaller", expect => {
        const s = f([1, 2, 3]).chunk(3, true as boolean).__T
        expect(type_of(s)).to_equal(type<[number, number?, number?]>)
    })

    declare.it("typed as length 1+ tuple for non-literal chunk length and allowSmaller", expect => {
        const s = f([1, 2, 3]).chunk(3 as number, true as boolean).__T
        expect(type_of(s)).to_equal(type<[number, ...number[]]>)
    })

    it("chunks correctly, defaults to no allowSmaller", () => {
        const s = f([1, 2, 3, 4, 5]).chunk(2)
        expect(s._qr).resolves.toEqual([
            [1, 2],
            [3, 4]
        ])
    })

    it("empty on empty", () => {
        const s = f([]).chunk(1)
        expect(s._qr).toEqual([])
    })
    it("chunks correctly, with allowSmaller", () => {
        const s = f([1, 2, 3, 4, 5]).chunk(2, true)
        expect(s._qr).resolves.toEqual([[1, 2], [3, 4], [5]])
    })

    it("errors on length of 0", () => {
        expect(() => f([1, 2, 3]).chunk(0)).rejects.toThrow("must be positive")
    })

    it("is not eager", async () => {
        const s = f(function* () {
            while (true) {
                yield 1
            }
        })
        const chunked = s.chunk(3)
        for await (const _ of chunked) {
            break
        }
    })

    it("has no side-effects before iterate", async () => {
        const fn = jest.fn(function* () {})
        const s = f(fn)
        const chunked = s.chunk(3)
        expect(fn).not.toHaveBeenCalled()
        for await (const _ of chunked) {
            break
        }
        expect(fn).toHaveBeenCalledTimes(1)
    })
})
