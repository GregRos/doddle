import { aseq } from "../wrappers/aseq.ctor"
import { type ASeq } from "../wrappers/aseq.class"
import { seq } from "../wrappers/seq.ctor"
import { Seq } from "../wrappers/seq.class"
import { declare, type, type_of } from "declare-it"

describe("sync", () => {
    const _seq = seq
    type _Seq<T> = Seq<T>
    declare.describe("type tests", () => {
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
            seq.of(1, 2),
            function* () {
                yield 3
            },
            seq.of(4)[Symbol.iterator]
        )
        expect(s._qr).toEqual([1, 2, 3, 4])
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
            fail("should not pull next element")
        })
        const s = _seq.of(1).concat(fn)
        let i = 0
        for (const _ of s) {
            if (i++ > 3) {
                break
            }
        }
    })

    it("concats to infinite", () => {
        const s = _seq.repeat(1, Infinity).concat([2, 3])
        expect(s.take(3)._qr).toEqual([1, 1, 1])
    })
})

describe("async", () => {
    const _seq = aseq
    type _Seq<T> = ASeq<T>
    declare.describe("type tests", () => {
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
                        seq.of(1n),
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

    it("concats with no inputs", () => {
        const s = _seq([1, 2, 3]).concat()
        expect(s._qr).resolves.toEqual([1, 2, 3])
    })

    it("concats with one input", () => {
        const s = _seq([1, 2, 3]).concat([4, 5])
        expect(s._qr).resolves.toEqual([1, 2, 3, 4, 5])
    })

    it("concats with multiple inputs", () => {
        const s = _seq([1, 2, 3]).concat([4, 5], [6, 7])
        expect(s._qr).resolves.toEqual([1, 2, 3, 4, 5, 6, 7])
    })

    it("concats with different types of inputs", () => {
        const s = _seq([1, 2, 3]).concat(
            seq.of(1, 2),
            function* () {
                yield 3
            },
            seq.of(4)[Symbol.iterator]
        )
        expect(s._qr).resolves.toEqual([1, 2, 3, 4])
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
            fail("should not pull next element")
        })
        const s = _seq.of(1).concat(fn)
        let i = 0
        for await (const _ of s) {
            if (i++ > 3) {
                break
            }
        }
    })

    it("concats to infinite", () => {
        const s = _seq.repeat(1, Infinity).concat([2, 3])
        expect(s.take(3)._qr).resolves.toEqual([1, 1, 1])
    })
})
