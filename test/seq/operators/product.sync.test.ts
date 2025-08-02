import type { Seq } from "@lib"
import { seq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = seq
type _Seq<T> = Seq<T>
declare.it("fails on array of values", expect => {
    // @ts-expect-error product expects an array of sequences
    _seq([]).product([1])
})

declare.it("empty input gives singletons", expect => {
    const a = _seq<number>([]).product([])
    expect(type_of(a)).to_equal(type<_Seq<[number]>>)
})

declare.it("number, string gives number×string", expect => {
    const s = _seq<number>([]).product([_seq<string>([])])
    expect(type_of(s)).to_equal(type<_Seq<[number, string]>>)
})

declare.it("number, string, boolean gives number×string×boolean", expect => {
    const s = _seq<number>([]).product([_seq<string>([]), _seq<boolean>([])])
    expect(type_of(s)).to_equal(type<_Seq<[number, string, boolean]>>)
})

declare.it("projection to string", expect => {
    const a = _seq<number>([])
    const b = _seq<object>([])
    const product = a.product([b], (x, y) => {
        expect(type_of(x)).to_equal(type<number>())
        expect(type_of(y)).to_equal(type<object>())
        return ""
    })
    expect(type_of(product)).to_equal(type<_Seq<string>>)
})

declare.it("array input → min tuple", expect => {
    const a = _seq<number>([])
    const b = _seq<number>([])
    const arr = [b]
    const product = a.product(arr)
    expect(type_of(product)).to_equal(type<_Seq<[number, ...number[]]>>)
})

it("works on empty", () => {
    const empty = _seq([])
    const product = empty.product([empty, empty, empty])
    expect(product._qr).toEqual([])
})

it("works on 1", () => {
    const single = _seq([1] as const)
    const product = single.product([])
    expect(product._qr).toEqual([[1]])
})

it("works on 1 × 0 = 0", () => {
    const single = _seq([1] as const)
    const empty = _seq([] as const)
    const product = single.product([empty])
    expect(product._qr).toEqual([])
})

it("works on 1 × 1 × 1 × 0 = 0", () => {
    const empty = _seq([] as const)
    const one = _seq([1] as const)
    const product = one.product([one, one, empty])
    expect(product._qr).toEqual([])
})

it("works on 1³ = 1", () => {
    const single = _seq([1] as const)
    const product = single.product([single, single])
    expect(product._qr).toEqual([[1, 1, 1]])
})

it("works on 2² = 4", () => {
    const single = _seq([1, 2] as const)
    const product = single.product([[3, 4]])
    expect(product._qr).toEqual([
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4]
    ])
})

it("works on 2³ = 8", () => {
    const triples = _seq([1, 2] as const).product([
        [3, 4],
        [5, 6]
    ])
    expect(triples._qr).toEqual([
        [1, 3, 5],
        [1, 3, 6],
        [1, 4, 5],
        [1, 4, 6],
        [2, 3, 5],
        [2, 3, 6],
        [2, 4, 5],
        [2, 4, 6]
    ])
})

it("works on 2×3 = 6", () => {
    const a = _seq([1, 2] as const)
    const b = _seq([3, 4, 5] as const)
    const product = a.product([b])
    expect(product._qr).toEqual([
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [2, 4],
        [2, 5]
    ])
})

it("has no side-effects before pull, pulls only once", () => {
    const fn = jest.fn(function* () {
        yield 1
    })
    const s = _seq(fn)
    const result = s.product([[1, 2]])
    expect(fn).not.toHaveBeenCalled()
    for (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})
