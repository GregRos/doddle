import type { DoddleAsync } from "@lib"
import { aseq, doddle } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq

declare.test("should type as DoddleAsync<boolean>", expect => {
    expect(type_of(_seq([1, 2, 3]).some(() => true))).to_equal(type<DoddleAsync<boolean>>)
})

declare.test("allows doddle predicate", expect => {
    const s = _seq([1, 2, 3]).some(() => doddle(() => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<boolean>>)
})

declare.test("allows doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).some(() => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<boolean>>)
})

declare.test("allows async doddle async predicate", expect => {
    const s = _seq([1, 2, 3]).some(async () => doddle(async () => true))
    expect(type_of(s)).to_equal(type<DoddleAsync<boolean>>)
})

it("returns false for empty", async () => {
    const s = _seq([]).some(() => true)
    expect(await s.pull()).toEqual(false)
})

it("works for async predicates (true)", async () => {
    const s = _seq([1, 2, 3]).some(async x => x === 2)
    expect(await s.pull()).toEqual(true)
})

it("works for async predicates (false)", async () => {
    const s = _seq([1, 2, 3]).some(async x => x === 4)
    expect(await s.pull()).toEqual(false)
})
it("returns false for no matches", async () => {
    const s = _seq([1, 2, 3]).some(() => false)
    expect(await s.pull()).toEqual(false)
})

it("returns true for at least one match", async () => {
    const s = _seq([1, 2, 3]).some(x => x === 2)
    expect(await s.pull()).toEqual(true)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const doddle = s.some(() => true)
    expect(fn).not.toHaveBeenCalled()
    await doddle.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("pulls as many as needed when true", async () => {
    const sq = jest.fn(async function* () {
        yield 1
        expect(true).toBe(true)
    })
    const tkw = _seq(sq).some(() => true)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate until first match found", async () => {
    const fn = jest.fn(x => x > 1)
    const s = _seq([1, 2, 3]).some(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("works with async predicate (true)", async () => {
    const s = _seq([1, 2, 3]).some(async () => true)
    expect(await s.pull()).toEqual(true)
})

it("works with async predicate (false)", async () => {
    const s = _seq([1, 2, 3]).some(async () => false)
    expect(await s.pull()).toEqual(false)
})

it("allows doddle predicate", async () => {
    const s = _seq([1, 2, 3]).some(i => doddle(() => i === 2))
    expect(await s.pull()).toEqual(true)
})

it("allows doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).some(i => doddle(async () => i === 2))
    expect(await s.pull()).toEqual(true)
})

it("allows async doddle predicate", async () => {
    const s = _seq([1, 2, 3]).some(async i => doddle(() => i === 2))
    expect(await s.pull()).toEqual(true)
})

it("allows async doddle async predicate", async () => {
    const s = _seq([1, 2, 3]).some(async i => doddle(async () => i === 2))
    expect(await s.pull()).toEqual(true)
})
