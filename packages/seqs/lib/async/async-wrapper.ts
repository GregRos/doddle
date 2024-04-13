import { LazyAsync, lazy } from "lazies"
import { GetTypeForSelector, Selector } from "../util"
import { AsyncIteratee, AsyncPredicate, AsyncReducer } from "./types"
import { aseq } from "./aseq"
const unset = {}
export class ASeq<E> {
    static from<E>(iterable: AsyncIterable<E>): ASeq<E> {
        return new ASeq(iterable)
    }

    [Symbol.asyncIterator](): AsyncIterator<E, any, undefined> {
        return this._iterable[Symbol.asyncIterator]()
    }

    constructor(private _iterable: AsyncIterable<E>) {}

    endWith<Xs extends unknown[]>(...items: Xs): ASeq<E | Xs extends (infer U)[] ? U : never> {
        const self = this._iterable
        return this._wrap(async function* endWith() {
            yield* self
            yield* items as any
        })
    }

    startWith<Xs extends unknown[]>(...items: Xs): ASeq<E | Xs extends (infer U)[] ? U : never> {
        const self = this._iterable
        return this._wrap(async function* startWith() {
            yield* items
            yield* self as any
        })
    }

    private _wrap<T>(generator: (this: ASeq<E>, self: ASeq<E>) => AsyncIterable<T>): ASeq<T> {
        return new ASeq<T>({
            [Symbol.asyncIterator]: () => {
                return generator.call(this, this)[Symbol.asyncIterator]()
            }
        })
    }
    private _toLazy<X>(transform: (this: this, self: this) => Promise<X>): LazyAsync<X> {
        return lazy(transform.bind(this, this))
    }

    async forEach(fn: AsyncIteratee<E, any>) {
        let i = 0
        for await (const item of this) {
            await fn.call(this, item, i++)
        }
    }

    cache(): ASeq<E> {
        const self = this._iterable
        const cache: E[] = []
        let alreadyDone = false

        return this._wrap(async function* cache_() {
            let i = 0
            let iterator: AsyncIterator<E>
            for (;;) {
                if (i < cache.length) {
                    yield cache[i++]
                } else if (!alreadyDone) {
                    iterator ??= self[Symbol.asyncIterator]()
                    const { done, value } = await iterator.next()
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

    dematerialize(): ASeq<IteratorResult<E>> {
        const self = this._iterable
        return this._wrap(async function* dematerialize() {
            for await (const item of self) {
                yield { value: item, done: false }
            }
            yield { done: true, value: undefined } as any
        })
    }

    as<Other>(): ASeq<Other> {
        return this as any
    }

    toObject<K extends PropertyKey, V>(fn: AsyncIteratee<E, [K, V]>): LazyAsync<Record<K, V>> {
        return this.map(async x => fn.call(this, x, 0))
            .toArray()
            .map(Object.fromEntries)
    }

    index(): ASeq<[number, E]> {
        let i = 0
        return this.map(x => {
            return [i++, x]
        })
    }

    first(): LazyAsync<E | null>
    first<Alt>(alt: Alt): LazyAsync<E | Alt>
    first(alt = null): LazyAsync<E | null> {
        return this.find(() => true, alt)
    }
    findLast(fn: AsyncPredicate<E>): LazyAsync<E | null>
    findLast<Alt>(fn: AsyncPredicate<E>, alt: Alt): LazyAsync<E | Alt | null>
    findLast<Alt>(fn: AsyncPredicate<E>, alt: any = null): LazyAsync<E | Alt | null> {
        return this.reduce<E | Alt | null>(
            async (acc, x, i) => ((await fn.call(this, x, i)) ? x : acc) as E | Alt,
            alt
        )
    }

    find(fn: AsyncPredicate<E>): LazyAsync<E | null>
    find<Alt>(fn: AsyncPredicate<E>, alt: Alt): LazyAsync<E | null>
    find(fn: AsyncPredicate<E>, alt: any = null): LazyAsync<any> {
        return this._toLazy(async self => {
            let i = 0
            for await (const item of self) {
                if (await fn.call(self, item, i++)) {
                    return item
                }
            }
            return alt
        })
    }

    last(): LazyAsync<E | null>
    last<Alt>(alt: Alt): LazyAsync<E | Alt>
    last(alt = null): LazyAsync<E | null> {
        return this.findLast(x => true, alt)
    }

    at(index: number): LazyAsync<E | null>
    at<V>(index: number, alt: V): LazyAsync<E | V>
    at<V>(index: number, alt: any = null): LazyAsync<E | V> {
        const found =
            index >= 0
                ? this.index().skip(index).first(alt)
                : this.index().takeLast(-index).first(alt)

        return found.map(x => x?.[1] ?? null)
    }

    only(): LazyAsync<E> {
        const found = this.take(2)
            .toArray()
            .map(pair => {
                if (pair.length !== 1) {
                    throw new RangeError("Expected exactly one element, but sequence had more.")
                }
                // @ts-expect-error To catch runtime errors
                if (pair.length === 0) {
                    throw new RangeError("Expected exactly one element, but sequence was empty.")
                }
                return pair[0]
            })

        return found
    }

    some(): LazyAsync<boolean>
    some(fn: AsyncPredicate<E>): LazyAsync<boolean>
    some(fn?: AsyncPredicate<E>): LazyAsync<boolean> {
        const a = this.find(fn ?? (() => true), unset).map(x => x !== unset)
        return a
    }

    every(fn: AsyncPredicate<E>): LazyAsync<boolean> {
        return this.some(async function not(x, i) {
            return !(await fn.call(this, x, i))
        }).map(x => !x)
    }

    includes(item: E): LazyAsync<boolean> {
        return this.some(x => {
            return x === item
        })
    }

    toArray(): LazyAsync<E[]> {
        return this._toLazy(async function toArray() {
            const items: E[] = []
            for await (const item of this) {
                items.push(item)
            }
            return items
        })
    }

    toSet(): LazyAsync<Set<E>> {
        return this._toLazy(async function toSet() {
            const set = new Set<E>()
            for await (const item of this) {
                set.add(item)
            }
            return set
        })
    }

    toMap<K, V>(fn: AsyncIteratee<E, [K, V]>): LazyAsync<Map<K, V>> {
        return lazy(async () => {
            const map = new Map<K, V>()
            for await (const item of this) {
                const [key, value] = await fn.call(this, item, 0)
                map.set(key, value)
            }
            return map
        })
    }

    count(): LazyAsync<number>
    count(fn: AsyncPredicate<E>): LazyAsync<number>
    count(fn?: AsyncPredicate<E>): LazyAsync<number> {
        if (!fn) {
            return this.reduce(async (acc, x) => acc + 1, 0)
        } else {
            return this.reduce(
                async (acc, x, i) => ((await fn.call(this, x, i)) ? acc + 1 : acc),
                0
            )
        }
    }

    reduce(fn: AsyncReducer<E, E>): LazyAsync<E>
    reduce<U>(fn: AsyncReducer<E, U>, initial: U): LazyAsync<U>
    reduce<U>(fn: AsyncReducer<E, U>, initial?: U): LazyAsync<U> {
        const hadInitial = arguments.length === 2
        return this._toLazy(async function reduce() {
            let acc = initial as any
            let i = 0
            for await (const item of this) {
                if (!hadInitial && i === 0) {
                    acc = item
                } else {
                    acc = await fn.call(this, acc, item, i++)
                }
                i++
            }
            if (!hadInitial && i === 0) {
                throw new Error("Cannot reduce empty sequence without initial")
            }
            return acc
        })
    }

    do(fn: AsyncIteratee<E, void>): ASeq<E> {
        return this.map(async (x, i) => {
            await fn.call(this, x, i)
            return x
        })
    }

    map<U>(fn: AsyncIteratee<E, U>): ASeq<U> {
        const self = this
        return this._wrap(async function* map() {
            let i = 0
            for await (const item of self) {
                yield await fn.call(self, item, i++)
            }
        })
    }

    concatMap<U extends AsyncIterable<unknown>>(
        fn: AsyncIteratee<E, U>
    ): ASeq<U extends AsyncIterable<infer T> ? T : never> {
        const self = this
        return this._wrap(async function* concatMap() {
            let i = 0
            for await (const item of self) {
                yield* await fn.call(self, item, i++)
            }
        }) as any
    }

    filter(fn: AsyncPredicate<E>): ASeq<E> {
        const self = this
        return this._wrap(async function* filter() {
            let i = 0
            for await (const item of self) {
                if (await fn.call(self, item, i++)) {
                    yield item
                }
            }
        })
    }

    extract<X, R extends X>(fn: (this: ASeq<E>, item: X, index: number) => item is R): ASeq<R> {
        return this.filter(fn as any).as<R>()
    }

    exclude<X extends E, R extends X>(
        fn: (this: ASeq<E>, item: X, index: number) => item is R
    ): ASeq<Exclude<E, R>> {
        return this.filter(async function exclude(x, i) {
            return !fn.call(this, x as any, i)
        }).as<Exclude<E, R>>()
    }

    extractTypes<Selectors extends Selector>(
        ...specifiers: Selectors[]
    ): ASeq<GetTypeForSelector<Selectors>> {
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

    take(n: number): ASeq<E> {
        return this.takeWhile((_, i) => i < n)
    }

    takeLast(count: number): ASeq<E> {
        if (count === 0) {
            return aseq()
        }
        return this._wrap(async function* takeLast() {
            const buffer = Array(count)
            let i = 0
            for await (const item of this) {
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

    skipLast(count: number): ASeq<E> {
        if (count === 0) {
            return this
        }
        return this._wrap(async function* skipLast() {
            const buffer = Array(count)
            let i = 0
            for await (const item of this) {
                if (i >= count) {
                    yield buffer[i % count]
                }
                buffer[i % count] = item
                i++
            }
        })
    }

    takeWhile(fn: AsyncPredicate<E>): ASeq<E> {
        const self = this
        return this._wrap(async function* takeWhile() {
            let i = 0
            for await (const item of self) {
                if (!(await fn.call(self, item, i++))) {
                    break
                }
                yield item
            }
        })
    }

    skip(n: number): ASeq<E> {
        return this.skipWhile((_, i) => i < n)
    }

    zip<Xs extends any[]>(
        ...others: {
            [K in keyof Xs]: AsyncIterable<Xs[K]>
        }
    ): ASeq<[E, ...Xs]> {
        const self = this
        return this._wrap(async function* zip() {
            const iterators = [self, ...others].map(i => i[Symbol.asyncIterator]())
            while (true) {
                const results = await Promise.all(iterators.map(async i => i.next()))
                if (results.some(r => r.done)) {
                    break
                }
                yield results.map(r => r.value) as any
            }
        })
    }

    skipWhile(fn: AsyncPredicate<E>): ASeq<E> {
        const self = this
        return this._wrap(async function* skipWhile() {
            let i = 0
            let skip = true
            for await (const item of self) {
                if (skip && (await fn.call(self, item, i++))) {
                    continue
                }
                skip = false
                yield item
            }
        })
    }

    concat<U>(...others: Iterable<U>[]): ASeq<U | E> {
        const self = this._iterable
        return this._wrap(async function* concat() {
            yield* self
            for (const other of others) {
                yield* other
            }
        })
    }

    uniqBy<K>(fn: AsyncIteratee<E, K>): ASeq<E> {
        return this._wrap(async function* uniqBy(self) {
            const seen = new Set<K>()
            let i = 0
            for await (const item of self) {
                const key = await fn.call(self, item, i++)
                if (!seen.has(key)) {
                    seen.add(key)
                    yield item
                }
            }
        })
    }

    uniq(): ASeq<E> {
        return this.uniqBy(async x => x)
    }

    scan<U>(fn: AsyncReducer<E, U>, initial: U): Seq<U> {
        return this._wrap(async function* scan(self) {
            let acc = initial
            let i = 0
            const all = [initial]

            for await (const item of self) {
                acc = await fn.call(self, acc, item, i++)
                all.push(acc)
                yield acc
            }
        })
    }

    shared(): ASeq<E> {
        const iterator = this[Symbol.asyncIterator]()
        return new ASeq({
            [Symbol.asyncIterator]: () => {
                return iterator
            }
        })
    }

    orderBy<U>(fn: AsyncIteratee<E, U>): ASeq<E> {
        return this._wrap(async function* orderBy(self) {
            const items = await self.toArray().pull()
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
