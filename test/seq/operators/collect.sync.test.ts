import { declare, type, type_of } from "declare-it"

import type { Seq } from "@lib"
import { seq } from "@lib"
const _seq = seq
type _Seq<T> = Seq<T>

declare.it("no change if item", expect => {
    const s = _seq([1, 2, 3]).collect()
    expect(type_of(s)).to_equal(type<_Seq<number>>)
})

it("all side-effects occur after first element", () => {
    const mock = jest.fn()
    const items = _seq([1, 2, 3]).map(mock).collect()
    for (const _ of items) {
        expect(mock).toHaveBeenCalledTimes(3)
    }
})

it("no side-effects before pull", () => {
    const mock = jest.fn()
    _seq([1, 2, 3]).map(mock).collect()
    expect(mock).not.toHaveBeenCalled()
})
