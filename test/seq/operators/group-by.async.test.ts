import { ASeq, aseq } from "@lib"
import { declare, type, type_of } from "declare-it"
const _aseq = aseq

declare.it("returns ASeq<ASeq.Group<K, V>>", expect => {
    const s = _aseq([1, 2, 3]).groupBy(() => 1)
    expect(type_of(s)).to_equal(type<ASeq<ASeq.Group<number, number>>>)
})

declare.it("iteratee has single argument", async expect => {
    _aseq([1, 2, 3]).groupBy((...args) => {
        expect(type_of(args)).to_equal(type<[number]>)
    })
})

declare.it("iteratee can't have two arguments", async expect => {
    // @ts-expect-error
    _aseq([1, 2, 3]).groupBy((_, __) => 1)
})

declare.it("group has key", async expect => {
    _aseq([1, 2, 3])
        .groupBy(x => x)
        .map(async group => {
            expect(type_of(group)).to_equal(type<ASeq.Group<number, number>>)
        })
})

it("returns empty seq on empty", async () => {
    const s = await _aseq([])
        .groupBy(() => 1)
        .toArray()
        .pull()
    expect(s).toEqual([])
})

async function toMapRepr<K, V>(s: ASeq<ASeq.Group<K, V>>) {
    return await s.toMap(async group => [group[0], await group[1].toArray().pull()]).pull()
}

it("returns map with singleton on singleton", async () => {
    const s = _aseq([1]).groupBy(() => 1)
    expect(await toMapRepr(s)).toEqual(new Map([[1, [1]]]))
})

it("groups all by single key, preserves order", async () => {
    const s = _aseq([1, 2, 1, 2]).groupBy(_ => 1)
    expect(await toMapRepr(s)).toEqual(new Map([[1, [1, 2, 1, 2]]]))
})

it("groups into two keys, preserves order", async () => {
    const s = _aseq([1, 2, 3, 4]).groupBy(x => x % 2)
    expect(await toMapRepr(s)).toEqual(
        new Map([
            [1, [1, 3]],
            [0, [2, 4]]
        ])
    )
})

it("groups by object by reference", async () => {
    const obj1 = {}
    const obj2 = {}
    const s = _aseq([1, 2, 3]).groupBy(x => (x % 2 ? obj1 : obj2))
    expect(await toMapRepr(s)).toEqual(
        new Map([
            [obj1, [1, 3]],
            [obj2, [2]]
        ])
    )
})

it("can iterate each group till the end, while iterating main", async () => {
    const s = _aseq([1, 2, 3, 4]).groupBy(x => x % 2)
    let i = -1
    for await (const [key, group] of s) {
        i++
        if (i === 0) {
            expect(key).toEqual(1)
            expect(await group.toArray().pull()).toEqual([1, 3])
            continue
        } else if (i === 1) {
            expect(key).toEqual(0)
            expect(await group.toArray().pull()).toEqual([2, 4])
            continue
        }
        throw new Error("should not iterate more than twice")
    }
    expect(i).toEqual(1)
})
