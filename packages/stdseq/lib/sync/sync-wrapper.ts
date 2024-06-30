import { Lazy, lazy } from "stdlazy"
import { GetTypeForSelector, Selector, isIterable } from "stdlazy/utils"
import { aseq } from "../async/aseq"
import { ASeq } from "../async/async-wrapper"
import type { Chunk } from "./chunk"
import { Iteratee, Predicate, Reducer, type SeqLike } from "./types"

const unset = {}
export class Seq<E> {
    static from<E>(iterable: Iterable<E>): Seq<E> {
        return new Seq(iterable)
    }

    *[Symbol.iterator](): Iterator<E, any, undefined> {
        if (typeof this._internal === "function") {
            const result = this._internal()
            if (isIterable(result)) {
                yield* result
            } else {
                for (;;) {
                    const { done, value } = result.next()
                    if (done) {
                        return
                    }
                    yield value
                }
            }
        } else {
            yield* this._internal
        }
    }

    constructor(private _internal: SeqLike<E>) {}

    endWith<Xs extends unknown[]>(...items: Xs): Seq<E | Xs extends (infer U)[] ? U : never> {
        const self = this
        return this._wrap(function* endWith() {
            yield* self
            yield* items as any
        })
    }

    startWith<Xs extends unknown[]>(...items: Xs): Seq<E | Xs extends (infer U)[] ? U : never> {
        const self = this
        return this._wrap(function* startWith() {
            yield* items
            yield* self as any
        })
    }

    private _wrap<T>(generator: (this: Seq<E>, self: Seq<E>) => Iterable<T>): Seq<T> {
        return new Seq<T>({
            [Symbol.iterator]: () => {
                return generator.call(this, this)[Symbol.iterator]()
            }
        })
    }
    private _toLazy<X>(transform: (this: this, self: this) => X): Lazy<X> {
        return lazy(transform.bind(this, this))
    }

    forEach(fn: Iteratee<E, any>) {
        let i = 0
        for (const item of this) {
            fn.call(this, item, i++)
        }
    }

    sample(count: number) {
        const self = this
        return this._wrap(function* sample() {
            const items = [...self]
            const len = items.length
            for (let i = 0; i < count; i++) {
                yield items[Math.floor(Math.random() * len)]
            }
        })
    }

    chunk<N extends number>(size: N): Seq<Chunk<E, N>> {
        return this._wrap(function* chunk() {
            let group: E[] = []
            for (const item of this) {
                group.push(item)
                if (group.length === size) {
                    yield group as any
                    group = []
                }
            }
            if (group.length) {
                yield group as any
            }
        })
    }

    cache(): Seq<E> {
        const self = this
        const cache: E[] = []
        let alreadyDone = false

        return this._wrap(function* cache_() {
            let i = 0
            let iterator: Iterator<E>
            for (;;) {
                if (i < cache.length) {
                    yield cache[i++]
                } else if (!alreadyDone) {
                    iterator ??= self[Symbol.iterator]()
                    const { done, value } = iterator.next()
                    if (done) {
                        alreadyDone = true
                        return
                    }
                    cache.push(value)
                    yield value
                    i++
                } else {
                    return
                }
            }
        })
    }

    dematerialize(): Seq<IteratorResult<E>> {
        const self = this
        return this._wrap(function* dematerialize() {
            for (const item of self) {
                yield { value: item, done: false }
            }
            yield { done: true, value: undefined } as any
        })
    }

    as<Other>(): Seq<Other> {
        return this as any
    }

    toObject<K extends PropertyKey, V>(fn: Iteratee<E, [K, V]>): Lazy<Record<K, V>> {
        return this.map(x => fn.call(this, x, 0))
            .toArray()
            .map(Object.fromEntries)
    }

    index(): Seq<[number, E]> {
        let i = 0
        return this.map(x => {
            return [i++, x]
        })
    }

    first(): Lazy<E | null>
    first<Alt>(alt: Alt): Lazy<E | Alt>
    first(alt = null): Lazy<E | null> {
        return this.find(() => true, alt)
    }

    findLast(fn: Predicate<E>): Lazy<E | null>
    findLast<Alt>(fn: Predicate<E>, alt: Alt): Lazy<E | Alt | null>
    findLast<Alt>(fn: Predicate<E>, alt: any = null): Lazy<E | Alt | null> {
        return this.reduce<E | Alt | null>(
            (acc, x, i) => (fn.call(this, x, i) ? x : acc) as E | Alt,
            alt
        )
    }

    find(fn: Predicate<E>): Lazy<E | null>
    find<Alt>(fn: Predicate<E>, alt: Alt): Lazy<E | null>
    find(fn: Predicate<E>, alt: any = null): Lazy<any> {
        return this._toLazy(self => {
            let i = 0
            for (const item of self) {
                if (fn.call(self, item, i++)) {
                    return item
                }
            }
            return alt
        })
    }

    last(): Lazy<E | null>
    last<Alt>(alt: Alt): Lazy<E | Alt>
    last(alt = null): Lazy<E | null> {
        return this.findLast(x => true, alt)
    }

    at(index: number): Lazy<E | null>
    at<V>(index: number, alt: V): Lazy<E | V>
    at<V>(index: number, alt: any = null): Lazy<E | V> {
        const found =
            index >= 0
                ? this.index().skip(index).first(alt)
                : this.index().takeLast(-index).first(alt)

        return found.map(x => x?.[1] ?? null)
    }

    only(): Lazy<E> {
        const found = this.take(2)
            .toArray()
            .map(pair => {
                if (pair.length !== 1) {
                    throw new RangeError("Expected exactly one element, but sequence had more.")
                }
                return pair[0]
            })

        return found
    }

    some(): Lazy<boolean>
    some(fn: Predicate<E>): Lazy<boolean>
    some(fn?: Predicate<E>): Lazy<boolean> {
        const a = this.find(fn ?? (() => true), unset).map(x => x !== unset)
        return a
    }

    every(fn: Predicate<E>): Lazy<boolean> {
        return this.some(function not(x, i) {
            return !fn.call(this, x, i)
        }).map(x => !x)
    }

    includes(item: E): Lazy<boolean> {
        return this.some(x => {
            return x === item
        })
    }

    toArray(): Lazy<E[]> {
        return this._toLazy(function toArray() {
            return [...this]
        })
    }

    toSet(): Lazy<Set<E>> {
        return this._toLazy(function toSet() {
            return new Set(this)
        })
    }

    toMap<K, V>(fn: Iteratee<E, [K, V]>): Lazy<Map<K, V>> {
        return lazy(() => {
            return new Map(this.map(fn))
        })
    }

    count(): Lazy<number>
    count(fn: Predicate<E>): Lazy<number>
    count(fn?: Predicate<E>): Lazy<number> {
        if (!fn) {
            return this.reduce((acc, x) => acc + 1, 0)
        } else {
            return this.reduce((acc, x, i) => (fn.call(this, x, i) ? acc + 1 : acc), 0)
        }
    }

    reduce(fn: Reducer<E, E>): Lazy<E>
    reduce<U>(fn: Reducer<E, U>, initial: U): Lazy<U>
    reduce<U>(fn: Reducer<E, U>, initial?: U): Lazy<U> {
        const hadInitial = arguments.length === 2
        return this._toLazy(function reduce() {
            let acc = initial as any
            let i = 0
            for (const item of this) {
                if (!hadInitial && i === 0) {
                    acc = item
                } else {
                    acc = fn.call(this, acc, item, i++)
                }
                i++
            }
            if (!hadInitial && i === 0) {
                throw new Error("Cannot reduce empty sequence without initial")
            }
            return acc
        })
    }

    do(fn: Iteratee<E, void>): Seq<E> {
        return this.map((x, i) => {
            fn.call(this, x, i)
            return x
        })
    }

    map<U>(fn: Iteratee<E, U>): Seq<U> {
        const self = this
        return this._wrap(function* map() {
            let i = 0
            for (const item of self) {
                yield fn.call(self, item, i++)
            }
        })
    }

    drain(): Lazy<void> {
        return this._toLazy(function drain() {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const _ of this) {
                // Drain the iterator
            }
        })
    }

    pull() {
        return this.toArray().pull()
    }

    equals<E2 extends E>(other: SeqLike<E2>): Lazy<boolean>
    equals<S2 extends SeqLike<any>>(
        this: Seq<E> extends S2 ? Seq<E> : never,
        other: S2
    ): Lazy<boolean>
    equals(other: Iterable<any>): Lazy<boolean> {
        return lazy(() => {
            const a = this[Symbol.iterator]()
            const b = other[Symbol.iterator]()
            for (;;) {
                const aResult = a.next()
                const bResult = b.next()
                if (aResult.done || bResult.done) {
                    return aResult.done === bResult.done
                }
                if (aResult.value !== bResult.value) {
                    return false
                }
            }
        })
    }

    concatMap<U extends Iterable<unknown>>(
        fn: Iteratee<E, U>
    ): Seq<U extends Iterable<infer T> ? T : never> {
        const self = this
        return this._wrap(function* concatMap() {
            let i = 0
            for (const item of self) {
                yield* fn.call(self, item, i++)
            }
        }) as any
    }

    filter(fn: Predicate<E>): Seq<E> {
        const self = this
        return this._wrap(function* filter() {
            let i = 0
            for (const item of self) {
                if (fn.call(self, item, i++)) {
                    yield item
                }
            }
        })
    }

    extract<X, R extends X>(fn: (this: Seq<E>, item: X, index: number) => item is R): Seq<R> {
        return this.filter(fn as any).as<R>()
    }

    exclude<X extends E, R extends X>(
        fn: (this: Seq<E>, item: X, index: number) => item is R
    ): Seq<Exclude<E, R>> {
        return this.filter(function excludeAs(x, i) {
            return !fn.call(this, x as any, i)
        }).as<Exclude<E, R>>()
    }

    extractTypes<Selectors extends Selector>(
        ...specifiers: Selectors[]
    ): Seq<GetTypeForSelector<Selectors>> {
        return this.extract((x): x is GetTypeForSelector<Selectors> => {
            return specifiers.some(spec => {
                if (typeof spec === "function") {
                    return x instanceof spec
                } else {
                    return typeof x === spec
                }
            })
        })
    }

    minBy<U>(fn: Iteratee<E, U>): Lazy<E | null> {
        const self = this
        return this._toLazy(function minBy() {
            let min: E | null = null
            let minVal: U | null = null
            let i = 0
            for (const item of self) {
                const val = fn.call(this, item, i++)
                if (minVal == null || val < minVal) {
                    min = item
                    minVal = val
                }
            }
            return min
        })
    }

    maxBy<U>(fn: Iteratee<E, U>): Lazy<E | null> {
        const self = this
        return this._toLazy(function maxBy() {
            let max: E | null = null
            let maxVal: U | null = null
            let i = 0
            for (const item of self) {
                const val = fn.call(this, item, i++)
                if (maxVal == null || val > maxVal) {
                    max = item
                    maxVal = val
                }
            }
            return max
        })
    }

    take(n: number): Seq<E> {
        return this.takeWhile((_, i) => i < n)
    }

    strJoin(separator = ""): Lazy<string> {
        return this.toArray().map(arr => arr.join(separator))
    }

    takeLast(count: number): Seq<E> {
        if (count === 0) {
            return new Seq([])
        }
        return this._wrap(function* takeLast() {
            const buffer = Array(count)
            let i = 0
            for (const item of this) {
                buffer[i++ % count] = item
            }
            if (i <= count) {
                yield* buffer.slice(0, i)
                return
            }
            yield buffer[i % count]
            for (let j = (i + 1) % count; j !== i % count; j = (j + 1) % count) {
                yield buffer[j]
            }
        })
    }

    skipLast(count: number): Seq<E> {
        if (count === 0) {
            return this
        }
        return this._wrap(function* skipLast() {
            const buffer = Array(count)
            let i = 0
            for (const item of this) {
                if (i >= count) {
                    yield buffer[i % count]
                }
                buffer[i % count] = item
                i++
            }
        })
    }

    takeWhile(fn: Predicate<E>): Seq<E> {
        const self = this
        return this._wrap(function* takeWhile() {
            let i = 0
            for (const item of self) {
                if (!fn.call(self, item, i++)) {
                    break
                }
                yield item
            }
        })
    }

    skip(n: number): Seq<E> {
        return this.skipWhile((_, i) => i < n)
    }

    zip<Xs extends any[]>(
        ...others: {
            [K in keyof Xs]: Iterable<Xs[K]>
        }
    ): Seq<[E, ...Xs]> {
        const self = this
        return this._wrap(function* zip() {
            const iterators = [self, ...others].map(i => i[Symbol.iterator]())
            while (true) {
                const results = iterators.map(i => i.next())
                if (results.some(r => r.done)) {
                    break
                }
                yield results.map(r => r.value) as any
            }
        })
    }

    skipWhile(fn: Predicate<E>): Seq<E> {
        const self = this
        return this._wrap(function* skipWhile() {
            let i = 0
            let skip = true
            for (const item of self) {
                if (skip && fn.call(self, item, i++)) {
                    continue
                }
                skip = false
                yield item
            }
        })
    }

    groupBy<K>(fn: Iteratee<E, K>): Lazy<Map<K, E[]>> {
        const self = this
        return lazy(() => {
            const map = new Map<K, E[]>()
            let i = 0
            for (const item of self) {
                const key = fn.call(self, item, i++)
                if (!map.has(key)) {
                    map.set(key, [])
                }
                map.get(key)!.push(item)
            }
            return map
        })
    }

    concat<U>(...others: Iterable<U>[]): Seq<U | E> {
        const self = this
        return this._wrap(function* concat() {
            yield* self
            for (const other of others) {
                yield* other
            }
        })
    }

    uniqBy<K>(fn: Iteratee<E, K>): Seq<E> {
        const self = this
        return this._wrap(function* uniqBy() {
            const seen = new Set<K>()
            let i = 0
            for (const item of self) {
                const key = fn.call(self, item, i++)
                if (!seen.has(key)) {
                    seen.add(key)
                    yield item
                }
            }
        })
    }

    uniq(): Seq<E> {
        return this.uniqBy(x => x)
    }

    scan<U>(fn: Reducer<E, U>, initial: U): Seq<U> {
        const self = this
        return this._wrap(function* scan() {
            let acc = initial
            let i = 0
            const all = [initial]

            for (const item of self) {
                acc = fn.call(self, acc, item, i++)
                all.push(acc)
                yield acc
            }
        })
    }

    async(): ASeq<E> {
        return aseq(this)
    }

    shared(): Seq<E> {
        const iterator = this[Symbol.iterator]()
        return new Seq({
            [Symbol.iterator]: () => {
                return iterator
            }
        })
    }

    orderBy<U>(fn: Iteratee<E, U>): Seq<E> {
        const self = this
        return this._wrap(function* orderBy() {
            const items = [...self]
            let i = 0
            items.sort((a, b) => {
                const fa = fn.call(self, a, i)
                const fb = fn.call(self, b, i)
                i++
                if (fa < fb) {
                    return -1
                } else if (fa > fb) {
                    return 1
                } else {
                    return 0
                }
            })
            yield* items
        })
    }
}
