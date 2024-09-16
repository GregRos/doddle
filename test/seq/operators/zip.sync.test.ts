import { declare, type, type_of } from "declare-it"

import { doddle, seq } from "@lib"

import type { Seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>
declare.it(
    "when input is tuple, typed as length N tuple with possibly undefined elements",
    expect => {
        expect(type_of(_seq.of(1, 2, 3).zip([["a", "b"]]))).to_equal(
            type<_Seq<[1 | 2 | 3 | undefined, string | undefined]>>
        )
    }
)

declare.it("using as number once should expand the type", expect => {
    const s = _seq.of(1 as number, 2, 3).zip([["a", "b"]])
    expect(type_of(s)).to_equal(type<_Seq<[number | undefined, string | undefined]>>)
})

declare.it("can't be called using an array input, as it would be ambiguous", () => {
    // @ts-expect-error
    _seq([1, 2, 3]).zip([[]] as string[][])
})

declare.it("can't be called on empty array input, as it would be ambiguous", () => {
    // @ts-expect-error
    _seq([]).zip([])
})

declare.it("when input is tuple, projection arguments type has length 2", expect => {
    _seq([1, 2, 3]).zip([["a", "b"]], (a, b) => {
        expect(type_of(a)).to_equal(type<number | undefined>)
        expect(type_of(b)).to_equal(type<string | undefined>)
    })
    _seq([1, 2, 3]).zip([["a", "b"]], (...args) => {
        expect(type_of(args)).to_equal(type<[number | undefined, string | undefined]>)
    })
})

declare.it("when input is 1-∞ length tuple, projection arguments type has length 1-N", expect => {
    _seq([1, 2, 3]).zip([["a", "b"]] as [string[], ...string[][]], (a, ...rest) => {
        expect(type_of(a)).to_equal(type<number | undefined>)
        expect(type_of(rest)).to_equal(type<[string | undefined, ...(string | undefined)[]]>)
    })
    _seq([1, 2, 3]).zip([["a", "b"]] as [string[], ...string[][]], (a, b, c) => {
        expect(type_of(a)).to_equal(type<number | undefined>)
        expect(type_of(b)).to_equal(type<string | undefined>)
        expect(type_of(c)).to_equal(type<string | undefined>)
    })
})

declare.it("zip with [[]] gives [X | undefined, undefined] elements", expect => {
    expect(type_of(_seq([1, 2, 3]).zip([[]]))).to_equal(type<_Seq<[number | undefined, undefined]>>)
})

declare.it("zip empty arrays gives type [undefined, undefined]", expect => {
    const s = _seq([]).zip([[]])
    expect(type_of(s)).to_equal(type<_Seq<[undefined, undefined]>>)
})

declare.it("zip with projection gives projection type", expect => {
    const s = _seq([1, 2, 3]).zip([["a", "b"]], (a, b) => a + b!)
    expect(type_of(s)).to_equal(type<_Seq<string>>)
})

it("zip [] with [[]] gives empty", () => {
    const s = _seq([]).zip([[]])
    expect(s._qr).toEqual([])
})

it("zips with [[]] gives [X, undefined]", () => {
    const s = _seq([1, 2, 3]).zip([[]])
    expect(s._qr).toEqual([
        [1, undefined],
        [2, undefined],
        [3, undefined]
    ])
})

it("zips 1 + 1", () => {
    const s = _seq([1, 2, 3]).zip([["a", "b", "c"]])
    expect(s._qr).toEqual([
        [1, "a"],
        [2, "b"],
        [3, "c"]
    ])
})

it("zips 1 + 2", () => {
    const s = _seq([1, 2, 3]).zip([
        ["a", "b"],
        ["c", "d"]
    ])
    expect(s._qr).toEqual([
        [1, "a", "c"],
        [2, "b", "d"],
        [3, undefined, undefined]
    ])
})

it("zips length 3 + length 1 pads with undefined", () => {
    const s = _seq([1, 2, 3]).zip([["a"]])
    expect(s._qr).toEqual([
        [1, "a"],
        [2, undefined],
        [3, undefined]
    ])
})

it("zips length 1 + length 3 pads with undefined", () => {
    const s = _seq([1]).zip([
        ["a", "b"],
        ["c", "d"]
    ])
    expect(s._qr).toEqual([
        [1, "a", "c"],
        [undefined, "b", "d"]
    ])
})

it("zips empty with empty gives empty with projection", () => {
    const s = _seq([]).zip([[]], () => 1)
    expect(s._qr).toEqual([])
})

it("calls projection on zipped elements", () => {
    const s = _seq([1, 2, 3]).zip([["a", "b"]], (a, b) => [a, b].join(""))
    expect(s._qr).toEqual(["1a", "2b", "3"])
})

it("projection receives some args as undefined", () => {
    const s = _seq([1, 2, 3]).zip([["a", "b"], [1]], (a, b, c) => [a, b, c].join(""))
    expect(s._qr).toEqual(["1a1", "2b", "3"])
})

it("handles undefined in sequence but doesn't distinguish", () => {
    const s = _seq([1, 2, 3]).zip([["a", undefined, "c"]])
    expect(s._qr).toEqual([
        [1, "a"],
        [2, undefined],
        [3, "c"]
    ])
})

it("doesn't pull more than necessary", () => {
    const each = jest.fn()
    const iter = jest.fn(function* () {
        yield 1
        yield 2
        fail("should not pull next element")
    })
    const s = _seq(iter).each(each)
    const zipped = s.zip([[]])
    expect(iter).not.toHaveBeenCalled()
    expect(each).not.toHaveBeenCalled()
    for (const _ of zipped) {
        break
    }
    expect(iter).toHaveBeenCalledTimes(1)
    expect(each).toHaveBeenCalledTimes(1)
})

it("can iterate twice", () => {
    const s = _seq([1, 2, 3]).zip([["a", "b"]])
    expect(s._qr).toEqual([
        [1, "a"],
        [2, "b"],
        [3, undefined]
    ])

    expect(s._qr).toEqual([
        [1, "a"],
        [2, "b"],
        [3, undefined]
    ])
})

it("works with lazy projection", () => {
    const s = _seq([1, 2, 3]).zip([["a", "b"]], (a, b) => doddle(() => `${a}${b}`))
    expect(s._qr).toEqual(["1a", "2b", "3undefined"])
})
