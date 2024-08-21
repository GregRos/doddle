import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
import { _iter } from "@utils"
const _seq = aseq
type _Seq<T> = ASeq<T>
describe("type tests", () => {
    const Seq_never = type<_Seq<never>>
    const s123 = _seq([1, 2, 3])
    declare.it("gives same type with no arguments", expect => {
        expect(type_of(s123.concat())).to_equal(type<_Seq<number>>)
    })
    declare.it("never stays never when given no args", expect => {
        expect(type_of(_seq.empty().concat())).to_equal(Seq_never)
    })

    declare.it("disjunction with different element types", expect => {
        expect(type_of(s123.concat([""]))).to_equal(type<_Seq<number | string>>)
        expect(type_of(s123.concat([""], [], [true]))).to_equal(
            type<_Seq<number | string | boolean>>
        )
    })

    declare.it("disjunction with different input types", expect => {
        expect(type_of(s123.concat(_seq.empty(), [1]))).to_equal(type<_Seq<number>>)
        expect(
            type_of(
                s123.concat(
                    _seq.empty(),
                    function* () {
                        yield "aaa"
                    },
                    seq.of(1n as bigint),
                    async function* () {
                        yield null
                    },
                    _seq.of(true, false)[Symbol.asyncIterator],
                    seq.of(undefined)[Symbol.iterator]
                )
            )
        ).to_equal(type<_Seq<number | string | boolean | bigint | null | undefined>>)
    })
})

it("concats with no inputs", async () => {
    const s = _seq([1, 2, 3]).concat()
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})

it("concats with one input", async () => {
    const s = _seq([1, 2, 3]).concat([4, 5])
    await expect(s._qr).resolves.toEqual([1, 2, 3, 4, 5])
})

it("concats with multiple inputs", async () => {
    const s = _seq([1, 2, 3]).concat([4, 5], [6, 7])
    await expect(s._qr).resolves.toEqual([1, 2, 3, 4, 5, 6, 7])
})

it("concats with different types of inputs", async () => {
    const s = _seq([1, 2, 3]).concat(
        seq.of(4, 5),
        function* () {
            yield 6
        },
        () => _iter(seq.of(7))
    )
    await expect(s._qr).resolves.toEqual([1, 2, 3, 4, 5, 6, 7])
})

it("doesn't pull iterables before needed", async () => {
    const fn = jest.fn(function* () {})
    const s = _seq.of(1, 2, 3).concat(fn)
    let i = 0
    for await (const _ of s) {
        if (i++ < 3) {
            expect(fn).not.toHaveBeenCalled()
        } else {
            expect(fn).toHaveBeenCalledTimes(1)
        }
    }
})

it("only pulls as many elements as needed", async () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        expect(true).toBe(false)
    })
    const s = _seq.of(1).concat(fn)
    let i = 0
    for await (const _ of s) {
        if (i++ > 1) {
            break
        }
    }
})

it("concats to infinite", async () => {
    const s = _seq.repeat(Infinity, 1).concat([2, 3])
    await expect(s.take(3)._qr).resolves.toEqual([1, 1, 1])
})

it("calls projection as many times as needed", async () => {
    const f = jest.fn(x => [x, x])
    const s = _seq([1, 2, 3]).concatMap(f)
    expect(f).not.toHaveBeenCalled()
    for await (const x of s) {
        if (x === 2) {
            break
        }
    }
    expect(f).toHaveBeenCalledTimes(2)
})

it("can iterate twice", async () => {
    const s = _seq([1, 2, 3]).concatMap(x => [x, `${x}`])
    await expect(s._qr).resolves.toEqual([1, "1", 2, "2", 3, "3"])
    await expect(s._qr).resolves.toEqual([1, "1", 2, "2", 3, "3"])
})
