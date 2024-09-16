import type { DoddleAsync } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
declare.test("should type as Doddle<boolean>", expect => {
    expect(type_of(_seq([1, 2, 3]).every(() => true))).to_equal(type<DoddleAsync<boolean>>)
})
declare.test("allows doddle predicate", expect => {
    const s = _seq([1, 2, 3]).every(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<boolean>>)
})

declare.test("allows doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).every(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<boolean>>)
})

declare.test("allows async doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).every(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<boolean>>)
})
it("returns true for empty", async () => {
    const s = _seq([]).every(() => false)
    expect(await s.pull()).toEqual(true)
})

it("returns false for no matches", async () => {
    const s = _seq([1, 2, 3]).every(() => false)
    expect(await s.pull()).toEqual(false)
})

it("returns true for all matches", async () => {
    const s = _seq([1, 2, 3]).every(() => true)
    expect(await s.pull()).toEqual(true)
})
it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const doddle = s.every(() => true)
    expect(fn).not.toHaveBeenCalled()
    await doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed when false", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(false).toBe(true)
    })
    const tkw = _seq(sq).every(() => false)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed when true", async () => {
    const fn = jest.fn(() => true)
    const s = _seq([1, 2, 3]).every(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(3)
})

it("calls predicate as many times as needed when false", async () => {
    const fn = jest.fn(() => false)
    const s = _seq([1, 2, 3]).every(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("works for async predicates (true)", async () => {
    const s = _seq([1, 2, 3]).every(async x => x !== 4)
    expect(await s.pull()).toEqual(true)
})

it("works for async predicates (false)", async () => {
    const s = _seq([1, 2, 3]).every(async x => x !== 2)
    expect(await s.pull()).toEqual(false)
})

it("allows doddle predicate", async () => {
    const s = _seq([1, 2, 3]).every(i => doddle(() => i === 0))
    expect(await s.pull()).toEqual(false)
})

it("allows doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).every(i => doddle(async () => i === 0))
    expect(await s.pull()).toEqual(false)
})

it("allows async doddle predicate", async () => {
    const s = _seq([1, 2, 3]).every(async i => doddle(() => i === 0))
    expect(await s.pull()).toEqual(false)
})

it("allows async doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).every(async i => doddle(async () => i === 0))
    expect(await s.pull()).toEqual(false)
})
