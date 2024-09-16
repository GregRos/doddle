import type { ASeq } from "@lib"
import { aseq, type DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq
type _ASeq<T> = ASeq<T>

declare.it("accepts an input sequence, returns LazyAsync<boolean>", expect => {
    const s = null! as _ASeq<number>
    expect(type_of(s.seqEquals(s))).to_equal(type<DoddleAsync<boolean>>)
})

declare.it("accepts input sequence of subtype, returns LazyAsync<boolean>", expect => {
    const s1 = null! as _ASeq<number>
    const s2 = null! as _ASeq<1 | 2 | 3>
    expect(type_of(s1.seqEquals(s2))).to_equal(type<DoddleAsync<boolean>>)
})

declare.it("accepts input sequence of supertype, returns LazyAsync<boolean>", expect => {
    const s1 = null! as _ASeq<1 | 2 | 3>
    const s2 = null! as _ASeq<number>
    expect(type_of(s1.seqEquals(s2))).to_equal(type<DoddleAsync<boolean>>)
})

it("returns true for empty sequences", async () => {
    const s = _aseq([]).seqEquals(_aseq([]))
    expect(await s.pull()).toEqual(true)
})

it("returns false for empty vs singleton", async () => {
    const s = _aseq([]).seqEquals(_aseq([1]))
    expect(await s.pull()).toEqual(false)
})

it("returns true for same sequence", async () => {
    const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2, 3]))
    expect(await s.pull()).toEqual(true)
})

it("returns false for different sequences", async () => {
    const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2, 4]))
    expect(await s.pull()).toEqual(false)
})

it("returns false for different lengths", async () => {
    const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2]))
    expect(await s.pull()).toEqual(false)
})

it("returns false for different elements", async () => {
    const s = _aseq([1, 2, 3]).seqEquals(_aseq([1, 2, "3"]))
    expect(await s.pull()).toEqual(false)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const s = _aseq(fn)
    const lazy = s.seqEquals(s)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("accepts different seq input types", async () => {
    const s1 = _aseq([1, 2])
    expect(
        await s1
            .seqEquals(async function* () {
                yield 1
                yield 2
            })
            .pull()
    ).toEqual(true)
    expect(
        await s1
            .seqEquals(function* () {
                yield 1
                yield 2
            })
            .pull()
    ).toEqual(true)
    expect(await s1.seqEquals([1, 2]).pull()).toEqual(true)
    expect(await s1.seqEquals(() => s1[Symbol.asyncIterator]()).pull()).toEqual(true)
})
