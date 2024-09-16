import type { DoddleAsync } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
declare.test("should type as LazyAsync<T | undefined>", expect => {
    expect(type_of(_seq([1, 2, 3]).findLast(() => true))).to_equal(
        type<DoddleAsync<number | undefined>>
    )
})
declare.test("should type as LazyAsync<T | string> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).findLast(() => true, "alt" as string))).to_equal(
        type<DoddleAsync<number | string>>
    )
})
declare.test("should type as LazyAsync<T | 'alt'> with alt", expect => {
    expect(type_of(_seq([1, 2, 3]).findLast(() => true, "alt"))).to_equal(
        type<DoddleAsync<number | "alt">>
    )
})

declare.test("allows lazy predicate", expect => {
    const s = _seq([1, 2, 3]).findLast(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

declare.test("allows lazy async predicate", expect => {
    const s = _seq([1, 2, 3]).findLast(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

declare.test("allows async lazy async predicate", expect => {
    const s = _seq([1, 2, 3]).findLast(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<number | undefined>>)
})

it("returns undefined for empty", async () => {
    const s = _seq([]).findLast(() => true)
    expect(await s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", async () => {
    const s = _seq([1, 2, 3]).findLast(() => false)
    expect(await s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", async () => {
    const s = _seq([1, 2, 3]).findLast(() => false, "alt")
    expect(await s.pull()).toEqual("alt")
})

it("returns last match", async () => {
    const s = _seq([1, 2, 3, 4]).findLast(() => true)
    expect(await s.pull()).toEqual(4)
})

it("returns last match even with alt", async () => {
    const s = _seq([1, 2, 3, 4]).findLast(() => true, 10)
    expect(await s.pull()).toEqual(4)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const lazy = s.findLast(() => true)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const tkw = _seq(sq).findLast(() => true)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", async () => {
    const fn = jest.fn(x => x === 3)
    const s = _seq([1, 2, 3, 4, 3]).findLast(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(5)
})

it("works for async predicates (true)", async () => {
    const s = _seq([1, 2, 3]).findLast(async x => x === 2)
    expect(await s.pull()).toEqual(2)
})

it("works for async predicates (false)", async () => {
    const s = _seq([1, 2, 3]).findLast(async x => x === 4)
    expect(await s.pull()).toEqual(undefined)
})

it("allows lazy predicate", async () => {
    const s = _seq([1, 2, 3]).findLast(i => doddle(() => i < 3))
    expect(await s.pull()).toEqual(2)
})

it("allows lazy async predicate", async () => {
    const s = _seq([1, 2, 3]).findLast(i => doddle(async () => i < 3))
    expect(await s.pull()).toEqual(2)
})

it("allows async lazy predicate", async () => {
    const s = _seq([1, 2, 3]).findLast(async i => doddle(() => i < 3))
    expect(await s.pull()).toEqual(2)
})

it("allows async lazy async predicate", async () => {
    const s = _seq([1, 2, 3]).findLast(async i => doddle(async () => i < 3))
    expect(await s.pull()).toEqual(2)
})
