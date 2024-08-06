import type { ASeq } from "@lib"
import { aseq, type LazyAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq
type _Seq<T> = ASeq<T>

declare.it("accepts an input sequence, returns LazyAsync<boolean>", expect => {
    const s = null! as _Seq<number>
    expect(type_of(s.setEquals(s))).to_equal(type<LazyAsync<boolean>>)
})

declare.it("accepts input sequence of subtype, returns LazyAsync<boolean>", expect => {
    const s1 = null! as _Seq<number>
    const s2 = null! as _Seq<1 | 2 | 3>
    expect(type_of(s1.setEquals(s2))).to_equal(type<LazyAsync<boolean>>)
})

declare.it("accepts input sequence of supertype, returns LazyAsync<boolean>", expect => {
    const s1 = null! as _Seq<1 | 2 | 3>
    const s2 = null! as _Seq<number>
    expect(type_of(s1.setEquals(s2))).to_equal(type<LazyAsync<boolean>>)
})

declare.it("doesn't accept non-subtype, non-supertype inputs", expect => {
    const s1 = null! as _Seq<1 | 2>
    const s2 = null! as _Seq<2 | 3>
    // @ts-expect-error
    s1.setEquals(s2)
})

it("returns true for empty sequences", async () => {
    const s = _aseq([]).setEquals(_aseq([]))
    expect(await s.pull()).toEqual(true)
})

it("returns false for empty vs singleton", async () => {
    const s = _aseq([]).setEquals(_aseq([1]))
    expect(await s.pull()).toEqual(false)
})

it("returns true for same sequence", async () => {
    const s = _aseq([1, 2, 3]).setEquals(_aseq([1, 2, 3]))
    expect(await s.pull()).toEqual(true)
})

it("returns true for same sequence in different order", async () => {
    const s = _aseq([1, 2, 3]).setEquals(_aseq([3, 2, 1]))
    expect(await s.pull()).toEqual(true)
})

it("returns false for different sequences", async () => {
    const s = _aseq([1, 2, 3]).setEquals(_aseq([1, 2, 4]))
    expect(await s.pull()).toEqual(false)
})

it("returns false for subsets", async () => {
    const s = _aseq([1, 2, 3]).setEquals(_aseq([1, 2]))
    expect(await s.pull()).toEqual(false)
})

it("returns false for different elements", async () => {
    const s = _aseq([1, 2, 3]).setEquals(_aseq([1, 2, "3"]))
    expect(await s.pull()).toEqual(false)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const s = _aseq(fn)
    const lazy = s.setEquals(s)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("accepts different seq input types", async () => {
    const s1 = _aseq([1, 2])
    expect(
        await s1
            .setEquals(async function* () {
                yield 1
                yield 2
            })
            .pull()
    ).toEqual(true)
    expect(await s1.setEquals([1, 2]).pull()).toEqual(true)
    expect(await s1.setEquals(() => s1[Symbol.asyncIterator]()).pull()).toEqual(true)
})
