import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _aseq = aseq
type _Seq<T> = ASeq<T>

declare.it("should type as _Seq<T>", expect => {
    expect(type_of(_aseq([1, 2, 3]).cache())).to_equal(type<_Seq<number>>)
})

it("returns empty for empty", async () => {
    const s = _aseq([]).cache()
    expect(await s._qr).toEqual([])
})

it("returns same for same", async () => {
    const s = _aseq([1, 2, 3]).cache()
    expect(await s._qr).toEqual([1, 2, 3])
})

it("can iterate twice", async () => {
    const s = _aseq([1, 2, 3]).cache()
    expect(await s._qr).toEqual([1, 2, 3])
    expect(await s._qr).toEqual([1, 2, 3])
})

it("no side-effects until pulled", async () => {
    const sq = jest.fn(async function* () {
        yield 1
    })
    const map = jest.fn(x => x)
    const s = _aseq(sq).map(map)
    const c = s.cache()
    expect(sq).not.toHaveBeenCalled()
    expect(map).not.toHaveBeenCalled()
    for await (const _ of c) {
    }
    expect(sq).toHaveBeenCalledTimes(1)
    expect(map).toHaveBeenCalledTimes(1)
})

it("side-effects only once", async () => {
    const sq = jest.fn(async function* () {
        yield 1
    })
    const map = jest.fn(x => x)
    const s = _aseq(sq).map(map)
    const c = s.cache()
    expect(map).not.toHaveBeenCalled()
    for await (const _ of c) {
    }
    for await (const _ of c) {
    }
    expect(map).toHaveBeenCalledTimes(1)
})

it("can iterate different lengths", async () => {
    const each = jest.fn()
    const s = _aseq([1, 2, 3, 4]).each(each).cache()
    const first3 = s.take(3)
    expect(await first3._qr).toEqual([1, 2, 3])
    expect(each).toHaveBeenCalledTimes(3)
    const first2 = s.take(2)
    expect(await first2._qr).toEqual([1, 2])
    expect(each).toHaveBeenCalledTimes(3)
    const all = s
    expect(await all._qr).toEqual([1, 2, 3, 4])
    expect(each).toHaveBeenCalledTimes(4)
})

it("reproduces thrown error at the same index", async () => {
    const handler = jest.fn((err, i) => {
        return [i]
    })
    const s = _aseq([1, 2, 3, 4])
        .each((x): void => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .cache()
    const endsWithErrorIndex = s.catch(handler)
    expect(await endsWithErrorIndex.last().pull()).toEqual(2)
    expect(await endsWithErrorIndex.last().pull()).toEqual(2)
    expect(handler).toHaveBeenCalledTimes(2)
    expect(await endsWithErrorIndex._qr).toEqual([1, 2, 2])
})

it("can handle multiple concurrent iterators", async () => {
    const s = _aseq([1, 2, 3, 4]).cache()
    const iter1 = s[Symbol.asyncIterator]()
    const iter2 = s[Symbol.asyncIterator]()
    const ps = [
        iter1.next(),
        iter2.next(),
        iter1.next(),
        iter1.next(),
        iter2.next(),
        iter2.next(),
        iter2.next(),
        iter2.next(),
        iter1.next()
    ]
    await expect(Promise.all(ps)).resolves.toEqual([
        { value: 1, done: false },
        { value: 1, done: false },
        { value: 2, done: false },
        { value: 3, done: false },
        { value: 2, done: false },
        { value: 3, done: false },
        { value: 4, done: false },
        { value: undefined, done: true },
        { value: 4, done: false }
    ])
})
