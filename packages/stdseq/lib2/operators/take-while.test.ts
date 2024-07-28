import { declare, type, type_of } from "declare-it"
import { type ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    describe("type tests", () => {
        declare.it("keeps same type as input when no ellipsis is given", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true))).to_equal(type<_Seq<number>>)
        })
        declare.it("disjunction with ellipsis if specified", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true, "..." as string))).to_equal(
                type<_Seq<number | string>>
            )
        })
        declare.it("ellipsis is const", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true, "..."))).to_equal(
                type<_Seq<number | "...">>
            )
        })
        declare.it("no disjunction if ellipsis is nullish", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true, null as null | undefined))).to_equal(
                type<_Seq<number>>
            )
        })
        declare.it("excludes nullishness out of ellipsis if it's nullable", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true, null as null | string))).to_equal(
                type<_Seq<number | string>>
            )
        })
    })

    it("immediate false gives empty", () => {
        const s = _seq([1, 2, 3]).takeWhile(() => false)
        expect(s._qr).toEqual([])
    })

    it("constant true gives same", () => {
        const s = _seq([1, 2, 3]).takeWhile(() => true)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("stops at first false", () => {
        const s = _seq([1, 2, 3, 4, 5]).takeWhile(x => x < 3)
        expect(s._qr).toEqual([1, 2])
    })

    it("stops at first false with index", () => {
        const s = _seq([1, 2, 3, 4, 5]).takeWhile((x, i) => i < 3)
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("has no side-effects, pulls as many as needed", () => {
        const sq = jest.fn(function* () {
            yield 1
            yield 2
            expect(false).toBe(true)
        })
        const tkw = _seq(sq).takeWhile(x => x < 2)
        expect(sq).not.toHaveBeenCalled()
        expect(_seq(sq).takeWhile(x => x < 2)._qr).toEqual([1])
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("calls predicate as many times as needed", () => {
        const f = jest.fn(x => x < 2)
        const s = _seq([1, 2, 3, 4, 5]).takeWhile(f)
        for (const _ of s) {
        }
        expect(f).toHaveBeenCalledTimes(2)
    })

    it("doesn't insert ellipsis if no items are skipped", () => {
        const s = _seq([1, 2, 3]).takeWhile(() => true, "...")
        expect(s._qr).toEqual([1, 2, 3])
    })

    it("inserts ellipsis if all items are taken", () => {
        const s = _seq([1, 2, 3]).takeWhile(() => false, "...")
        expect(s._qr).toEqual(["..."])
    })

    it("inserts ellipsis if some items are taken", () => {
        const s = _seq([1, 2, 3]).takeWhile(x => x < 3, "...")
        expect(s._qr).toEqual([1, 2, "..."])
    })

    it("no ellipsis if it's nullish", () => {
        const s2 = _seq([1, 2, 3]).takeWhile(() => false, undefined)
        expect(s2._qr).toEqual([])
    })
})

describe("async", () => {
    const _seq = aseq
    type _Seq<T> = ASeq<T>
    describe("type tests", () => {
        declare.it("keeps same type as input when no ellipsis is given", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true))).to_equal(type<_Seq<number>>)
        })
        declare.it("disjunction with ellipsis if specified", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true, "..." as string))).to_equal(
                type<_Seq<number | string>>
            )
        })
        declare.it("ellipsis is const", expect => {
            expect(type_of(_seq([1]).takeWhile(() => true, "..."))).to_equal(
                type<_Seq<number | "...">>
            )
        })
    })

    it("immediate false gives empty", async () => {
        const s = _seq([1, 2, 3]).takeWhile(() => false)
        await expect(s._qr).resolves.toEqual([])
    })

    it("constant true gives same", async () => {
        const s = _seq([1, 2, 3]).takeWhile(() => true)
        await expect(s._qr).resolves.toEqual([1, 2, 3])
    })

    it("stops at first false", async () => {
        const s = _seq([1, 2, 3, 4, 5]).takeWhile(x => x < 3)
        await expect(s._qr).resolves.toEqual([1, 2])
    })

    it("stops at first false with index", async () => {
        const s = _seq([1, 2, 3, 4, 5]).takeWhile((x, i) => i < 3)
        await expect(s._qr).resolves.toEqual([1, 2, 3])
    })

    it("has no side-effects, pulls as many as needed", async () => {
        const sq = jest.fn(function* () {
            yield 1
            yield 2
            expect(false).toBe(true)
        })
        const tkw = _seq(sq).takeWhile(x => x < 2)
        expect(sq).not.toHaveBeenCalled()
        for await (const _ of tkw) {
        }
        expect(sq).toHaveBeenCalledTimes(1)
    })

    it("calls predicate as many times as needed", async () => {
        const f = jest.fn(x => x < 2)
        const s = _seq([1, 2, 3, 4, 5]).takeWhile(f)
        for await (const _ of s) {
        }
        await expect(f).toHaveBeenCalledTimes(2)
    })

    it("doesn't insert ellipsis if no items are skipped", async () => {
        const s = _seq([1, 2, 3]).takeWhile(() => true, "...")
        await expect(s._qr).resolves.toEqual([1, 2, 3])
    })

    it("inserts ellipsis if all items are taken", async () => {
        const s = _seq([1, 2, 3]).takeWhile(() => false, "...")
        await expect(s._qr).resolves.toEqual(["..."])
    })

    it("inserts ellipsis if some items are taken", async () => {
        const s = _seq([1, 2, 3]).takeWhile(x => x < 3, "...")
        await expect(s._qr).resolves.toEqual([1, 2, "..."])
    })
})
