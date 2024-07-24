import type { ASeq } from "../base/wrapper.async"
import type { AsyncIteratee, AsyncIteratee2, replaceIteratedElement } from "../async/types"
import type { Seq } from "../base/wrapper.sync"
import type { Iteratee2 } from "../sync/types"
import { isIterable } from "stdlazy/lib/utils"
import dematerialize from "../base/operators/dematerialize"
import { lazy } from "stdlazy"

export function filter<T>(this: Seq<T>, predicate: Iteratee2<T, boolean>) {
    return this.mapJoin(predicate).concatMap(([item, keep]) => (keep ? [item] : []))
}

export function map<In, Out>(this: Seq<In>, projection: Iteratee2<In, Out>) {
    return this.mapJoin(projection).concatMap(([, output]) => [output])
}

export function takeWhile<T>(this: Seq<T>, predicate: Iteratee2<T, boolean>) {
    return this.mapJoin(predicate)
        .concatMap(item => {
            const [value, taking] = item
            return taking ? [{ done: false, value }] : [{ done: true, value }]
        })
        .materialize()
}

export function skipWhile<T>(this: Seq<T>, predicate: Iteratee2<T, boolean>) {
    return this.mapJoin(predicate).concatMap(item => {
        const [value, skipping] = item
        return skipping ? [] : [value]
    })
}
