import { chk, loadCheckers } from "../../errors/error.js"
import type { LazyAsync } from "../../lazy/index.js"
import { lazyFromOperator } from "../../lazy/index.js"
import { Stage, _aiter, parseStage, returnKvp, shuffleArray } from "../../utils.js"
import { aseq } from "./aseq.ctor.js"
import {
    type EachCallStage,
    type SkipWhileOptions,
    SkippingMode,
    type TakeWhileSpecifier,
    type getConcatElementType,
    type getWindowArgsType,
    type getWindowOutputType,
    type getZipValuesType
} from "./common-types.js"
import { Seq } from "./seq.class.js"
class ThrownErrorMarker {
    constructor(public error: any) {}
}
export abstract class ASeq<T> implements AsyncIterable<T> {
    get [Symbol.toStringTag]() {
        return "ASeq"
    }
    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    get _qr() {
        return this.toArray().pull()
    }
    append<Ts extends any[]>(...items: Ts): ASeq<T | Ts[number]> {
        return ASeqOperator(this, async function* append(input) {
            yield* aseq(input).concat(items)
        })
    }
    at(index: number): LazyAsync<T | undefined> {
        return Seq.prototype.at.call(this, index)
    }
    cache(): ASeq<T> {
        const self = this
        const _cache: (T | ThrownErrorMarker)[] = []
        let alreadyDone = false
        let iterator: AsyncIterator<T>
        let pending: Promise<void> | undefined
        return ASeqOperator(this, async function* cache() {
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
                    iterator ??= _aiter(self)
                    if (!pending) {
                        pending = (async () => {
                            try {
                                const { done, value } = await iterator.next()
                                if (done) {
                                    alreadyDone = true
                                    return
                                }
                                _cache.push(value)
                                pending = undefined
                                return
                            } catch (err) {
                                _cache.push(new ThrownErrorMarker(err as any))
                                pending = undefined
                                return
                            }
                        })()
                    }
                    await pending
                } else {
                    return
                }
            }
        })
    }
    catch<S>(handler: ASeq.Iteratee<unknown, ASeq.SimpleInput<S>>): ASeq<T | S>
    catch(handler: ASeq.Iteratee<unknown, void>): ASeq<T>
    catch<S>(handler: ASeq.Iteratee<unknown, void | ASeq.SimpleInput<S>>): ASeq<any> {
        chk(this.catch).handler(handler)
        return ASeqOperator(this, async function* catch_(input) {
            let i = 0
            const iterator = _aiter(input)
            for (;;) {
                try {
                    const result = await iterator.next()
                    var value = result.value
                    if (result.done) {
                        return
                    }
                    yield value
                } catch (err: any) {
                    const error = err
                    const result = await handler(error, i)
                    if (!result || result == null) {
                        return
                    }
                    yield* aseq(result)
                    return
                }
                i++
            }
        })
    }
    chunk<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S
    ): ASeq<S>
    chunk<L extends number>(size: L): ASeq<getWindowOutputType<T, L>>
    chunk<L extends number, S>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => S
    ): ASeq<getWindowOutputType<T, L>> {
        chk(this.chunk).size(size)
        projection ??= (...chunk: any) => chunk as any
        chk(this.chunk).projection(projection)
        return ASeqOperator(this, async function* chunk(input) {
            let chunk: T[] = []
            for await (const item of input) {
                chunk.push(item)
                if (chunk.length === size) {
                    yield projection(...(chunk as any))
                    chunk = []
                }
            }
            if (chunk.length) {
                yield projection(...(chunk as any))
            }
        }) as any
    }
    concatMap<S>(
        projection: ASeq.Iteratee<T, ASeq.SimpleInput<S>>
    ): ASeq<getConcatElementType<T, S>> {
        chk(this.concatMap).projection(projection)
        return ASeqOperator(this, async function* concatMap(input) {
            let index = 0
            for await (const element of input) {
                for await (const projected of aseq(await projection(element, index++))) {
                    yield projected
                }
            }
        }) as any
    }
    concat<ASeqs extends ASeq.SimpleInput<any>[]>(
        ..._otherInputs: ASeqs
    ): ASeq<T | ASeq.ElementOfInput<ASeqs[number]>> {
        const inputs = _otherInputs.map(aseq)
        return ASeqOperator(this, async function* concat(input) {
            for await (const element of input) {
                yield element
            }
            for (const iterable of inputs) {
                for await (const element of iterable) {
                    yield element
                }
            }
        }) as any
    }
    count(): LazyAsync<number>
    count(predicate: ASeq.Predicate<T>): LazyAsync<number>
    count(predicate?: ASeq.Predicate<T>): LazyAsync<number> {
        return Seq.prototype.count.call(this, predicate as any) as any
    }
    each(action: ASeq.StageIteratee<T, void>, stage: EachCallStage = "before") {
        chk(this.each).action(action)
        chk(this.each).stage(stage)
        const myStage = parseStage(stage)
        return ASeqOperator(this, async function* each(input) {
            let index = 0
            for await (const element of input) {
                if (myStage & Stage.Before) {
                    await action(element, index, "before")
                }
                yield element
                if (myStage & Stage.After) {
                    await action(element, index, "after")
                }
                index++
            }
        })
    }
    every(predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
        return Seq.prototype.every.call(this, predicate as any) as any
    }
    filter<S extends T>(predicate: Seq.TypePredicate<T, S>): ASeq<S>
    filter(predicate: ASeq.Predicate<T>): ASeq<T>
    filter(predicate: ASeq.Predicate<T>) {
        predicate = chk(this.filter).predicate(predicate)
        return ASeqOperator(this, async function* filter(input) {
            yield* aseq(input).concatMap(async (element, index) =>
                (await predicate(element, index)) ? [element] : []
            )
        })
    }
    findLast(predicate: ASeq.Predicate<T>): LazyAsync<T | undefined>
    findLast<const Alt>(predicate: ASeq.Predicate<T>, alt: Alt): LazyAsync<T | Alt>
    findLast<Alt = T>(predicate: ASeq.Predicate<T>, alt?: Alt) {
        return Seq.prototype.findLast.call(this, predicate as any, alt)
    }
    find(predicate: ASeq.Predicate<T>): LazyAsync<T | undefined>
    find<const Alt>(predicate: ASeq.Predicate<T>, alt: Alt): LazyAsync<T | Alt>
    find<Alt = T>(predicate: ASeq.Predicate<T>, alt?: Alt) {
        return Seq.prototype.find.call(this, predicate as any, alt)
    }
    first(): LazyAsync<T | undefined>
    first<const Alt>(alt: Alt): LazyAsync<T | Alt>
    first<const Alt = undefined>(alt?: Alt) {
        return lazyFromOperator(this, async function first(input) {
            for await (const element of input) {
                return element
            }
            return alt
        })
    }
    groupBy<K>(keyProjection: ASeq.NoIndexIteratee<T, K>) {
        chk(this.groupBy).keyProjection(keyProjection)
        return lazyFromOperator(this, async function groupBy(input) {
            const map = new Map<K, [T, ...T[]]>()
            for await (const element of input) {
                const key = await keyProjection(element)
                let group = map.get(key)
                if (!group) {
                    group = [element]
                    map.set(key, group)
                } else {
                    group.push(element)
                }
            }
            return map
        })
    }
    includes<T extends S, S>(this: ASeq<T>, value: S): LazyAsync<boolean>
    includes<S extends T>(value: S): LazyAsync<boolean>
    includes<S extends T>(value: S): LazyAsync<boolean> {
        return Seq.prototype.includes.call(this, value) as any
    }
    last(): LazyAsync<T | undefined>
    last<const Alt>(alt: Alt): LazyAsync<T | Alt>
    last<Alt = undefined>(alt?: Alt) {
        return lazyFromOperator(this, async function last(input) {
            let last: T | Alt = alt as Alt
            for await (const element of input) {
                last = element
            }
            return last as T | Alt
        })
    }
    map<S>(projection: ASeq.Iteratee<T, S>): ASeq<S> {
        chk(this.map).projection(projection)
        return ASeqOperator(this, async function* map(input) {
            yield* aseq(input).concatMap(async (element, index) => [
                await projection(element, index)
            ])
        })
    }
    maxBy<K>(projection: ASeq.Iteratee<T, K>): LazyAsync<T | undefined>
    maxBy<K, const Alt>(projection: ASeq.Iteratee<T, K>, alt?: Alt): LazyAsync<T | Alt>
    maxBy<R>(projection: ASeq.Iteratee<T, R>, alt?: any) {
        return Seq.prototype.maxBy.call(this, projection, alt)
    }
    minBy<K>(projection: ASeq.Iteratee<T, K>): LazyAsync<T | undefined>
    minBy<K, const Alt>(projection: ASeq.Iteratee<T, K>, alt?: Alt): LazyAsync<T | Alt>
    minBy<K>(projection: ASeq.Iteratee<T, K>, alt?: any) {
        return Seq.prototype.minBy.call(this, projection, alt)
    }
    orderBy<S>(projection: ASeq.NoIndexIteratee<T, S>, reverse = false): ASeq<T> {
        chk(this.orderBy).projection(projection)
        chk(this.orderBy).reverse(reverse)
        return ASeqOperator(this, async function* orderBy(input) {
            yield* await aseq(input)
                .map(e => returnKvp(e, projection(e), e))
                .toArray()
                .map(async xs => {
                    xs.sort((a, b) => {
                        const comp = a.key < b.key ? -1 : a.key > b.key ? 1 : 0
                        return reverse ? -comp : comp
                    })
                    return xs.map(x => x.value)
                })
                .pull()
        })
    }
    reduce(reducer: ASeq.Reducer<T, T>): LazyAsync<T>
    reduce<Acc>(reducer: ASeq.Reducer<T, Acc>, initial: Acc): LazyAsync<Acc>
    reduce<Acc>(reducer: ASeq.Reducer<T, Acc>, initial?: Acc): any {
        return Seq.prototype.reduce.call(this, reducer as any, initial)
    }
    reverse() {
        return ASeqOperator(this, async function* reverse(input) {
            yield* await aseq(input)
                .toArray()
                .map(x => x.reverse())
                .pull()
        })
    }
    scan(reducer: ASeq.Reducer<T, T>): ASeq<T>
    scan<Acc>(reducer: ASeq.Reducer<T, Acc>, initial: Acc): ASeq<Acc>
    scan<Acc>(reducer: ASeq.Reducer<T, Acc>, initial?: Acc) {
        chk(this.scan).reducer(reducer)
        return ASeqOperator(this, async function* scan(input) {
            let hasAcc = initial !== undefined

            let acc: Acc = initial as any
            let index = 0
            if (hasAcc) {
                yield acc
            }
            for await (const element of input) {
                if (!hasAcc) {
                    acc = element as any
                    hasAcc = true
                } else {
                    acc = await reducer(acc, element, index++)
                }

                yield acc
            }
        })
    }
    seqEquals<T extends S, S>(
        this: AsyncIterable<T>,
        _other: ASeq.SimpleInput<S>
    ): LazyAsync<boolean>
    seqEquals<S extends T>(_other: ASeq.SimpleInput<S>): LazyAsync<boolean>
    seqEquals(_other: ASeq.SimpleInput<T>) {
        const other = aseq(_other)
        return lazyFromOperator(this, async function seqEquals(input) {
            const otherIterator = _aiter(other)
            for await (const element of input) {
                const otherElement = await otherIterator.next()
                if (otherElement.done || element !== otherElement.value) {
                    return false
                }
            }
            return !!(await otherIterator.next()).done
        })
    }
    setEquals<S extends T>(_other: ASeq.Input<S>): LazyAsync<boolean>
    setEquals<T extends S, S>(this: AsyncIterable<T>, _other: ASeq.Input<S>): LazyAsync<boolean>
    setEquals<S>(_other: ASeq.SimpleInput<S>) {
        const other = aseq(_other)
        return lazyFromOperator(this, async function setEquals(input) {
            const set = new Set<T>() as Set<any>
            for await (const element of other) {
                set.add(element)
            }
            for await (const element of input) {
                if (!set.delete(element)) {
                    return false
                }
            }
            return set.size === 0
        })
    }
    shuffle() {
        return ASeqOperator(this, async function* shuffle(input) {
            const array = await aseq(input).toArray().pull()
            shuffleArray(array)
            yield* array
        })
    }
    skipWhile(predicate: ASeq.Predicate<T>, options?: SkipWhileOptions): ASeq<T> {
        predicate = chk(this.skipWhile).predicate(predicate)
        return ASeqOperator(this, async function* skipWhile(input) {
            let prevMode = SkippingMode.None as SkippingMode
            let index = 0
            for await (const element of input) {
                if (prevMode === SkippingMode.NotSkipping) {
                    yield element
                    continue
                }
                const newSkipping: boolean = await predicate(element, index++)
                if (!newSkipping) {
                    if (prevMode !== SkippingMode.Skipping || !options?.skipFinal) {
                        yield element
                    }
                }
                prevMode = newSkipping ? SkippingMode.Skipping : SkippingMode.NotSkipping
            }
        }) as any
    }
    skip(count: number): ASeq<T> {
        const SKIP = Symbol("skip")
        chk(this.skip).count(count)
        return ASeqOperator(this, async function* skip(input) {
            let myCount = count
            if (myCount === 0) {
                yield* aseq(input)
                return
            }
            if (myCount < 0) {
                myCount = -myCount
                yield* aseq(input)
                    .window(myCount + 1, (...window) => {
                        if (window.length === myCount + 1) {
                            return window[0]
                        }
                        return SKIP
                    })
                    .filter(x => x !== SKIP)
            } else {
                yield* aseq(input).skipWhile((_, index) => index < myCount, {})
            }
        }) as any
    }
    some(predicate: ASeq.Predicate<T>): LazyAsync<boolean> {
        return Seq.prototype.some.call(this, predicate as any) as any
    }
    sumBy(projection: ASeq.Iteratee<T, number>): LazyAsync<number> {
        return Seq.prototype.sumBy.call(this, projection as any) as any
    }
    takeWhile(predicate: ASeq.Predicate<T>, specifier?: TakeWhileSpecifier): ASeq<T> {
        chk(this.takeWhile).predicate(predicate)
        return ASeqOperator(this, async function* takeWhile(input) {
            let index = 0

            for await (const element of input) {
                if (await predicate(element, index++)) {
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
    take(count: number): ASeq<T> {
        const END_MARKER = Symbol("end marker")
        chk(this.take).count(count)
        return ASeqOperator(this, async function* take(input) {
            let myCount = count
            if (myCount === 0) {
                yield* []
                return
            }
            if (myCount < 0) {
                myCount = -myCount
                const results = (await aseq(input)
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
                    .pull()) as T[]
                yield* results
            } else {
                yield* aseq(input).takeWhile((_, index) => index < myCount - 1, {
                    takeFinal: true
                })
            }
        }) as any
    }
    toArray() {
        return lazyFromOperator(this, async function toArray(input) {
            const result: T[] = []
            for await (const element of input) {
                result.push(element)
            }
            return result
        })
    }
    toMap<K, V>(kvpProjection: ASeq.Iteratee<T, readonly [K, V]>): LazyAsync<Map<K, V>> {
        return Seq.prototype.toMap.call(this, kvpProjection as any) as any
    }
    toSet() {
        return lazyFromOperator(this, async function toSet(input) {
            const result = new Set<T>()
            for await (const element of input) {
                result.add(element)
            }
            return result
        })
    }
    uniqBy(projection: ASeq.NoIndexIteratee<T, any>): ASeq<T> {
        chk(this.uniqBy).projection(projection)
        return ASeqOperator(this, async function* uniqBy(input) {
            const seen = new Set()
            for await (const element of input) {
                const key = await projection(element)
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        })
    }
    uniq() {
        return ASeqOperator(this, async function* uniq(input) {
            yield* aseq(input).uniqBy(x => x)
        })
    }
    window<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S
    ): ASeq<S>
    window<L extends number>(size: L): ASeq<getWindowOutputType<T, L>>
    window<L extends number, S>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => S
    ): ASeq<any> {
        chk(this.window).size(size)
        projection ??= (...window: any) => window as any
        chk(this.window).projection(projection)
        return ASeqOperator(this, async function* window(input) {
            const buffer = Array<T>(size)
            let i = 0
            for await (const item of input) {
                buffer[i++ % size] = item
                if (i >= size) {
                    yield (projection as any).call(
                        null,
                        ...buffer.slice(i % size),
                        ...buffer.slice(0, i % size)
                    )
                }
            }

            if (i > 0 && i < size) {
                yield (projection as any).call(null, ...buffer.slice(0, i))
            }
        })
    }
    zip<Xs extends [any, ...any[]]>(others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }): ASeq<getZipValuesType<[T, ...Xs]>>
    zip<Xs extends [any, ...any[]], R>(
        _others: {
            [K in keyof Xs]: ASeq.Input<Xs[K]>
        },
        projection?: (...args: getZipValuesType<[T, ...Xs]>) => R | Promise<R>
    ): ASeq<R>
    zip<Xs extends [any, ...any[]], R>(
        _others: {
            [K in keyof Xs]: ASeq.Input<Xs[K]>
        },
        projection?: (...args: getZipValuesType<[T, ...Xs]>) => R | Promise<R>
    ): ASeq<any> {
        const others = _others.map(aseq)
        projection ??= (...args: any[]) => args as any
        chk(this.zip).projection(projection)
        return ASeqOperator(this, async function* zip(input) {
            const iterators = [input, ...others].map(_aiter) as (AsyncIterator<any> | undefined)[]
            while (true) {
                const pResults = iterators.map(async (iter, i) => {
                    if (!iter) {
                        return undefined
                    }
                    const result = await iter.next()
                    if (result.done) {
                        iterators[i] = undefined
                        return undefined
                    }
                    return result
                })
                const results = await Promise.all(pResults)
                if (results.every(r => !r)) {
                    break
                }
                yield projection.apply(undefined, results.map(r => r?.value) as any)
            }
        }) as any
    }
}
export const ASeqOperator = function aseq<In, Out>(
    operand: In,
    impl: (input: In) => AsyncIterable<Out>
): ASeq<Out> {
    const obj = new (ASeq as any)()
    return Object.assign(obj, {
        _operator: impl.name,
        _operand: operand,
        [Symbol.asyncIterator]: function operator() {
            return _aiter(impl.call(this, this._operand))
        }
    })
}

export namespace ASeq {
    type MaybePromise<T> = T | PromiseLike<T>
    export type IndexIteratee<O> = (index: number) => MaybePromise<O>
    export type Iteratee<E, O> = (element: E, index: number) => MaybePromise<O>
    export type NoIndexIteratee<E, O> = (element: E) => MaybePromise<O>

    export type StageIteratee<E, O> = (
        element: E,
        index: number,
        stage: "before" | "after"
    ) => MaybePromise<O>
    export type Predicate<E> = Iteratee<E, boolean>
    export type Reducer<E, O> = (acc: O, element: E, index: number) => MaybePromise<O>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
    export type IterableOrIterator<E> =
        | AsyncIterable<E>
        | AsyncIterator<E>
        | Iterable<E>
        | Iterator<E>
    export type FunctionInput<E> = () => MaybePromise<IterableOrIterator<E>>
    export type DesyncedInput<E> = Iterable<MaybePromise<E>>
    export type IterableInput<E> = DesyncedInput<E> | AsyncIterable<E>
    export type SimpleInput<E> = IterableInput<E> | FunctionInput<E>
    export type Input<E> = SimpleInput<MaybePromise<E>>
}

loadCheckers(ASeq.prototype)
