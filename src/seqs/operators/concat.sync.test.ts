import { declare, type, type_of } from "declare-it"
import type { Seq } from "../seq/seq.class"

import { seq } from "../seq/seq.ctor"
const _seq = seq
type _Seq<T> = Seq<T>
describe("type tests", () => {
    const Seq_never = type<_Seq<never>>
    const s123 = _seq([1, 2, 3])
    declare.it("gives same type with no arguments", expect => {
        expect(type_of(s123.concat())).to_equal(type<_Seq<number>>)
    })
    declare.it("never stays never when given no args", expect => {
        expect(type_of(_seq().concat())).to_equal(Seq_never)
    })

    declare.it("disjunction with different element types", expect => {
        expect(type_of(s123.concat([""]))).to_equal(type<_Seq<number | string>>)
        expect(type_of(s123.concat([""], [], [true]))).to_equal(
            type<_Seq<number | string | boolean>>
        )
    })

    declare.it("disjunction with different input types", expect => {
        expect(type_of(s123.concat(_seq(), [1]))).to_equal(type<_Seq<number>>)
        expect(
            type_of(
                s123.concat(
                    _seq(),
                    function* () {
                        yield "aaa"
                    },
                    _seq.of(true, false)[Symbol.iterator]
                )
            )
        ).to_equal(type<_Seq<number | string | boolean>>)
    })
})

it("concats with no inputs", () => {
    const s = _seq([1, 2, 3]).concat()
    expect(s._qr).toEqual([1, 2, 3])
})

it("concats with one input", () => {
    const s = _seq([1, 2, 3]).concat([4, 5])
    expect(s._qr).toEqual([1, 2, 3, 4, 5])
})

it("concats with multiple inputs", () => {
    const s = _seq([1, 2, 3]).concat([4, 5], [6, 7])
    expect(s._qr).toEqual([1, 2, 3, 4, 5, 6, 7])
})

it("concats with different types of inputs", () => {
    const s = _seq([1, 2, 3]).concat(
        seq.of(4, 5),
        function* () {
            yield 6
        },
        () => seq.of(7)[Symbol.iterator]()
    )
    expect(s._qr).toEqual([1, 2, 3, 4, 5, 6, 7])
})

it("doesn't pull iterables before needed", () => {
    const fn = jest.fn(function* () {})
    const s = _seq.of(1, 2, 3).concat(fn)
    let i = 0
    for (const _ of s) {
        if (i++ < 3) {
            expect(fn).not.toHaveBeenCalled()
        } else {
            expect(fn).toHaveBeenCalledTimes(1)
        }
    }
})

it("only pulls as many elements as needed", () => {
    const fn = jest.fn(function* () {
        yield 1
        yield 2
        expect(true).toBe(false)
    })
    const s = _seq.of(1).concat(fn)
    let i = 0
    for (const _ of s) {
        if (i++ > 1) {
            break
        }
    }
})

it("concats to infinite", () => {
    const s = _seq.repeat(Infinity, 1).concat([2, 3])
    expect(s.take(3)._qr).toEqual([1, 1, 1])
})

it("calls projection as many times as needed", () => {
    const f = jest.fn(x => [x, x])
    const s = _seq([1, 2, 3]).concatMap(f)
    expect(f).not.toHaveBeenCalled()
    for (const x of s) {
        if (x === 2) {
            break
        }
    }
    expect(f).toHaveBeenCalledTimes(2)
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).concatMap(x => [x, `${x}`])
    expect(s._qr).toEqual([1, "1", 2, "2", 3, "3"])
    expect(s._qr).toEqual([1, "1", 2, "2", 3, "3"])
})
