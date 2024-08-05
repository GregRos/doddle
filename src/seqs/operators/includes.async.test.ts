import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../../lazy"
import type { ASeq } from "../seq/aseq.class"
import { aseq } from "../seq/aseq.ctor"

const f = aseq
type SType<T> = ASeq<T>
declare.test("should type as LazyAsync<boolean>", expect => {
    expect(type_of(f([1, 2, 3]).includes(1))).to_equal(type<LazyAsync<boolean>>)
})
it("returns false for empty", async () => {
    const s = f([]).includes(1)
    expect(await s.pull()).toEqual(false)
})

it("returns false for no matches", async () => {
    const s = f([1, 2, 3]).includes(4)
    expect(await s.pull()).toEqual(false)
})

it("returns true for match", async () => {
    const s = f([1, 2, 3]).includes(2)
    expect(await s.pull()).toEqual(true)
})
it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = f(fn)
    const lazy = s.includes(1)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = f(sq).includes(1)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
