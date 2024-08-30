import { declare, type, type_of } from "declare-it"

import { Seq, seq } from "@lib"
const _seq = seq
declare.it("returns Seq<Seq.Group<K, V>>", expect => {
    const s = _seq([1, 2, 3]).groupBy(() => 1)
    expect(type_of(s)).to_equal(type<Seq<Seq.Group<number, number>>>)
})

declare.it("iteratee has single argument", expect => {
    _seq([1, 2, 3]).groupBy((...args) => {
        expect(type_of(args)).to_equal(type<[number]>)
    })
})

declare.it("iteratee can't have two arguments", expect => {
    // @ts-expect-error
    _seq([1, 2, 3]).groupBy((_, __) => 1)
})

declare.it("group has key", expect => {
    _seq([1, 2, 3])
        .groupBy(x => x)
        .map((...args) => {
            expect(type_of(args)).to_equal(type<[Seq.Group<number, number>, number]>)
        })
})

it("returns empty seq on empty", () => {
    const s = _seq([])
        .groupBy(() => 1)
        .toArray()
        .pull()
    expect(s).toEqual([])
})

function toMapRepr<K, V>(s: Seq<Seq.Group<K, V>>) {
    return s.toMap(group => [group[0], group[1].toArray().pull()]).pull()
}

it("returns map with singleton on singleton", () => {
    const s = _seq([1]).groupBy(() => 1)
    expect(toMapRepr(s)).toEqual(new Map([[1, [1]]]))
})

it("groups all by single key, preserves order", () => {
    const s = _seq([1, 2, 1, 2]).groupBy(_ => 1)
    expect(toMapRepr(s)).toEqual(new Map([[1, [1, 2, 1, 2]]]))
})

it("groups into two keys, preserves order", () => {
    const s = _seq([1, 2, 3, 4]).groupBy(x => x % 2)
    expect(toMapRepr(s)).toEqual(
        new Map([
            [1, [1, 3]],
            [0, [2, 4]]
        ])
    )
})

it("groups by object by reference", () => {
    const obj1 = {}
    const obj2 = {}
    const s = _seq([1, 2, 3]).groupBy(x => (x % 2 ? obj1 : obj2))
    expect(toMapRepr(s)).toEqual(
        new Map([
            [obj1, [1, 3]],
            [obj2, [2]]
        ])
    )
})

it("can iterate each group till the end, while iterating main", () => {
    const s = _seq([1, 2, 3, 4]).groupBy(x => x % 2)
    let i = -1
    for (const [key, group] of s) {
        i++
        if (i === 0) {
            expect(key).toEqual(1)
            expect(group.toArray().pull()).toEqual([1, 3])
            continue
        } else if (i === 1) {
            expect(key).toEqual(0)
            expect(group.toArray().pull()).toEqual([2, 4])
            continue
        }
        throw new Error("should not iterate more than twice")
    }
    expect(i).toEqual(1)
})
