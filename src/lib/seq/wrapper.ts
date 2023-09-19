import { Iteratee, Predicate, Reducer } from "./types";
import { Lazy, lazy, Pulled } from "..";

export class Seq<E> {
    static from<E>(iterable: Iterable<E>): Seq<E> {
        return new Seq(iterable);
    }

    [Symbol.iterator](): Iterator<E, any, undefined> {
        return this._iterable[Symbol.iterator]();
    }

    constructor(private _iterable: Iterable<E>) {}

    private _wrap<T>(generator: (this: Seq<E>) => Iterable<T>): Seq<T> {
        return new Seq<T>(generator.call(this));
    }

    tap(fn: Iteratee<E, any>) {
        const self = this;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                fn.call(self, item, i++);
                yield item;
            }
        });
    }

    forEach(fn: Iteratee<E, any>) {
        let i = 0;
        for (const item of this) {
            fn.call(this, item, i++);
        }
    }

    cache(): Seq<E> {
        const self = this._iterable;
        return this._wrap(function* () {
            const cache: E[] = [];
            let alreadyDone = false;
            const iterator = self[Symbol.iterator]();
            let i = 0;
            for (;;) {
                if (alreadyDone) {
                    return;
                }
                if (i < cache.length) {
                    yield cache[i++];
                } else {
                    const { done, value } = iterator.next();
                    if (done) {
                        alreadyDone = true;
                        return;
                    }
                    cache.push(value);
                    yield value;
                    i++;
                }
            }
        });
    }

    dematerialize(): Iterable<IteratorResult<E>> {
        const self = this._iterable;
        return this._wrap(function* () {
            for (const item of self) {
                yield { value: item, done: false };
            }
            yield { done: true } as any;
        });
    }

    as<Other>(): Seq<Other> {
        return this as any;
    }

    index(): Seq<[number, E]> {
        let i = 0;
        return this.map(x => [i++, x]);
    }

    first(): Lazy<E | undefined>;
    first(fn: Predicate<E>): Lazy<E | undefined>;
    first(fn?: Predicate<E>): Lazy<E | undefined> {
        return lazy(() => {
            let i = 0;
            for (const item of this) {
                if (!fn || fn.call(this, item, i++)) {
                    return item;
                }
            }
            return undefined;
        });
    }

    last(): Lazy<E | undefined>;
    last(fn: Predicate<E>): Lazy<E | undefined>;
    last(fn?: Predicate<E>): Lazy<E | undefined> {
        return lazy(() => {
            let result: E | undefined = undefined;
            let i = 0;
            for (const item of this) {
                if (!fn || fn.call(this, item, i++)) {
                    result = item;
                }
            }
            return result;
        });
    }

    at(index: number): Lazy<E | undefined> {
        return lazy(() => {
            let i = 0;
            for (const item of this) {
                if (i++ === index) {
                    return item;
                }
            }
            return undefined;
        });
    }

    some(fn: Predicate<E>): Lazy<boolean> {
        const a = this.first(fn).map(x => x !== undefined);
        return a;
    }

    every(fn: Predicate<E>): Lazy<boolean> {
        return lazy(() => {
            let i = 0;
            for (const item of this) {
                if (!fn.call(this, item, i++)) {
                    return false;
                }
            }
            return true;
        });
    }

    includes(item: E): Lazy<boolean> {
        return this.some(x => x === item);
    }

    toArray(): Lazy<E[]> {
        return lazy(() => [...this]);
    }

    toSet(): Lazy<Set<E>> {
        return lazy(() => new Set(this));
    }

    toMap<K, V>(fn: Iteratee<E, [K, V]>): Lazy<Map<K, V>> {
        return lazy(() => {
            return new Map(this.map(fn));
        });
    }

    count(): Lazy<number>;
    count(fn: Predicate<E>): Lazy<number>;
    count(fn?: Predicate<E>): Lazy<number> {
        return lazy(() => {
            let i = 0;
            let count = 0;
            for (const item of this) {
                if (!fn || fn.call(this, item, i++)) {
                    count++;
                }
            }
            return count;
        });
    }

    reduce<U>(fn: Reducer<E, U>, initial: U): Lazy<U> {
        return lazy(() => {
            let acc = initial;
            let i = 0;
            for (const item of this) {
                acc = fn.call(this, acc, item, i++);
            }
            return acc;
        });
    }

    do(fn: (item: E) => void): Seq<E> {
        const self = this._iterable;
        return this._wrap(function* () {
            for (const item of self) {
                fn(item);
                yield item;
            }
        });
    }

    map<U>(fn: Iteratee<E, U>): Seq<U> {
        const self = this;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                yield fn.call(self, item, i++);
            }
        });
    }

    concatMap<U>(fn: Iteratee<E, Iterable<U>>): Seq<U> {
        const self = this;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                yield* fn.call(self, item, i++);
            }
        });
    }

    filter(fn: Predicate<E>): Seq<E> {
        const self = this;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                if (fn.call(self, item, i++)) {
                    yield item;
                }
            }
        });
    }

    filterAs<T>(
        fn: (this: Seq<E>, item: E | unknown, index: number) => item is T
    ): Seq<T> {
        return this.filter(fn).as<T>();
    }

    ofTypes<Ts extends unknown[]>(
        ...ctors: {
            [K in keyof Ts]: new (...args: any[]) => Ts[K];
        }
    ): Seq<Ts[number]> {
        return this.filterAs((x): x is Ts[number] => ctors.some(ctor => x instanceof ctor));
    }

    take(n: number): Seq<E> {
        const self = this._iterable;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                if (i++ === n) {
                    break;
                }
                yield item;
            }
        });
    }

    takeWhile(fn: Predicate<E>): Seq<E> {
        const self = this;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                if (!fn.call(self, item, i++)) {
                    break;
                }
                yield item;
            }
        });
    }

    skip(n: number): Seq<E> {
        const self = this._iterable;
        return this._wrap(function* () {
            let i = 0;
            for (const item of self) {
                if (i++ < n) {
                    continue;
                }
                yield item;
            }
        });
    }

    zip<Xs extends any[]>(
        ...others: {
            [K in keyof Xs]: Iterable<Xs[K]>;
        }
    ): Seq<[E, ...Xs]> {
        const self = this;
        return this._wrap(function* () {
            const iterators = [self, ...others].map(i => i[Symbol.iterator]());
            while (true) {
                const results = iterators.map(i => i.next());
                if (results.some(r => r.done)) {
                    break;
                }
                yield results.map(r => r.value) as any;
            }
        });
    }

    skipWhile(fn: Predicate<E>): Seq<E> {
        const self = this;
        return this._wrap(function* () {
            let i = 0;
            let skip = true;
            for (const item of self) {
                if (skip && fn.call(self, item, i++)) {
                    continue;
                }
                skip = false;
                yield item;
            }
        });
    }

    groupBy<K>(fn: Iteratee<E, K>): Lazy<Map<K, E[]>> {
        const self = this;
        return lazy(() => {
            const map = new Map<K, E[]>();
            let i = 0;
            for (const item of self) {
                const key = fn.call(self, item, i++);
                if (!map.has(key)) {
                    map.set(key, []);
                }
                map.get(key)!.push(item);
            }
            return map;
        });
    }

    concat<U>(...others: Iterable<U>[]): Seq<U | E> {
        const self = this._iterable;
        return this._wrap(function* () {
            yield* self;
            for (const other of others) {
                yield* other;
            }
        });
    }

    scan<U>(fn: Reducer<E, U>, initial: U): Seq<U> {
        const self = this;
        return this._wrap(function* () {
            let acc = initial;
            let i = 0;
            for (const item of self) {
                acc = fn.call(self, acc, item, i++);
                yield acc;
            }
        });
    }

    get isEmpty(): Lazy<boolean> {
        return lazy(() => {
            const iterator = this[Symbol.iterator]();
            return !!iterator.next().done;
        });
    }

    pull(): Seq<E> {
        const iterator = this[Symbol.iterator]();
        return new Seq({
            [Symbol.iterator]: () => {
                return iterator;
            }
        });
    }

    orderBy<U>(fn: Iteratee<E, U>): Seq<E> {
        const self = this;
        return this._wrap(function* () {
            const items = [...self];
            let i = 0;
            items.sort((a, b) => {
                const fa = fn.call(self, a, i);
                const fb = fn.call(self, b, i);
                i++;
                if (fa < fb) {
                    return -1;
                } else if (fa > fb) {
                    return 1;
                } else {
                    return 0;
                }
            });
            yield* items;
        });
    }
}
