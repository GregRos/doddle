import { declare, type, type_of } from "declare-it"
import type { Lazy } from "../.."
import type { Seq } from "../.."

import { seq } from "../.."
const _seq = seq
type SType<T> = Seq<T>

declare.test("should type as Lazy<number>", expect => {
    expect(type_of(_seq([1, 2, 3]).sumBy(() => 1))).to_equal(type<Lazy<number>>)
})
it("returns 0 for empty", () => {
    const s = _seq([]).sumBy(() => 1)
    expect(s.pull()).toEqual(0)
})

it("sums input", () => {
    const s = _seq([1, 2, 3]).sumBy(x => x)
    expect(s.pull()).toEqual(6)
})

it("no side-effects before pull", () => {
    const fn = jest.fn(function* () {})
    const s = _seq(fn)
    const lazy = s.sumBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})
