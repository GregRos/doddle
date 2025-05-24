import { declare, type, type_of } from "declare-it"

import type { Doddle, Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("returns a Doddle<Map<K, V>>", expect => {
    const input = _seq([1, 2, 3])
    const after = input.toMapBy(x => `${x}`)
    expect(type_of(after)).to_equal(type<Doddle<Map<string, number>>>)
})

it("works on empty", () => {
    const s = _seq([]).toMapBy(x => x)
    expect(s.pull()).toEqual(new Map())
})

it("works on non-empty", () => {
    const s = _seq([1, 2, 3]).toMapBy(x => x)
    expect(s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("works on non-empty with key function", () => {
    const s = _seq([1, 2, 3]).toMapBy(x => `${x}`)
    expect(s.pull()).toEqual(
        new Map([
            ["1", 1],
            ["2", 2],
            ["3", 3]
        ])
    )
})

it("takes last value for duplicate keys", () => {
    const s = _seq([1, 2, 3, 2]).toMapBy(x => x)
    expect(s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})

it("works with duplicates in source", () => {
    const s = _seq([1, 2, 3, 2]).toMapBy(x => x)
    expect(s.pull()).toEqual(
        new Map([
            [1, 1],
            [2, 2],
            [3, 3]
        ])
    )
})
