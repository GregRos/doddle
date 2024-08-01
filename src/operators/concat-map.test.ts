import { declare, type, type_of } from "declare-it"
import { type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

import { seq } from "../seq/seq.ctor"
import type { Seq } from "../seq/seq.class"

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    describe("type tests", () => {
        const Seq_never = type<_Seq<never>>
        const empty = _seq([])
        const s123 = _seq([1, 2, 3])
        declare.it("is typed as never when input is empty", expect => {
            expect(type_of(empty.concatMap(() => null! as []))).to_equal(Seq_never)
        })

        declare.it("is typed as never when projected to empty", expect => {
            expect(type_of(s123.concatMap(() => []))).to_equal(Seq_never)
        })

        declare.it("is typed correctly when projected to single element", expect => {
            expect(type_of(s123.concatMap(x => [`${x}`]))).to_equal(type<_Seq<string>>)
        })

        declare.it("is typed correctly when projected to different types", expect => {
            expect(type_of(s123.concatMap(x => [x, `${x}`]))).to_equal(type<_Seq<string | number>>)
            expect(type_of(s123.concatMap(x => [x > 1 ? 1 : "b"]))).to_equal(
                type<_Seq<string | number>>
            )
        })

        declare.it("is typed correctly when mapped to another seq", expect => {
            const s = _seq([1, 2, 3]).concatMap(x => _seq([x, `${x}`]))
            expect(type_of(s)).to_equal(type<_Seq<string | number>>)
        })

        declare.it("is correct element type when mapped to different seq inputs", expect => {
            const expected = type<_Seq<string>>
            const input = seq([1, 2, 3])
            expect(type_of(input.concatMap(x => null! as Iterable<string>))).to_equal(expected)
            expect(type_of(input.concatMap(x => () => null! as Iterable<string>))).to_equal(
                expected
            )
        })
    })

    it("projects correctly", () => {
        const s = _seq([1, 2, 3]).concatMap(x => [x, `${x}`])
        expect(s._qr).toEqual([1, "1", 2, "2", 3, "3"])
    })

    it("projects to empty", () => {
        const s = _seq([1, 2, 3]).concatMap(() => [])
        expect(s._qr).toEqual([])
    })

    it("projects when empty to empty", () => {
        const s = _seq([]).concatMap(() => [])
        expect(s._qr).toEqual([])
    })

    it("receives index", () => {
        const s = _seq([1, 2, 3]).concatMap((x, i) => [x, i])
        expect(s._qr).toEqual([1, 0, 2, 1, 3, 2])
    })

    it("projects correctly when mapped to different inputs", () => {
        const s = _seq([1, 2, 3])
        expect(
            s.concatMap(function* (x) {
                yield 1
            })._qr
        ).toEqual([1, 1, 1])

        expect(s.concatMap(x => _seq.of(1, 2))._qr).toEqual([1, 2, 1, 2, 1, 2])
        expect(s.concatMap(x => () => _seq.of(1, 2)[Symbol.iterator]())._qr).toEqual([
            1, 2, 1, 2, 1, 2
        ])
    })

    it("is not eager", () => {
        const s = _seq.repeat(1, Infinity)
        const projected = s.concatMap(x => _seq.repeat("a", Infinity))
        for (const _ of projected) {
            break
        }
    })

    it("doesn't pull more than necessary", () => {
        const iter = jest.fn(function* () {
            yield 1
            yield 2
            fail("should not pull next element")
        })
        const s = _seq(iter)
        const projected = s.concatMap(x => _seq([x]))
        expect(iter).not.toHaveBeenCalled()
        for (const _ of projected) {
            break
        }
    })

    it("can iterate twice", () => {
        const s = _seq([1, 2, 3]).concatMap(x => [x, `${x}`])
        expect(s._qr).toEqual([1, "1", 2, "2", 3, "3"])
        expect(s._qr).toEqual([1, "1", 2, "2", 3, "3"])
    })
})

describe("async", () => {
    const _seq = aseq
    type _Seq<T> = ASeq<T>
    describe("type tests", () => {
        const Seq_never = type<_Seq<never>>
        const empty = _seq([])
        const s123 = _seq([1, 2, 3])
        declare.it("typed as never when input is empty", expect => {
            expect(type_of(empty.concatMap(() => null! as []))).to_equal(Seq_never)
        })

        declare.it("typed as never when projected to empty", expect => {
            expect(type_of(s123.concatMap(() => []))).to_equal(Seq_never)
        })

        declare.it("typed correctly when projected to single element", expect => {
            expect(type_of(s123.concatMap(x => [`${x}`]))).to_equal(type<_Seq<string>>)
        })

        declare.it("typed correctly when projected to different types", expect => {
            expect(type_of(s123.concatMap(x => [x, `${x}`]))).to_equal(type<_Seq<string | number>>)
            expect(type_of(s123.concatMap(x => [x > 1 ? 1 : "b"]))).to_equal(
                type<_Seq<string | number>>
            )
        })

        declare.it("correct element type when mapped to different aseq inputs", expect => {
            const expected_type = type<_Seq<string>>
            const input = _seq([1, 2, 3])
            expect(type_of(input.concatMap(x => _seq(["a"])))).to_equal(expected_type)
            expect(type_of(input.concatMap(x => null! as AsyncIterable<string>))).to_equal(
                expected_type
            )
            expect(type_of(input.concatMap(x => () => null! as AsyncIterable<string>))).to_equal(
                expected_type
            )
            expect(type_of(input.concatMap(x => null! as Iterable<string>))).to_equal(expected_type)
            expect(type_of(input.concatMap(x => () => null! as Iterable<string>))).to_equal(
                expected_type
            )
        })
    })

    it("projects correctly", async () => {
        const s = _seq([1, 2, 3]).concatMap(x => [x, `${x}`])
        await expect(s._qr).resolves.toEqual([1, "1", 2, "2", 3, "3"])
    })

    it("projects to empty", async () => {
        const s = _seq([1, 2, 3]).concatMap(() => [])
        await expect(s._qr).resolves.toEqual([])
    })

    it("projects when empty to non empty, function not called", async () => {
        const fn = jest.fn(() => [1])
        const s = _seq([]).concatMap(fn)
        await expect(s._qr).resolves.toEqual([])
        expect(fn).not.toHaveBeenCalled()
    })

    it("is not eager", async () => {
        const s = _seq.repeat(1, Infinity)
        const projected = s.concatMap(x => _seq.repeat("a", Infinity))
        for await (const _ of projected) {
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
        const projected = s.concatMap(x => _seq([x]))
        expect(iter).not.toHaveBeenCalled()
        for await (const _ of projected) {
            break
        }
    })

    it("can iterate twice", async () => {
        const s = _seq([1, 2, 3]).concatMap(x => [x, `${x}`])
        await expect(s._qr).resolves.toEqual([1, "1", 2, "2", 3, "3"])
        await expect(s._qr).resolves.toEqual([1, "1", 2, "2", 3, "3"])
    })

    it("works for async projections", async () => {
        const s = _seq([1, 2, 3]).concatMap(async x => [x, `${x}`])
        await expect(s._qr).resolves.toEqual([1, "1", 2, "2", 3, "3"])
    })
})