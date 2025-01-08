import { chk, loadCheckers } from "../errors/error.js"
import type { DoddleReadableStream } from "../extra-types.js"
import type { Doddle, DoddleAsync } from "../lazy/index.js"
import { doddle, lazyFromOperator, pull } from "../lazy/index.js"
import {
    Stage,
    _aiter,
    createCompareKey,
    parseStage,
    returnKvp,
    setClassName,
    shuffleArray,
    type MaybeDoddle,
    type MaybePromise
} from "../utils.js"
import { aseq } from "./aseq.ctor.js"
import {
    SkippingMode,
    type EachCallStage,
    type SkipWhileOptions,
    type TakeWhileSpecifier,
    type getConcatElementType,
    type getWindowArgsType,
    type getWindowOutputType,
    type getZipValuesType
} from "./common-types.js"
import { Seq } from "./seq.class.js"
import { seq } from "./seq.ctor.js"
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
    at(index: number): DoddleAsync<T | undefined> {
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
    catch<S>(
        handler: ASeq.Iteratee<unknown, void | Promise<void> | ASeq.SimpleInput<S>>
    ): ASeq<any> {
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
                    const result = await pull(handler(error, i))
                    if (!result) {
                        return
                    }
                    const pulled = pull(result as any)
                    yield* aseq(pulled)
                    return
                }
                i++
            }
        })
    }
    chunk<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
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
                    yield pull(projection(...(chunk as any)))
                    chunk = []
                }
            }
            if (chunk.length) {
                yield pull(projection(...(chunk as any)))
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
                for await (const projected of aseq(await pull(projection(element, index++)))) {
                    yield pull(projected)
                }
            }
        }) as any
    }
    prepend<Ts extends any[]>(...items: Ts): ASeq<Ts[number] | T> {
        return ASeqOperator(this, async function* prepend(input) {
            yield* items
            yield* input
        })
    }
    join(separator = ","): DoddleAsync<string> {
        return Seq.prototype.join.call(this, separator) as any
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
    count(): DoddleAsync<number>
    count(predicate: ASeq.Predicate<T>): DoddleAsync<number>
    count(predicate?: ASeq.Predicate<T>): DoddleAsync<number> {
        return Seq.prototype.count.call(this, predicate as any) as any
    }
    each(action: ASeq.StageIteratee<T, unknown>, stage: EachCallStage = "before") {
        chk(this.each).action(action)
        chk(this.each).stage(stage)
        const myStage = parseStage(stage)
        return ASeqOperator(this, async function* each(input) {
            let index = 0
            for await (const element of input) {
                if (myStage & Stage.Before) {
                    await pull(action(element, index, "before"))
                }
                yield element
                if (myStage & Stage.After) {
                    await pull(action(element, index, "after"))
                }
                index++
            }
        })
    }
    every(predicate: ASeq.Predicate<T>): DoddleAsync<boolean> {
        return Seq.prototype.every.call(this, predicate as any) as any
    }
    filter<S extends T>(predicate: Seq.TypePredicate<T, S>): ASeq<S>
    filter(predicate: ASeq.Predicate<T>): ASeq<T>
    filter(predicate: ASeq.Predicate<T>) {
        predicate = chk(this.filter).predicate(predicate)
        return ASeqOperator(this, async function* filter(input) {
            yield* aseq(input).concatMap(async (element, index) =>
                (await pull(predicate(element, index))) ? [element] : []
            )
        })
    }
    findLast(predicate: ASeq.Predicate<T>): DoddleAsync<T | undefined>
    findLast<const Alt>(predicate: ASeq.Predicate<T>, alt: Alt): DoddleAsync<T | Alt>
    findLast<Alt = T>(predicate: ASeq.Predicate<T>, alt?: Alt) {
        return Seq.prototype.findLast.call(this, predicate as any, alt)
    }
    find(predicate: ASeq.Predicate<T>): DoddleAsync<T | undefined>
    find<const Alt>(predicate: ASeq.Predicate<T>, alt: Alt): DoddleAsync<T | Alt>
    find<Alt = T>(predicate: ASeq.Predicate<T>, alt?: Alt) {
        return Seq.prototype.find.call(this, predicate as any, alt)
    }
    first(): DoddleAsync<T | undefined>
    first<const Alt>(alt: Alt): DoddleAsync<T | Alt>
    first<const Alt = undefined>(alt?: Alt) {
        return lazyFromOperator(this, async function first(input) {
            for await (const element of input) {
                return element
            }
            return alt
        })
    }

    before(action: ASeq.NoInputAction): ASeq<T> {
        function a() {}
        let b = a()
        chk(this.before).action(action)
        return ASeqOperator(this, async function* before(input) {
            await pull(action())
            yield* input
        })
    }

    toRecord<Key extends PropertyKey, Value>(
        projection: ASeq.Iteratee<T, readonly [Key, Value]>
    ): DoddleAsync<Record<Key, Value>> {
        return Seq.prototype.toRecord.call(this, projection as any) as any
    }

    toRecordBy<K extends PropertyKey>(projection: ASeq.Iteratee<T, K>): DoddleAsync<Record<K, T>> {
        return Seq.prototype.toRecordBy.call(this, projection as any) as any
    }

    as<S>() {
        return this as any as ASeq<S>
    }

    groupBy<K>(keyProjection: ASeq.NoIndexIteratee<T, K>): ASeq<ASeq.Group<K, T>> {
        chk(this.groupBy).keyProjection(keyProjection)

        return ASeqOperator(this, async function* groupBy(input) {
            const map = new Map<K, [T, ...T[]]>()
            const keys = [] as K[]
            const shared = input
                .map(async v => {
                    const key = (await pull(keyProjection(v))) as K
                    const group = map.get(key)
                    if (group) {
                        group.push(v)
                    } else {
                        keys.push(key)
                        map.set(key, [v])
                    }
                })
                .share()
            async function* getGroupIterable(key: K): AsyncIterable<T> {
                const group = map.get(key)!
                for (let i = 0; ; i++) {
                    if (i < group.length) {
                        yield group[i]
                        continue
                    }

                    for await (const _ of shared) {
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
                    yield [key, aseq(() => getGroupIterable(key))]
                    continue
                }
                for await (const _ of shared) {
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
    includes<T extends S, S>(this: ASeq<T>, value: S): DoddleAsync<boolean>
    includes<S extends T>(value: S): DoddleAsync<boolean>
    includes<S extends T>(value: S): DoddleAsync<boolean> {
        return Seq.prototype.includes.call(this, value) as any
    }
    last(): DoddleAsync<T | undefined>
    last<const Alt>(alt: Alt): DoddleAsync<T | Alt>
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
                (await pull(projection(element, index))) as S
            ])
        })
    }
    maxBy<K>(projection: ASeq.Iteratee<T, K>): DoddleAsync<T | undefined>
    maxBy<K, const Alt>(projection: ASeq.Iteratee<T, K>, alt?: Alt): DoddleAsync<T | Alt>
    maxBy<R>(projection: ASeq.Iteratee<T, R>, alt?: any) {
        return Seq.prototype.maxBy.call(this, projection, alt)
    }
    minBy<K>(projection: ASeq.Iteratee<T, K>): DoddleAsync<T | undefined>
    minBy<K, const Alt>(projection: ASeq.Iteratee<T, K>, alt?: Alt): DoddleAsync<T | Alt>
    minBy<K>(projection: ASeq.Iteratee<T, K>, alt?: any) {
        return Seq.prototype.minBy.call(this, projection, alt)
    }
    exclude(others: ASeq.Input<T>): ASeq<T> {
        return ASeqOperator(this, async function* exclude(input) {
            yield* input.excludeBy(others, x => x)
        })
    }
    excludeBy<K, S = T>(
        others: ASeq.Input<S>,
        projection: ASeq.NoIndexIteratee<T | S, K>
    ): ASeq<T> {
        chk(this.excludeBy).projection(projection)
        return ASeqOperator(this, async function* exclude(input) {
            const set = await aseq(others)
                .map(async x => {
                    return await pull(projection(x))
                })
                .toSet()
                .pull()
            yield* input.filter(async x => {
                const key = await pull(projection(x))
                return !set.has(key)
            })
        })
    }
    orderBy<K extends [unknown, ...unknown[]]>(
        projection: ASeq.NoIndexIteratee<T, K>,
        reverse?: boolean
    ): ASeq<T>
    orderBy<S>(projection: ASeq.NoIndexIteratee<T, S>, reverse?: boolean): ASeq<T>
    orderBy<S>(projection: ASeq.NoIndexIteratee<T, S>, reverse = false): ASeq<T> {
        chk(this.orderBy).projection(projection)
        chk(this.orderBy).reverse(reverse)
        const compareKey = createCompareKey(reverse)
        return ASeqOperator(this, async function* orderBy(input) {
            yield* await aseq(input)
                .map(e => returnKvp(input, projection(e), e))
                .toArray()
                .map(async xs => {
                    void xs.sort(compareKey)
                    return xs.map(x => x.value)
                })
                .pull()
        })
    }
    reduce(reducer: ASeq.Reducer<T, T>): DoddleAsync<T>
    reduce<Acc>(reducer: ASeq.Reducer<T, Acc>, initial: Acc): DoddleAsync<Acc>
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
                    acc = (await pull(reducer(acc, element, index++))) as any
                }

                yield acc
            }
        })
    }

    seqEqualsBy<K, S = T>(
        _other: ASeq.Input<S>,
        projection: ASeq.NoIndexIteratee<S | T, K>
    ): DoddleAsync<boolean> {
        const other = aseq(_other)
        return lazyFromOperator(this, async function seqEqualsBy(input) {
            const otherIterator = _aiter(other)
            try {
                for await (const element of input) {
                    const otherElement = await otherIterator.next()
                    const keyThis = await pull(projection(element as any))
                    const keyOther = await pull(projection(otherElement.value))
                    if (otherElement.done || keyThis !== keyOther) {
                        return false
                    }
                }
                return !!(await otherIterator.next()).done
            } finally {
                await otherIterator.return?.()
            }
        })
    }

    seqEquals<T extends S, S>(this: AsyncIterable<T>, _other: ASeq.Input<S>): DoddleAsync<boolean>
    seqEquals<S extends T>(_other: ASeq.Input<S>): DoddleAsync<boolean>
    seqEquals(_other: ASeq.Input<T>) {
        return this.seqEqualsBy(_other, x => x)
    }

    setEqualsBy<K, S = T>(
        _other: ASeq.Input<S>,
        projection: ASeq.NoIndexIteratee<S | T, K>
    ): DoddleAsync<boolean> {
        const other = aseq(_other)
        return lazyFromOperator(this, async function setEqualsBy(input) {
            const set = new Set()
            for await (const element of other) {
                set.add(await pull(projection(element)))
            }
            for await (const element of input) {
                if (!set.delete(await pull(projection(element)))) {
                    return false
                }
            }
            return set.size === 0
        })
    }

    setEquals<S extends T>(_other: ASeq.Input<S>): DoddleAsync<boolean>
    setEquals<T extends S, S>(this: AsyncIterable<T>, _other: ASeq.Input<S>): DoddleAsync<boolean>
    setEquals<S>(_other: ASeq.SimpleInput<S>) {
        const other = aseq(_other)
        return this.setEqualsBy(other, x => x)
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
                const newSkipping: boolean = await pull(predicate(element, index++))
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
    some(predicate: ASeq.Predicate<T>): DoddleAsync<boolean> {
        return Seq.prototype.some.call(this, predicate as any) as any
    }
    sumBy(projection: ASeq.Iteratee<T, number>): DoddleAsync<number> {
        return Seq.prototype.sumBy.call(this, projection as any) as any
    }
    takeWhile(predicate: ASeq.Predicate<T>, specifier?: TakeWhileSpecifier): ASeq<T> {
        chk(this.takeWhile).predicate(predicate)
        return ASeqOperator(this, async function* takeWhile(input) {
            let index = 0

            for await (const element of input) {
                if (await pull(predicate(element, index++))) {
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
    after(action: ASeq.NoInputAction): ASeq<T> {
        chk(this.after).action(action)
        return ASeqOperator(this, async function* after(input) {
            yield* input
            await pull(action())
        })
    }
    share(): ASeq<T> {
        const iter = doddle(() => _aiter(this))
        let err: Error | undefined = undefined
        return ASeqOperator(this, async function* share() {
            if (err) {
                throw err
            }
            try {
                while (true) {
                    const { done, value } = await iter.pull().next()
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

    toMapBy<K>(projection: ASeq.Iteratee<T, K>): DoddleAsync<Map<K, T>> {
        return Seq.prototype.toMapBy.call(this, projection as any) as any
    }

    toMap<K, V>(kvpProjection: ASeq.Iteratee<T, readonly [K, V]>): DoddleAsync<Map<K, V>> {
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
                const key = await pull(projection(element))
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
        projection: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
    ): ASeq<S>
    window<L extends number>(size: L): ASeq<getWindowOutputType<T, L>>
    window<L extends number, S>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
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
    }): ASeq<getZipValuesType<[T, ...Xs]>>
    zip<Xs extends [any, ...any[]], R>(
        _others: {
            [K in keyof Xs]: ASeq.Input<Xs[K]>
        },
        projection: (...args: getZipValuesType<[T, ...Xs]>) => Doddle.MaybePromised<R>
    ): ASeq<R>
    zip<Xs extends [any, ...any[]], R>(
        _others: {
            [K in keyof Xs]: ASeq.Input<Xs[K]>
        },
        projection?: (...args: getZipValuesType<[T, ...Xs]>) => Doddle.MaybePromised<R>
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
                        await iterators[i]?.return?.()
                        iterators[i] = undefined
                        return undefined
                    }
                    return result
                })
                const results = await Promise.all(pResults)
                if (results.every(r => !r)) {
                    break
                }
                yield pull(projection.apply(undefined, results.map(r => r?.value) as any))
            }
        }) as any
    }

    toSeq(): DoddleAsync<Seq<T>> {
        return lazyFromOperator(this, async function toSeq(input) {
            const all = await aseq(input).toArray().pull()
            return seq(all)
        })
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
    export type IndexIteratee<O> = (index: number) => Doddle.MaybePromised<O>
    export type Iteratee<E, O> = (element: E, index: number) => Doddle.MaybePromised<O>
    export type NoIndexIteratee<E, O> = (element: E) => Doddle.MaybePromised<O>
    export type StageIteratee<E, O> = (
        element: E,
        index: number,
        stage: "before" | "after"
    ) => Doddle.MaybePromised<O>
    export type Predicate<E> = Iteratee<E, boolean>
    export type Reducer<E, O> = (acc: O, element: E, index: number) => Doddle.MaybePromised<O>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
    export type IterableOrIterator<E> =
        | AsyncIterable<E>
        | AsyncIterator<E>
        | Seq.ObjectIterable<E>
        | Iterator<E>
        | DoddleReadableStream<E>

    export type FunctionInput<E> = () => Doddle.MaybePromised<IterableOrIterator<E>>
    export type DesyncedInput<E> = Seq.ObjectIterable<MaybePromise<E>>

    export type IterableInput<E> = DesyncedInput<E> | AsyncIterable<E> | DoddleReadableStream<E>

    export type SimpleInput<E> =
        | MaybeDoddle<IterableInput<E>>
        | DoddleAsync<IterableInput<E>>
        | FunctionInput<E>

    export type Input<E> = SimpleInput<MaybePromise<E>>
    export type NoInputAction = () => MaybeDoddle<MaybePromise<unknown>>
    export type Group<K, T> = readonly [K, ASeq<T>]
}
// Class name is used for various checks
// Need to make sure it's accessible even while minified
setClassName(ASeq, "ASeq")
loadCheckers(ASeq.prototype)
