import type { Doddle, Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("is typed correctly", expect => {
    const s = _seq([1, 2, 3]).toRecord(x => [x, x])
    expect(type_of(s)).to_equal(type<Doddle<Record<number, number>>>)
})

declare.it("does not allow invalid keys", expect => {
    // @ts-expect-error does not allow invalid keys
    const s = _seq([1, 2, 3]).toRecord(x => [{}, x])
})

declare.it("allows symbol string and number keys", expect => {
    const sym = Symbol("test")
    const s = _seq([1, 2, 3]).toRecord(x => {
        return [0 as symbol | string | number, 0 as unknown]
    })
    expect(type_of(s)).to_equal(type<Doddle<Record<number | symbol | string, unknown>>>)
})

declare.it("literal key types produce known object types", expect => {
    const s = _seq([1, 2, 3]).toRecord(x => [x > 1 ? "a" : "b", x])
    expect(type_of(s)).to_equal(
        type<
            Doddle<{
                a: number
                b: number
            }>
        >
    )
})

declare.it("literal element types produce known object types", expect => {
    type Any123 = 1 | 2 | 3
    const s = _seq([1, 2, 3] as const).toRecord(x => [x, x])
    expect(type_of(s)).to_equal(
        type<
            Doddle<{
                1: Any123
                2: Any123
                3: Any123
            }>
        >
    )
})

declare.it("empty seq gives Record<never, never>", expect => {
    const s = _seq([]).toRecord(x => [x, x])
    expect(type_of(s)).to_equal(type<Doddle<Record<never, never>>>)
})

it("works for empty object", () => {
    expect(
        seq([])
            .toRecord(x => [x, x])
            .pull()
    ).toEqual({})
})

it("works for non empty object", () => {
    expect(
        seq([1, 2, 3])
            .toRecord(x => [x, x])
            .pull()
    ).toEqual({ 1: 1, 2: 2, 3: 3 })
})

it("works for symbol keys", () => {
    const sym = Symbol("test")
    expect(
        seq([1])
            .toRecord(x => [sym, x])
            .pull()
    ).toEqual({ [sym]: 1 })
})
