import { declare, type, type_of } from "declare-it"

import type { ASeq, Seq } from "@lib"
import { aseq } from "@lib"
const _seq = aseq
type _Seq<T> = ASeq<T>
declare.it("element type becomes array when array is used", expect => {
    const s = _seq([1, 2, 3]).collect("array")
    expect(type_of(s)).to_equal(type<_Seq<number[]>>)
})

declare.it("no change if item", expect => {
    const s = _seq([1, 2, 3]).collect("item")
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

declare.it("seq if seq", expect => {
    const s = _seq([1, 2, 3]).collect("seq")
    expect(type_of(s)).to_equal(type<_Seq<Seq<number>>>)
})

it("doesn't change the values", async () => {
    const items = _seq([1, 2, 3])
    await expect(items.collect("array")._qr).resolves.toEqual([[1, 2, 3]])
})

it("all side-effects occur after first element", async () => {
    const mock = jest.fn()
    const items = _seq([1, 2, 3]).map(mock).collect()
    for await (const x of items) {
        expect(mock).toHaveBeenCalledTimes(3)
    }
})

it("no side-effects before pull", async () => {
    const mock = jest.fn()
    const items = _seq([1, 2, 3]).map(mock).collect()
    expect(mock).not.toHaveBeenCalled()
})
