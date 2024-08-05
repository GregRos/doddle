import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

const f = aseq
type SType<T> = ASeq<T>

declare.test("should type as LazyAsync<number>", expect => {
    expect(type_of(f([1, 2, 3]).sumBy(() => 1))).to_equal(type<LazyAsync<number>>)
})

it("returns 0 for empty", async () => {
    const s = f([]).sumBy(() => 1)
    expect(await s.pull()).toEqual(0)
})

it("sums input", async () => {
    const s = f([1, 2, 3]).sumBy(x => x)
    expect(await s.pull()).toEqual(6)
})

it("no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = f(fn)
    const lazy = s.sumBy(() => 1)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works for async iteratee", async () => {
    const s = f([1, 2, 3]).sumBy(async x => x)
    expect(await s.pull()).toEqual(6)
})
