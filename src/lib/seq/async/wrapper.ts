import { lazy } from "../../lazy/lazy";
import { LazyAsync } from "../../lazy/types";
import { AsyncIteratee, AsyncPredicate, AsyncReducer } from "./types";

export class ASeq<E> {
    constructor(private _iterable: AsyncIterable<E>) {}
    static from<E>(iterable: AsyncIterable<E>): ASeq<E> {
        return new ASeq<E>(iterable);
    }

    [Symbol.asyncIterator]() {
        return this._iterable[Symbol.asyncIterator]();
    }

    private _wrap<T>(generator: (self: ASeq<E>) => AsyncIterable<T>): ASeq<T> {
        return new ASeq<T>({
            [Symbol.asyncIterator]: () => {
                return generator.call(this, this)[Symbol.asyncIterator]();
            }
        });
    }

    map<T>(fn: AsyncIteratee<E, T>): ASeq<T> {
        return this._wrap(async function* (self) {
            let i = 0;
            for await (const v of self) {
                yield fn.call(self, v, i++);
            }
        });
    }

    toArray(): LazyAsync<E[]> {
        return lazy(async () => {
            return this.reduce((acc, item) => {
                acc.push(item);
                return acc;
            }, [] as E[]);
        });
    }

    forEach(fn: AsyncIteratee<E, void>): LazyAsync<void> {
        return this.reduce(async (_, item, i) => {
            await fn.call(this, item, i);
            return undefined;
        }, undefined);
    }

    toMap<K, V>(fn: AsyncIteratee<E, [K, V]>): LazyAsync<Map<K, V>> {
        return this.reduce(async (acc, item, i) => {
            const [key, value] = await fn.call(this, item, i);
            acc.set(key, value);
            return acc;
        }, new Map<K, V>());
    }

    toSet(): LazyAsync<Set<E>> {
        return this.reduce((acc, item) => {
            acc.add(item);
            return acc;
        }, new Set<E>());
    }

    toObject<K extends PropertyKey, V>(
        fn: AsyncIteratee<E, [K, V]>
    ): LazyAsync<Record<K, V>> {
        return this.map(x => fn.call(this, x, 0))
            .toArray()
            .map(Object.fromEntries);
    }

    reduce<T>(fn: AsyncReducer<E, T>, initial: T): LazyAsync<T> {
        return lazy(async () => {
            let acc = initial;
            let i = 0;
            for await (const v of this) {
                acc = await fn.call(this, acc, v, i++);
            }
            return acc;
        });
    }

    filter(fn: AsyncPredicate<E>): ASeq<E> {
        return this._wrap(async function* (self) {
            let i = 0;
            for await (const item of self) {
                if (await fn.call(self, item, i++)) {
                    yield item;
                }
            }
        });
    }

    take(n: number): ASeq<E> {
        return this.takeWhile((_, i) => i < n);
    }

    takeWhile(fn: AsyncPredicate<E>): ASeq<E> {
        return this._wrap(async function* (self) {
            let i = 0;
            for await (const item of self) {
                if (!(await fn.call(self, item, i++))) {
                    break;
                }
                yield item;
            }
        });
    }

    skip(n: number): ASeq<E> {
        return this.skipWhile((_, i) => i < n);
    }

    skipWhile(fn: AsyncPredicate<E>): ASeq<E> {
        return this._wrap(async function* (self) {
            let skip = true;
            let i = 0;
            for await (const item of self) {
                if (skip && (await fn.call(self, item, i++))) {
                    continue;
                }
                skip = false;
                yield item;
            }
        });
    }

    concat(...others: AsyncIterable<E>[]): ASeq<E> {
        return this._wrap(async function* (self) {
            for await (const item of self) {
                yield item;
            }
            for (const other of others) {
                for await (const item of other) {
                    yield item;
                }
            }
        });
    }

    first(): LazyAsync<E | null>;
    first(fn: AsyncPredicate<E>): LazyAsync<E | null>;
    first(fn?: AsyncPredicate<E>): LazyAsync<E | null> {
        if (!fn) {
            return this.at(0);
        }
        return lazy(async () => {
            let i = 0;
            for await (const item of this) {
                if (await fn.call(this, item, i++)) {
                    return item;
                }
            }
            return null;
        });
    }

    some(fn: AsyncPredicate<E>): LazyAsync<boolean> {
        const nope = {};
        return this.first(fn).map(x => x !== nope);
    }

    every(fn: AsyncPredicate<E>): LazyAsync<boolean> {
        return this.first(
            async (x, i) => !(await fn.call(this, x, i))
        ) as LazyAsync<boolean>;
    }

    includes(value: E): LazyAsync<boolean> {
        return this.some(x => x === value);
    }

    count(): LazyAsync<number>;
    count(fn: AsyncPredicate<E>): LazyAsync<number>;
    count(fn?: AsyncPredicate<E>): LazyAsync<number> {
        return this.reduce(
            async (acc, item, i) =>
                (fn ? await fn.call(this, item, i) : true) ? acc + 1 : acc,
            0
        );
    }

    as<T>(): ASeq<T> {
        return this as any;
    }
    dematerialize(): ASeq<IteratorResult<E>> {
        const self = this._iterable;
        return this._wrap(async function* dematerialize() {
            for await (const item of self) {
                yield { value: item, done: false };
            }
            yield { done: true } as any;
        });
    }
    index(): ASeq<[E, number]> {
        return this.map((x, i) => [x, i]);
    }

    filterAs<X, R extends X>(
        fn: (this: ASeq<E>, item: X, index: number) => item is R
    ): ASeq<R> {
        return this.filter(fn as any).as<R>();
    }

    excludeAs<X extends E, R extends X>(
        fn: (this: ASeq<E>, item: X, index: number) => item is R
    ): ASeq<Exclude<E, R>> {
        return this.filter(function excludeAs(x, i) {
            return !fn.call(this, x as any, i);
        }).as<Exclude<E, R>>();
    }

    ofTypes<Ts extends unknown[]>(
        ...ctors: {
            [K in keyof Ts]: new (...args: any[]) => Ts[K];
        }
    ): ASeq<Ts[number]> {
        return this.filterAs(function ofTypes(x): x is Ts[number] {
            return ctors.some(ctor => x instanceof ctor);
        });
    }

    at(index: number): LazyAsync<E | null> {
        return this.first((_, i) => i === index);
    }

    last(): LazyAsync<E | null>;
    last(fn: AsyncPredicate<E>): LazyAsync<E | null>;
    last(fn?: AsyncPredicate<E>): LazyAsync<E | null> {
        fn ??= () => true;
        return this.reduce((_, x) => x as E, null as E | null);
    }

    cache(): ASeq<E> {
        const self = this._iterable;
        const cache: E[] = [];
        let alreadyDone = false;

        return this._wrap(async function* cache_() {
            let i = 0;
            let iterator: AsyncIterator<E>;
            for (;;) {
                if (i < cache.length) {
                    yield cache[i++];
                } else if (!alreadyDone) {
                    iterator ??= self[Symbol.asyncIterator]();
                    const { done, value } = await iterator.next();
                    if (done) {
                        alreadyDone = true;
                        return;
                    }
                    cache.push(value);
                    yield value;
                    i++;
                } else {
                    return;
                }
            }
        });
    }

    concatMap<T>(fn: AsyncIteratee<E, AsyncIterable<T>>): ASeq<T> {
        return this._wrap(async function* (self) {
            let i = 0;
            for await (const item of self) {
                for await (const mapped of await fn.call(self, item, i++)) {
                    yield mapped;
                }
            }
        });
    }

    zip<Xs extends any[]>(
        ...others: {
            [K in keyof Xs]: AsyncIterable<Xs[K]>;
        }
    ): ASeq<[E, ...Xs]> {
        return this._wrap(async function* (self) {
            const iterators = [self, ...others].map(x =>
                x[Symbol.asyncIterator]()
            );
            for (;;) {
                const results = await Promise.all(
                    iterators.map(iterator => iterator.next())
                );
                if (results.some(({ done }) => done)) {
                    return;
                }
                yield results.map(({ value }) => value) as [E, ...Xs];
            }
        });
    }

    uniqBy<T>(fn: AsyncIteratee<E, T>): ASeq<E> {
        const seen = new Set<T>();
        return this.filter(async x => {
            const key = await fn.call(this, x, 0);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    uniq(): ASeq<E> {
        return this.uniqBy(x => x);
    }

    scan<T>(fn: AsyncReducer<E, T>, initial: T): ASeq<T[]> {
        return this._wrap(async function* (self) {
            let acc = initial;
            let i = 0;
            const all = [initial];
            for await (const v of self) {
                acc = await fn.call(self, acc, v, i++);
                all.push(acc);
                yield all;
            }
        });
    }

    get isEmpty(): LazyAsync<boolean> {
        return this.first().map(x => x === null);
    }

    pull(): ASeq<E> {
        const iterator = this[Symbol.asyncIterator]();
        return new ASeq({
            [Symbol.asyncIterator]: () => {
                return iterator;
            }
        });
    }
}
