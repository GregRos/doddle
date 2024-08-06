import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../../index.js"
import { aseq } from "../../index.js"

const _seq = aseq
declare.test("should type as LazyAsync<boolean>", expect => {
    expect(type_of(_seq([1, 2, 3]).includes(1))).to_equal(type<LazyAsync<boolean>>)
})
it("returns false for empty", async () => {
    const s = _seq([]).includes(1)
    expect(await s.pull()).toEqual(false)
})

it("returns false for no matches", async () => {
    const s = _seq([1, 2, 3]).includes(4)
    expect(await s.pull()).toEqual(false)
})

it("returns true for match", async () => {
    const s = _seq([1, 2, 3]).includes(2)
    expect(await s.pull()).toEqual(true)
})
it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
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
    const tkw = _seq(sq).includes(1)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
