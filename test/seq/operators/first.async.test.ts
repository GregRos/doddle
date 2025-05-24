import type { DoddleAsync } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq

declare.it("correctly typed as DoddleAsync and disjunction with undefined if no alt", expect => {
    const s = _seq([1, 2, 3]).first()
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

it("gets first element", async () => {
    const s = _seq([1, 2, 3]).first()
    expect(await s.pull()).toEqual(1)
})

it("gets undefined for empty", async () => {
    const s = _seq([]).first()
    expect(await s.pull()).toEqual(undefined)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const doddle = s.first()
    expect(fn).not.toHaveBeenCalled()
    await doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).first()
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})
