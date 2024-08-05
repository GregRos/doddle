import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "../.."
import type { ASeq } from "../.."
import { aseq } from "../.."

const f = aseq
type SType<T> = ASeq<T>
declare.test("should type as LazyAsync<T | undefined>", expect => {
    expect(type_of(f([1, 2, 3]).findLast(() => true))).to_equal(type<LazyAsync<number | undefined>>)
})
declare.test("should type as LazyAsync<T | string> with alt", expect => {
    expect(type_of(f([1, 2, 3]).findLast(() => true, "alt" as string))).to_equal(
        type<LazyAsync<number | string>>
    )
})
declare.test("should type as LazyAsync<T | 'alt'> with alt", expect => {
    expect(type_of(f([1, 2, 3]).findLast(() => true, "alt"))).to_equal(
        type<LazyAsync<number | "alt">>
    )
})

it("returns undefined for empty", async () => {
    const s = f([]).findLast(() => true)
    expect(await s.pull()).toEqual(undefined)
})

it("returns undefined for no matches", async () => {
    const s = f([1, 2, 3]).findLast(() => false)
    expect(await s.pull()).toEqual(undefined)
})

it("returns alt for no matches with alt", async () => {
    const s = f([1, 2, 3]).findLast(() => false, "alt")
    expect(await s.pull()).toEqual("alt")
})

it("returns last match", async () => {
    const s = f([1, 2, 3, 4]).findLast(() => true)
    expect(await s.pull()).toEqual(4)
})

it("returns last match even with alt", async () => {
    const s = f([1, 2, 3, 4]).findLast(() => true, 10)
    expect(await s.pull()).toEqual(4)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = f(fn)
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
    const tkw = f(sq).findLast(() => true)
    expect(sq).not.toHaveBeenCalled()
    await tkw.pull()
    expect(sq).toHaveBeenCalledTimes(1)
})

it("calls predicate as many times as needed", async () => {
    const fn = jest.fn(x => x === 3)
    const s = f([1, 2, 3, 4, 3]).findLast(fn)
    await s.pull()
    expect(fn).toHaveBeenCalledTimes(5)
})

it("works for async predicates (true)", async () => {
    const s = f([1, 2, 3]).findLast(async x => x === 2)
    expect(await s.pull()).toEqual(2)
})

it("works for async predicates (false)", async () => {
    const s = f([1, 2, 3]).findLast(async x => x === 4)
    expect(await s.pull()).toEqual(undefined)
})
