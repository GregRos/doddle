import type { DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

import { aseq } from "@lib"
const _seq = aseq

declare.it("is typed correctly", expect => {
    const s = _seq([1, 2, 3]).toRecord(x => [x, x])
    expect(type_of(s)).to_equal(type<DoddleAsync<Record<number, number>>>)
})

declare.it("does not allow invalid keys", expect => {
    // @ts-expect-error does not allow invalid keys
    const _ = _seq([1, 2, 3]).toRecord(x => [{}, x])
})

declare.it("allows symbol string and number keys", expect => {
    const s = _seq([1, 2, 3]).toRecord(x => {
        return [0 as symbol | string | number, 0 as unknown]
    })
    expect(type_of(s)).to_equal(type<DoddleAsync<Record<number | symbol | string, unknown>>>)
})

declare.it("literal key types produce known object types", expect => {
    const s = _seq([1, 2, 3]).toRecord(x => [x > 1 ? "a" : "b", x])
    expect(type_of(s)).to_equal(
        type<
            DoddleAsync<{
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
            DoddleAsync<{
                1: Any123
                2: Any123
                3: Any123
            }>
        >
    )
})

declare.it("empty seq gives Record<never, never>", expect => {
    const s = _seq([]).toRecord(x => [x, x])
    expect(type_of(s)).to_equal(type<DoddleAsync<Record<never, never>>>)
})

it("works for empty object", async () => {
    await expect(
        aseq([])
            .toRecord(x => [x, x])
            .pull()
    ).resolves.toEqual({})
})

it("works for non empty object", async () => {
    await expect(
        aseq([1, 2, 3])
            .toRecord(x => [x, x])
            .pull()
    ).resolves.toEqual({ 1: 1, 2: 2, 3: 3 })
})

it("works for symbol keys", async () => {
    const sym = Symbol("test")
    await expect(
        aseq([1])
            .toRecord(x => [sym, x])
            .pull()
    ).resolves.toEqual({ [sym]: 1 })
})
