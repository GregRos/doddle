import { chk, DoddleError, loadCheckers } from "../errors/error.js"
import type { Doddle } from "../lazy/index.js"
import { doddle, lazyFromOperator, pull } from "../lazy/index.js"
import type {
    Get_All_Dotted_Paths_Of,
    Get_Match_Object_Structure,
    Get_Value_At_Dotted_Path,
    Split_Dotted_Path
} from "../property-paths.js"
import {
    _iter,
    createCompareKey,
    getValueAtPath,
    parseStage,
    returnKvp,
    setClassName,
    shuffleArray,
    Stage
} from "../utils.js"

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
import { ___seq } from "./seq.ctor.js"
class ThrownErrorMarker {
    constructor(public error: any) {}
}

export abstract class Seq<T> implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>
    constructor() {
        // Class name is used for various checks
        // Need to make sure it's accessible even while minified
        setClassName(Seq, "Seq")
        loadCheckers(Seq.prototype)
    }
    get [Symbol.toStringTag]() {
        return "Seq"
    }
    get _qr() {
        return this.toArray().pull()
    }
    append<Ts extends any[]>(...items: Ts): Seq<T | Ts[number]> {
        return SeqOperator(this, function* append(input) {
            yield* ___seq(input).concat(items)
        })
    }
    at(index: number): Doddle<T | undefined> {
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
                    const { done, value } = iterator.next()
                    if (done) {
                        alreadyDone = true
                        return
                    }
                    _cache.push(value)
                    yield value
                    i++
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
                    yield* ___seq(result)
                    return
                }
                i++
            }
        })
    }

    product<Xs extends [any, ...any[]]>(others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }): Seq<getZipValuesType<[T, ...Xs]>>
    product<Xs extends [any, ...any[]], R>(
        others: {
            [K in keyof Xs]: Seq.Input<Xs[K]>
        },
        projection: (...args: getZipValuesType<[T, ...Xs]>) => R
    ): Seq<R>
    product<Xs extends [any, ...any[]], R>(
        _others: {
            [K in keyof Xs]: Seq.Input<Xs[K]>
        },
        projection?: (...args: getZipValuesType<[T, ...Xs]>) => R
    ): Seq<any> {
        const others = _others.map(___seq).map(x => x.cache())
        projection ??= (...args: any[]) => args as any
        chk(this.product).projection(projection)
        return SeqOperator(this, function* product(input) {
            let partialProducts = [[]] as any[][]
            for (const iterable of [input, ...others]) {
                const oldPartialProducts = partialProducts
                partialProducts = []
                for (const item of iterable) {
                    partialProducts = partialProducts.concat(
                        oldPartialProducts.map(x => [item, ...x])
                    )
                }
            }
            yield* partialProducts.map(x => pull(projection.apply(null, x as any)))
        })
    }
    prepend<Ts extends any[]>(...items: Ts): Seq<Ts[number] | T> {
        return SeqOperator(this, function* prepend(input) {
            yield* ___seq(items)
            yield* input
        })
    }

    join(separator: string): Doddle<string> {
        chk(this.join).separator(separator)
        return lazyFromOperator(this, function join(input) {
            return input
                .toArray()
                .map(x => x.join(separator))
                .pull()
        })
    }
    chunk<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S | Doddle<S>
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
    exclude(others: Seq.Input<T>): Seq<T> {
        return SeqOperator(this, function* exclude(input) {
            yield* input.excludeBy(others, x => x)
        })
    }
    excludeBy<K, S = T>(others: Seq.Input<S>, projection: Seq.NoIndexIteratee<T | S, K>): Seq<T> {
        chk(this.excludeBy).projection(projection)
        return SeqOperator(this, function* exclude(input) {
            const set = ___seq(others)
                .map(x => {
                    return pull(projection(x))
                })
                .toSet()
                .pull()
            yield* input.filter(x => {
                const key = pull(projection(x))
                return !set.has(key)
            })
        })
    }

    concatMap<S>(projection: Seq.Iteratee<T, Seq.Input<S>>): Seq<getConcatElementType<T, S>> {
        chk(this.concatMap).projection(projection)
        return SeqOperator(this, function* concatMap(input) {
            let index = 0
            for (const element of input) {
                for (const projected of ___seq(pull(projection(element, index++)))) {
                    yield projected
                }
            }
        }) as any
    }
    concat<Seqs extends Seq.Input<any>[]>(
        ..._iterables: Seqs
    ): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
        const iterables = _iterables.map(___seq)
        return SeqOperator(this, function* concat(input) {
            yield* input
            for (const iterable of iterables) {
                yield* iterable
            }
        }) as any
    }
    count(): Doddle<number>
    count(predicate: Seq.Predicate<T>): Doddle<number>
    count(predicate?: Seq.Predicate<T>): Doddle<number> {
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
    every(predicate: Seq.Predicate<T>): Doddle<boolean> {
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
            yield* ___seq(input).concatMap((element, index) =>
                pull(predicate(element, index)) ? [element] : []
            )
        })
    }
    findLast(predicate: Seq.Predicate<T>): Doddle<T | undefined>
    findLast<const Alt>(predicate: Seq.Predicate<T>, alt: Alt): Doddle<T | Alt>
    findLast<Alt = undefined>(predicate: Seq.Predicate<T>, alt?: Alt) {
        // ! POLYMORPHIC !
        predicate = chk(this.findLast).predicate(predicate)
        return lazyFromOperator(this, function findLast(input) {
            return input.filter(predicate).last(alt).pull() as any
        })
    }
    find(predicate: Seq.Predicate<T>): Doddle<T | undefined>
    find<const Alt>(predicate: Seq.Predicate<T>, alt: Alt): Doddle<T | Alt>
    find<Alt = T>(predicate: Seq.Predicate<T>, alt?: Alt) {
        // ! POLYMORPHIC !

        predicate = chk(this.find).predicate(predicate)
        return lazyFromOperator(this, function find(input) {
            return input.filter(predicate).first(alt).pull() as any
        })
    }

    share(): Seq<T> {
        const iter = doddle(() => _iter(this))
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

    pathMap<KeyPath extends Get_All_Dotted_Paths_Of<T>>(
        propertyPath: KeyPath
    ): Seq<Get_Value_At_Dotted_Path<T, KeyPath>> {
        chk(this.pathMap).propertyPath(propertyPath)
        return SeqOperator(this, function* pathMap(input) {
            for (const element of input) {
                yield getValueAtPath(element as any, propertyPath)
            }
        }) as any
    }
    drain(): Doddle<void> {
        return lazyFromOperator(this, function drain(input) {
            for (const _ of input) {
            }
        })
    }
    matchMap<
        KeyPath extends Get_All_Dotted_Paths_Of<T>,
        Cases extends Seq.$_MatchKeyMapping<
            Get_Match_Object_Structure<T, Split_Dotted_Path<KeyPath>>
        >
    >(path: KeyPath, cases: Cases): Seq<Doddle.Pulled<ReturnType<Cases[keyof Cases]>>> {
        chk(this.matchMap).propertyPath(path)
        const self = this

        return SeqOperator(this, function* matchByProperty(input) {
            let index = 0
            for (const element of input) {
                const key = getValueAtPath(element as any, path)
                chk(self.matchMap).cases_key(path, key)
                let projection = cases[key as keyof Cases]
                if (projection == null) {
                    projection = cases.__default__ as any
                }
                chk(self.matchMap).cases_value(key as any, projection)
                const result = pull(projection(element as any, key as never, index++))
                yield result
            }
        }) as any
    }

    first(): Doddle<T | undefined>
    first<const Alt>(alt: Alt): Doddle<T | Alt>
    first<const Alt = undefined>(alt?: Alt): Doddle<any> {
        return lazyFromOperator(this, function first(input) {
            for (const element of input) {
                return element
            }
            return alt
        })
    }

    flatMap = this.concatMap

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
                    yield [key, ___seq(() => getGroupIterable(key))]
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
    collect(outType: "array"): Seq<T[]>
    collect(outType: "item"): Seq<T>
    collect(outType: "seq"): Seq<Seq<T>>
    collect(): Seq<T>
    collect(outType?: string): any {
        chk(this.collect).outType(outType)
        outType ??= "item"
        return SeqOperator(this, function* collect(input) {
            const everything = []
            for (const element of input) {
                everything.push(element)
            }
            if (outType === "array") {
                yield everything
            } else if (outType === "item") {
                for (const item of everything) {
                    yield item
                }
            } else if (outType === "seq") {
                yield ___seq(everything)
            } else {
                throw new DoddleError(`Invalid outType ${outType}`)
            }
        })
    }

    includes<T extends S, S>(this: Seq<T>, value: S): Doddle<boolean>
    includes<S extends T>(value: S): Doddle<boolean>
    includes(value: any): Doddle<boolean> {
        // ! POLYMORPHIC !
        return lazyFromOperator(this, function includes(input) {
            return input.some(element => element === value).pull()
        })
    }
    last(): Doddle<T | undefined>
    last<const Alt>(alt: Alt): Doddle<T | Alt>
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
            yield* ___seq(input).concatMap((element, index) => [
                pull(projection(element, index)) as S
            ])
        })
    }
    maxBy<K>(projection: Seq.Iteratee<T, K>): Doddle<T | undefined>
    maxBy<K, const Alt>(projection: Seq.Iteratee<T, K>, alt: Alt): Doddle<T | Alt>
    maxBy<K, Alt>(projection: Seq.Iteratee<T, K>, alt?: Alt): Doddle<T | Alt> {
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
    minBy<K>(projection: Seq.Iteratee<T, K>): Doddle<T | undefined>
    minBy<K, const Alt>(projection: Seq.Iteratee<T, K>, alt: Alt): Doddle<T | Alt>
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
    orderBy<K extends [unknown, ...unknown[]]>(
        projection: Seq.NoIndexIteratee<T, K>,
        reverse?: boolean
    ): Seq<T>
    orderBy<K>(projection: Seq.NoIndexIteratee<T, K>, reverse?: boolean): Seq<T>
    orderBy<K>(projection: Seq.NoIndexIteratee<T, K>, reverse = false): Seq<T> {
        chk(this.orderBy).projection(projection)
        chk(this.orderBy).reverse(reverse)
        const compareKey = createCompareKey(reverse)
        return SeqOperator(this, function* orderBy(input) {
            yield* ___seq(input)
                .map(e => returnKvp(e, projection(e), e))
                .toArray()
                .map(xs => {
                    void xs.sort(compareKey)
                    return xs.map((x: any) => x.value)
                })
                .pull()
        })
    }
    reduce(reducer: Seq.Reducer<T, T>): Doddle<T>
    reduce<Acc>(reducer: Seq.Reducer<T, Acc>, initial: Acc): Doddle<Acc>
    reduce<Acc>(reducer: Seq.Reducer<T, Acc>, initial?: Acc): Doddle<any> {
        // ! POLYMORPHIC !
        const NO_INITIAL = Symbol("NO_INITIAL")
        chk(this.reduce).reducer(reducer)
        return lazyFromOperator(this, function reduce(input) {
            return input
                .scan(reducer, initial!)
                .last(NO_INITIAL)
                .map(x => {
                    if (x === NO_INITIAL) {
                        throw new DoddleError("Cannot reduce empty sequence with no initial value")
                    }
                    return x
                })
                .pull()
        }) as any
    }
    reverse() {
        return SeqOperator(this, function* reverse(input) {
            yield* ___seq(input)
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

    seqEqualsBy<K, S = T>(
        _other: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K>
    ): Doddle<boolean> {
        const other = ___seq(_other)
        return lazyFromOperator(this, function seqEqualsBy(input) {
            const otherIterator = _iter(other)
            try {
                for (const element of input) {
                    const otherElement = otherIterator.next()
                    const keyThis = pull(projection(element as any))
                    const keyOther = pull(projection(otherElement.value))
                    if (otherElement.done || keyThis !== keyOther) {
                        return false
                    }
                }
                return !!otherIterator.next().done
            } finally {
                otherIterator.return?.()
            }
        })
    }

    seqEquals<T extends S, S>(this: Seq<T>, _other: Seq.Input<S>): Doddle<boolean>
    seqEquals<S extends T>(_other: Seq.Input<S>): Doddle<boolean>
    seqEquals<S extends T>(_other: Seq.Input<S>) {
        return this.seqEqualsBy(_other, x => x)
    }

    setEqualsBy<K, S = T>(
        _other: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K>
    ): Doddle<boolean> {
        const other = ___seq(_other)
        return lazyFromOperator(this, function setEqualsBy(input) {
            const set = new Set()
            for (const element of other) {
                set.add(pull(projection(element)))
            }
            for (const element of input) {
                if (!set.delete(pull(projection(element)))) {
                    return false
                }
            }
            return set.size === 0
        })
    }

    setEquals<T extends S, S>(this: Seq<T>, _other: Seq.Input<S>): Doddle<boolean>
    setEquals<S extends T>(_other: Seq.Input<S>): Doddle<boolean>
    setEquals<S extends T>(_other: Seq.Input<S>) {
        return this.setEqualsBy(_other, x => x)
    }

    shuffle() {
        return SeqOperator(this, function* shuffle(input) {
            const array = ___seq(input).toArray().pull()
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
    findIndex(predicate: Seq.Predicate<T>): Doddle<number> {
        // ! POLYMORPHIC !
        predicate = chk(this.findIndex).predicate(predicate)
        return lazyFromOperator(this, function findIndex(input) {
            return input
                .map((x, i) => [x, i] as const)
                .find(([x, i]) => pull(predicate(x, i)))
                .map(x => x?.[1] ?? -1)
                .pull()
        })
    }
    findLastIndex(predicate: Seq.Predicate<T>): Doddle<number> {
        // ! POLYMORPHIC !
        predicate = chk(this.findLastIndex).predicate(predicate)
        return lazyFromOperator(this, function findLastIndex(input) {
            return input
                .map((x, i) => [x, i] as const)
                .findLast(([x, i]) => pull(predicate(x, i)))
                .map(x => x?.[1] ?? -1)
                .pull()
        })
    }
    skip(count: number): Seq<T> {
        const SKIP = Symbol("SKIP")
        chk(this.skip).count(count)
        return SeqOperator(this, function* skip(input) {
            let myCount = count
            if (myCount === 0) {
                yield* ___seq(input)
                return
            }
            if (myCount < 0) {
                myCount = -myCount
                yield* ___seq(input)
                    .window(myCount + 1, (...window) => {
                        if (window.length === myCount + 1) {
                            return window[0]
                        }
                        return SKIP
                    })
                    .filter(x => x !== SKIP)
            } else {
                yield* ___seq(input).skipWhile((_, index) => index < myCount, {})
            }
        }) as any
    }
    some(predicate: Seq.Predicate<T>): Doddle<boolean> {
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
                const results = ___seq(input)
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
                yield* ___seq(input).takeWhile((_, index) => index < myCount - 1, {
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

    toMapBy<K>(projection: Seq.Iteratee<T, K>) {
        // ! POLYMORPHIC !

        projection = chk(this.toMapBy).projection(projection)

        return lazyFromOperator(this, function toMapBy(input) {
            return input.toMap((x, i) => doddle(() => projection(x, i)).map(k => [k, x] as const))
        })
    }

    toRecord<Key extends PropertyKey, Value>(
        kvpProjection: Seq.Iteratee<T, readonly [Key, Value]>
    ): Doddle<Record<Key, Value>> {
        chk(this.toRecord).kvpProjection(kvpProjection)
        return lazyFromOperator(this, function toObject(input) {
            return input
                .map(kvpProjection)
                .toArray()
                .map(x => Object.fromEntries(x))
                .pull() as any
        })
    }

    as<S>() {
        return this as any as Seq<S>
    }

    splice<S>(start: number, skipCount?: number, insert?: Seq.Input<S>): Seq<S | T> {
        chk(this.splice).start(start)
        skipCount ??= 0
        const insertConverted = ___seq(insert ?? [])
        return SeqOperator(this, function* splice(input) {
            let i = 0
            for (const item of input) {
                if (i >= start && i < start + skipCount) {
                    i++

                    continue
                }
                if (i === start + skipCount && insert) {
                    for (const item of insertConverted) {
                        yield item
                    }
                }
                yield item
                i++
            }
        })
    }

    toRecordBy<K extends PropertyKey>(projection: Seq.Iteratee<T, K>): Doddle<Record<K, T>> {
        // ! POLYMORPHIC !
        projection = chk(this.toRecordBy).projection(projection)
        return lazyFromOperator(this, function toRecordBy(input) {
            return input
                .toRecord((x, i) => doddle(() => projection(x, i)).map(k => [k as K, x] as const))
                .pull()
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
            yield* ___seq(input).uniqBy(x => x)
        })
    }
    window<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S | Doddle<S>
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
        const others = _others.map(___seq)
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
    const myAbstractSeq = Object.assign(new (Seq as any)(), {
        _operator: impl.name,
        _operand: operand
    })
    Object.defineProperty(myAbstractSeq, Symbol.iterator, {
        get(this: typeof myAbstractSeq) {
            return impl.bind(this, this._operand)
        }
    })
    return myAbstractSeq
}

export namespace Seq {
    type MaybeDoddle<T> = T | Doddle<T>

    export type IndexIteratee<O> = (index: number) => MaybeDoddle<O>

    export type NoInputAction = () => unknown | Doddle<unknown>
    export type Iteratee<E, O> = (element: E, index: number) => MaybeDoddle<O>

    export type NoIndexIteratee<E, O> = (element: E) => MaybeDoddle<O>
    export type StageIteratee<E, O> = (element: E, index: number, stage: "before" | "after") => O
    export type Predicate<E> = Iteratee<E, boolean>
    export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

    export type Reducer<E, O> = (acc: O, element: E, index: number) => MaybeDoddle<O>
    export type FunctionInput<E> = () => MaybeDoddle<ObjectIterable<MaybeDoddle<E>>>

    export type ObjectIterable<E> = object & (Iterable<E> | Iterator<E> | ArrayLike<E>)
    export type Input<E> = MaybeDoddle<ObjectIterable<E>> | FunctionInput<E>
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never
    export type Group<K, V> = readonly [K, Seq<V>]

    export type PropKeyIteratee<E, K extends PropertyKey> = Iteratee<E, K>

    export type PropValueIteratee<MatchStruct, K extends keyof MatchStruct> = (
        element: MatchStruct[K],
        key: K,
        index: number
    ) => MaybeDoddle<unknown>

    export type DefaultCaseIteratee<MatchStruct> = (
        element: MatchStruct[keyof MatchStruct],
        key: keyof MatchStruct,
        index: number
    ) => MaybeDoddle<unknown>

    export type $_MatchKeyMapping<MatchStruct> = {
        [K in keyof MatchStruct]: PropValueIteratee<MatchStruct, K>
    } & {
        __default__?: DefaultCaseIteratee<MatchStruct>
    }
}
