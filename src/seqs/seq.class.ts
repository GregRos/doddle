import { chk, Doddle, loadCheckers } from "../errors/error.js"
import type { Lazy } from "../lazy/index.js"
import { lazy, lazyFromOperator, pull } from "../lazy/index.js"
import { _iter, parseStage, returnKvp, shuffleArray, Stage } from "../utils.js"

import {
    SkippingMode,
    type EachCallStage,
    type getConcatElementType,
    type getWindowArgsType,
    type getWindowOutputType,
    type getZipValuesType,
    type SkipWhileOptions,
    type TakeWhileSpecifier
} from "./common-types.js"
import { seq } from "./seq.ctor.js"
class ThrownErrorMarker {
    constructor(public error: any) {}
}

export abstract class Seq<T> implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>
    get [Symbol.toStringTag]() {
        return "Seq"
    }
    get _qr() {
        return this.toArray().pull()
    }
    append<Ts extends any[]>(...items: Ts): Seq<T | Ts[number]> {
        return SeqOperator(this, function* append(input) {
            yield* seq(input).concat(items)
        })
    }
    at(index: number): Lazy<T | undefined> {
        chk(this.at).index(index)
        return lazyFromOperator(this, function at(input) {
            if (index < 0) {
                return input.take(index).first().pull()
            }
            return input.skip(index).first().pull()
        })
    }
    cache(): Seq<T> {
        const self = this
        const _cache: (T | ThrownErrorMarker)[] = []
        let alreadyDone = false
        let iterator: Iterator<T>

        return SeqOperator(this, function* cache() {
            let i = 0
            for (;;) {
                if (i < _cache.length) {
                    const cur = _cache[i]
                    if (cur instanceof ThrownErrorMarker) {
                        throw cur.error
                    }
                    yield cur
                    i++
                } else if (!alreadyDone) {
                    iterator ??= _iter(self)
                    try {
                        const { done, value } = iterator.next()
                        if (done) {
                            alreadyDone = true
                            return
                        }
                        _cache.push(value)
                        yield value
                        i++
                    } catch (err) {
                        _cache.push(new ThrownErrorMarker(err as any))
                        throw err
                    }
                } else {
                    return
                }
            }
        })
    }
    catch<S>(handler: Seq.Iteratee<unknown, Seq.Input<S>>): Seq<T | S>
    catch(handler: Seq.Iteratee<unknown, void | undefined>): Seq<T>
    catch<S>(handler: Seq.Iteratee<unknown, void | Seq.Input<S>>): Seq<unknown> {
        chk(this.catch).handler(handler)
        return SeqOperator(this, function* catch_(input) {
            let i = 0
            const iterator = _iter(input)
            for (;;) {
                try {
                    const result = iterator.next()
                    var value = result.value
                    if (result.done) {
                        return
                    }
                    yield value
                } catch (err: any) {
                    const error = err
                    const result = pull(handler(error, i))
                    if (!result || result == null) {
                        return
                    }
                    yield* seq(result)
                    return
                }
                i++
            }
        })
    }
    chunk<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S | Lazy<S>
    ): Seq<S>
    chunk<L extends number>(size: L): Seq<getWindowOutputType<T, L>>
    chunk<L extends number>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => any
    ): Seq<getWindowOutputType<T, L>> {
        chk(this.chunk).size(size)
        projection ??= (...chunk: any) => chunk as any
        chk(this.chunk).projection(projection)

        return SeqOperator(this, function* chunk(input) {
            let chunk: T[] = []
            for (const item of input) {
                chunk.push(item)
                if (chunk.length === size) {
                    yield pull(projection(...(chunk as any)))
                    chunk = []
                }
            }
            if (chunk.length) {
                yield pull(projection(...(chunk as any)))
            }
        }) as any
    }
    concatMap<S>(projection: Seq.Iteratee<T, Seq.Input<S>>): Seq<getConcatElementType<T, S>> {
        chk(this.concatMap).projection(projection)
        return SeqOperator(this, function* concatMap(input) {
            let index = 0
            for (const element of input) {
                for (const projected of seq(pull(projection(element, index++)))) {
                    yield projected
                }
            }
        }) as any
    }
    concat<Seqs extends Seq.Input<any>[]>(
        ..._iterables: Seqs
    ): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
        const iterables = _iterables.map(seq)
        return SeqOperator(this, function* concat(input) {
            yield* input
            for (const iterable of iterables) {
                yield* iterable
            }
        }) as any
    }
    count(): Lazy<number>
    count(predicate: Seq.Predicate<T>): Lazy<number>
    count(predicate?: Seq.Predicate<T>): Lazy<number> {
        // ! POLYMORPHIC !
        predicate ??= () => true
        predicate = chk(this.count).predicate(predicate)
        return lazyFromOperator(this, function count(input) {
            return input
                .filter(predicate)
                .reduce(acc => acc + 1, 0)
                .pull()
        })
    }
    each(action: Seq.StageIteratee<T, void>, stage: EachCallStage | undefined = "before") {
        chk(this.each).action(action)
        chk(this.each).stage(stage)
        const myStage = parseStage(stage)
        return SeqOperator(this, function* each(input) {
            let index = 0
            for (const element of input) {
                if (myStage & Stage.Before) {
                    pull(action(element, index, "before"))
                }
                yield element
                if (myStage & Stage.After) {
                    pull(action(element, index, "after"))
                }
                index++
            }
        })
    }
    every(predicate: Seq.Predicate<T>): Lazy<boolean> {
        // ! POLYMORPHIC !
        predicate = chk(this.every).predicate(predicate)
        return lazyFromOperator(this, function every(input) {
            return input
                .map(predicate)
                .some(x => !x)
                .pull()
        }).map(x => !x)
    }
    filter<S extends T>(predicate: Seq.TypePredicate<T, S>): Seq<S>
    filter(predicate: Seq.Predicate<T>): Seq<T>
    filter(predicate: Seq.Predicate<T>) {
        predicate = chk(this.filter).predicate(predicate)
        return SeqOperator(this, function* filter(input) {
            yield* seq(input).concatMap((element, index) =>
                pull(predicate(element, index)) ? [element] : []
            )
        })
    }
    findLast(predicate: Seq.Predicate<T>): Lazy<T | undefined>
    findLast<const Alt>(predicate: Seq.Predicate<T>, alt: Alt): Lazy<T | Alt>
    findLast<Alt = undefined>(predicate: Seq.Predicate<T>, alt?: Alt) {
        // ! POLYMORPHIC !

        predicate = chk(this.findLast).predicate(predicate)
        return lazyFromOperator(this, function findLast(input) {
            return input.filter(predicate).last(alt).pull() as any
        })
    }
    find(predicate: Seq.Predicate<T>): Lazy<T | undefined>
    find<const Alt>(predicate: Seq.Predicate<T>, alt: Alt): Lazy<T | Alt>
    find<Alt = T>(predicate: Seq.Predicate<T>, alt?: Alt) {
        // ! POLYMORPHIC !

        predicate = chk(this.find).predicate(predicate)
        return lazyFromOperator(this, function find(input) {
            return input.filter(predicate).first(alt).pull() as any
        })
    }

    share(): Seq<T> {
        const iter = lazy(() => _iter(this))
        let err: Error | undefined = undefined
        return SeqOperator(this, function* share() {
            if (err) {
                throw err
            }
            try {
                while (true) {
                    const { done, value } = iter.pull().next()
                    if (done) {
                        return
                    }
                    yield value
                }
            } catch (e) {
                err = e as Error
                throw e
            }
        })
    }

    after(action: Seq.NoInputAction): Seq<T> {
        chk(this.after).action(action)
        return SeqOperator(this, function* after(input) {
            yield* input
            pull(action())
        })
    }

    first(): Lazy<T | undefined>
    first<const Alt>(alt: Alt): Lazy<T | Alt>
    first<const Alt = undefined>(alt?: Alt): Lazy<any> {
        return lazyFromOperator(this, function first(input) {
            for (const element of input) {
                return element
            }
            return alt
        })
    }

    before(action: Seq.NoInputAction): Seq<T> {
        chk(this.before).action(action)
        return SeqOperator(this, function* before(input) {
            pull(action())
            yield* input
        })
    }

    groupBy<K>(keyProjection: Seq.NoIndexIteratee<T, K>): Seq<Seq.Group<K, T>> {
        chk(this.groupBy).keyProjection(keyProjection)

        return SeqOperator(this, function* groupBy(input) {
            const map = new Map<K, [T, ...T[]]>()
            const keys = [] as K[]
            const shared = input
                .map(v => {
                    const key = pull(keyProjection(v)) as K
                    const group = map.get(key)
                    if (group) {
                        group.push(v)
                    } else {
                        keys.push(key)
                        map.set(key, [v])
                    }
                    return undefined
                })
                .share()
            function* getGroupIterable(key: K): Iterable<T> {
                const group = map.get(key)!
                for (let i = 0; ; i++) {
                    if (i < group.length) {
                        yield group[i]
                        continue
                    }

                    for (const _ of shared) {
                        if (i < group.length) {
                            break
                        }
                    }
                    if (i >= group.length) {
                        // must've completed
                        return
                    }
                    i--
                }
            }

            for (let i = 0; ; i++) {
                if (i < keys.length) {
                    const key = keys[i]
                    yield [key, seq(() => getGroupIterable(key))]
                    continue
                }
                for (const _ of shared) {
                    if (i < keys.length) {
                        break
                    }
                }
                if (i >= keys.length) {
                    // must've completed
                    return
                }
                i--
            }
        })
    }

    includes<T extends S, S>(this: Seq<T>, value: S): Lazy<boolean>
    includes<S extends T>(value: S): Lazy<boolean>
    includes(value: any): Lazy<boolean> {
        // ! POLYMORPHIC !
        return lazyFromOperator(this, function includes(input) {
            return input.some(element => element === value).pull()
        })
    }
    last(): Lazy<T | undefined>
    last<const Alt>(alt: Alt): Lazy<T | Alt>
    last<Alt = undefined>(alt?: Alt) {
        return lazyFromOperator(this, function last(input) {
            let last: T | Alt = alt as Alt
            for (const element of input) {
                last = element
            }
            return last
        })
    }

    map<S>(projection: Seq.Iteratee<T, S>): Seq<S> {
        chk(this.map).projection(projection)
        return SeqOperator(this, function* map(input) {
            yield* seq(input).concatMap((element, index) => [pull(projection(element, index)) as S])
        })
    }
    maxBy<K>(projection: Seq.Iteratee<T, K>): Lazy<T | undefined>
    maxBy<K, const Alt>(projection: Seq.Iteratee<T, K>, alt: Alt): Lazy<T | Alt>
    maxBy<K, Alt>(projection: Seq.Iteratee<T, K>, alt?: Alt): Lazy<T | Alt> {
        const EMPTY = Symbol("EMPTY_SEQ")
        // ! POLYMORPHIC !
        chk(this.maxBy).projection(projection)
        return lazyFromOperator(this, function maxBy(input) {
            return input
                .map((element, index) => {
                    return returnKvp(input, projection(element, index), element)
                })
                .reduce((max: any, value: any) => {
                    return max.key >= value.key ? max : value
                }, EMPTY as any)
                .map(x => (x === EMPTY ? alt : x.value))
                .pull()
        })
    }
    minBy<K>(projection: Seq.Iteratee<T, K>): Lazy<T | undefined>
    minBy<K, const Alt>(projection: Seq.Iteratee<T, K>, alt: Alt): Lazy<T | Alt>
    minBy<K>(projection: Seq.Iteratee<T, K>, alt?: any) {
        const EMPTY = Symbol("EMPTY_SEQ")
        // ! POLYMORPHIC !
        chk(this.minBy).projection(projection)
        return lazyFromOperator(this, function minBy(input) {
            return input
                .map((element, index) => {
                    return returnKvp(input, projection(element, index), element)
                })
                .reduce((min: any, value: any) => {
                    return min.key <= value.key ? min : value
                }, EMPTY as any)
                .map(x => (x === EMPTY ? alt : x.value))
                .pull()
        })
    }
    orderBy(projection: Seq.NoIndexIteratee<T, any>, reverse = false): Seq<T> {
        chk(this.orderBy).projection(projection)
        chk(this.orderBy).reverse(reverse)
        return SeqOperator(this, function* orderBy(input) {
            yield* seq(input)
                .map(e => returnKvp(e, projection(e), e))
                .toArray()
                .map(xs => {
                    void xs.sort((a: any, b: any) => {
                        const result = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                        return reverse ? -result : result
                    })
                    return xs.map((x: any) => x.value)
                })
                .pull()
        })
    }
    reduce(reducer: Seq.Reducer<T, T>): Lazy<T>
    reduce<Acc>(reducer: Seq.Reducer<T, Acc>, initial: Acc): Lazy<Acc>
    reduce<Acc>(reducer: Seq.Reducer<T, Acc>, initial?: Acc): Lazy<any> {
        // ! POLYMORPHIC !
        const NO_INITIAL = Symbol("NO_INITIAL")
        chk(this.reduce).reducer(reducer)
        return lazyFromOperator(this, function reduce(input) {
            return input
                .scan(reducer, initial!)
                .last(NO_INITIAL)
                .map(x => {
                    if (x === NO_INITIAL) {
                        throw new Doddle("Cannot reduce empty sequence with no initial value")
                    }
                    return x
                })
                .pull()
        }) as any
    }
    reverse() {
        return SeqOperator(this, function* reverse(input) {
            yield* seq(input)
                .toArray()
                .map(x => x.reverse())
                .pull()
        })
    }
    scan(reducer: Seq.Reducer<T, T>): Seq<T>
    scan<Acc>(reducer: Seq.Reducer<T, Acc>, initial: Acc): Seq<Acc>
    scan<Acc>(reducer: Seq.Reducer<T, Acc>, initial?: Acc) {
        chk(this.scan).reducer(reducer)
        return SeqOperator(this, function* scan(input) {
            let hasAcc = initial !== undefined

            let acc: Acc = initial as any
            let index = 0
            if (hasAcc) {
                yield acc
            }
            for (const element of input) {
                if (!hasAcc) {
                    acc = element as any
                    hasAcc = true
                } else {
                    acc = pull(reducer(acc, element, index++)) as any
                }

                yield acc
            }
        })
    }
    seqEquals<T extends S, S>(this: Seq<T>, _other: Seq.Input<S>): Lazy<boolean>
    seqEquals<S extends T>(_other: Seq.Input<S>): Lazy<boolean>
    seqEquals<S extends T>(_other: Seq.Input<S>) {
        const other = seq(_other)
        return lazyFromOperator(this, function seqEquals(input) {
            const otherIterator = _iter(other)
            for (const element of input) {
                const otherElement = otherIterator.next()
                if (otherElement.done || element !== otherElement.value) {
                    return false
                }
            }
            return !!otherIterator.next().done
        })
    }
    setEquals<T extends S, S>(this: Seq<T>, _other: Seq.Input<S>): Lazy<boolean>
    setEquals<S extends T>(_other: Seq.Input<S>): Lazy<boolean>
    setEquals<S extends T>(_other: Seq.Input<S>) {
        const other = seq(_other)
        return lazyFromOperator(this, function setEquals(input) {
            const set = new Set(other) as Set<any>
            for (const element of input) {
                if (!set.delete(element)) {
                    return false
                }
            }
            return set.size === 0
        })
    }

    shuffle() {
        return SeqOperator(this, function* shuffle(input) {
            const array = seq(input).toArray().pull()
            shuffleArray(array)
            yield* array
        })
    }
    skipWhile(predicate: Seq.Predicate<T>, options?: SkipWhileOptions): Seq<T> {
        predicate = chk(this.skipWhile).predicate(predicate)
        return SeqOperator(this, function* skipWhile(input) {
            let prevMode = SkippingMode.None as SkippingMode
            let index = 0
            for (const element of input) {
                if (prevMode === SkippingMode.NotSkipping) {
                    yield element
                    continue
                }
                const newSkipping: boolean = pull(predicate(element, index++))
                if (!newSkipping) {
                    if (prevMode !== SkippingMode.Skipping || !options?.skipFinal) {
                        yield element
                    }
                }
                prevMode = newSkipping ? SkippingMode.Skipping : SkippingMode.NotSkipping
            }
        }) as any
    }
    skip(count: number): Seq<T> {
        const SKIP = Symbol("SKIP")
        chk(this.skip).count(count)
        return SeqOperator(this, function* skip(input) {
            let myCount = count
            if (myCount === 0) {
                yield* seq(input)
                return
            }
            if (myCount < 0) {
                myCount = -myCount
                yield* seq(input)
                    .window(myCount + 1, (...window) => {
                        if (window.length === myCount + 1) {
                            return window[0]
                        }
                        return SKIP
                    })
                    .filter(x => x !== SKIP)
            } else {
                yield* seq(input).skipWhile((_, index) => index < myCount, {})
            }
        }) as any
    }
    some(predicate: Seq.Predicate<T>): Lazy<boolean> {
        // ! POLYMORPHIC !

        const NO_MATCH = Symbol("NO_MATCH")
        predicate = chk(this.some).predicate(predicate)
        return lazyFromOperator(this, function some(input) {
            return input
                .find(predicate, NO_MATCH)
                .map(x => x !== NO_MATCH)
                .pull()
        })
    }
    sumBy(projection: Seq.Iteratee<T, number>) {
        // ! POLYMORPHIC !

        chk(this.sumBy).projection(projection)
        return lazyFromOperator(this, function sumBy(input) {
            return input
                .map(projection)
                .reduce((acc, element) => acc + element, 0)
                .pull()
        })
    }
    takeWhile(predicate: Seq.Predicate<T>, specifier?: TakeWhileSpecifier): Seq<T> {
        chk(this.takeWhile).predicate(predicate)
        return SeqOperator(this, function* takeWhile(input) {
            let index = 0
            for (const element of input) {
                if (pull(predicate(element, index++))) {
                    yield element
                } else {
                    if (specifier?.takeFinal) {
                        yield element
                    }
                    return
                }
            }
        }) as any
    }
    take(count: number): Seq<T> {
        const END_MARKER = Symbol("DUMMY")

        chk(this.take).count(count)
        return SeqOperator(this, function* take(input) {
            let myCount = count
            if (myCount === 0) {
                yield* []
                return
            }
            if (myCount < 0) {
                myCount = -myCount
                const results = seq(input)
                    .append(END_MARKER)
                    .window(myCount + 1, (...window) => {
                        if (window[window.length - 1] === END_MARKER) {
                            window.pop()
                            return window as T[]
                        }
                        return undefined
                    })
                    .filter(x => x !== undefined)
                    .first()
                    .pull() as T[]

                yield* results
            } else {
                yield* seq(input).takeWhile((_, index) => index < myCount - 1, {
                    takeFinal: true
                })
            }
        }) as any
    }
    toArray() {
        return lazyFromOperator(this, function toArray(input) {
            return [...input]
        })
    }
    toMap<K, V>(kvpProjection: Seq.Iteratee<T, readonly [K, V]>) {
        // ! POLYMORPHIC !

        kvpProjection = chk(this.toMap).kvpProjection(kvpProjection)
        return lazyFromOperator(this, function toMap(input) {
            return input
                .map(kvpProjection)
                .toArray()
                .map(x => new Map(x))
                .pull()
        })
    }
    toSet() {
        return lazyFromOperator(this, function toSet(input) {
            return new Set(input)
        })
    }
    uniqBy(projection: Seq.NoIndexIteratee<T, any>): Seq<T> {
        chk(this.uniqBy).projection(projection)
        return SeqOperator(this, function* uniqBy(input) {
            const seen = new Set()
            for (const element of input) {
                const key = pull(projection(element))
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        })
    }
    uniq() {
        // ! POLYMORPHIC !

        return SeqOperator(this, function* uniq(input) {
            yield* seq(input).uniqBy(x => x)
        })
    }
    window<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S | Lazy<S>
    ): Seq<S>
    window<L extends number>(size: L): Seq<getWindowOutputType<T, L>>
    window<L extends number, S>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => S
    ): Seq<any> {
        chk(this.window).size(size)
        projection ??= (...window: any) => window as any
        chk(this.window).projection(projection)
        return SeqOperator(this, function* window(input) {
            const buffer = Array<T>(size)
            let i = 0
            for (const item of input) {
                buffer[i++ % size] = item
                if (i >= size) {
                    yield pull(
                        (projection as any).call(
                            null,
                            ...buffer.slice(i % size),
                            ...buffer.slice(0, i % size)
                        )
                    )
                }
            }
            if (i > 0 && i < size) {
                yield pull((projection as any).call(null, ...buffer.slice(0, i)))
            }
        })
    }
    zip<Xs extends [any, ...any[]]>(others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }): Seq<getZipValuesType<[T, ...Xs]>>
    zip<Xs extends [any, ...any[]], R>(
        others: {
            [K in keyof Xs]: Seq.Input<Xs[K]>
        },
        projection: (...args: getZipValuesType<[T, ...Xs]>) => R
    ): Seq<R>
    zip<Xs extends [any, ...any[]], R>(
        _others: {
            [K in keyof Xs]: Seq.Input<Xs[K]>
        },
        projection?: (...args: getZipValuesType<[T, ...Xs]>) => R
    ): Seq<any> {
        const others = _others.map(seq)
        projection ??= (...args: any[]) => args as any
        chk(this.zip).projection(projection)
        return SeqOperator(this, function* zip(input) {
            const iterators = [input, ...others].map(_iter) as (Iterator<any> | undefined)[]
            while (true) {
                const results = iterators.map((iter, i) => {
                    if (!iter) {
                        return undefined
                    }
                    const result = iter.next()
                    if (result.done) {
                        iterators[i]?.return?.()
                        iterators[i] = undefined
                        return undefined
                    }
                    return result
                })
                if (results.every(r => !r)) {
                    break
                }
                yield pull(projection.apply(undefined, results.map(r => r?.value) as any))
            }
        }) as any
    }
}

export const SeqOperator = function seq<In, Out>(
    operand: In,
    impl: (input: In) => Iterable<Out>
): Seq<Out> {
    const myAbstractSeq = new (Seq as any)()
    return Object.assign(myAbstractSeq, {
        _operator: impl.name,
        _operand: operand,
        [Symbol.iterator]: function operator() {
            return _iter(impl.call(this, this._operand))
        }
    })
}

export namespace Seq {
    type MaybeLazy<T> = T | Lazy<T>
    export type IndexIteratee<O> = (index: number) => MaybeLazy<O>

    export type NoInputAction = () => unknown | Lazy<unknown>
    export type Iteratee<E, O> = (element: E, index: number) => MaybeLazy<O>
    export type NoIndexIteratee<E, O> = (element: E) => MaybeLazy<O>
    export type StageIteratee<E, O> = (element: E, index: number, stage: "before" | "after") => O
    export type Predicate<E> = Iteratee<E, boolean>
    export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

    export type Reducer<E, O> = (acc: O, element: E, index: number) => MaybeLazy<O>
    export type IterableOrIterator<E> = Iterable<E> | Iterator<E>
    export type FunctionInput<E> = () => MaybeLazy<IterableOrIterator<MaybeLazy<E>>>

    export type ObjectIterable<E> = object & (Iterable<E> | Iterator<E>)
    export type Input<E> = MaybeLazy<ObjectIterable<E>> | FunctionInput<E>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
    export type Group<K, V> = [K, Seq<V>]
}

loadCheckers(Seq.prototype)
