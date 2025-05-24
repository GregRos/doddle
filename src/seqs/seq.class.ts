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
    type TakeWhileOptions
} from "./common-types.js"
import { ___seq } from "./seq.ctor.js"

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
    /**
     * Adds items to the end of `this` sequence.
     *
     * @param items The items to append.
     * @returns A new sequence with the items appended.
     */
    append<Ts extends any[]>(...items: Ts): Seq<T | Ts[number]> {
        return SeqOperator(this, function* append(input) {
            yield* ___seq(input).concat(items)
        })
    }

    /**
     * 🦥**Lazily** gets the element at the given index in `this` sequence.
     *
     * @param index The index of the item to retrieve.
     * @returns A 🦥{@link Doddle} that resolves to the item at the given index.
     */
    at(index: number): Doddle<T | undefined> {
        chk(this.at).index(index)
        return lazyFromOperator(this, function at(input) {
            if (index < 0) {
                return input.take(index).first().pull()
            }
            return input.skip(index).first().pull()
        })
    }

    /**
     * Caches the elements of `this` sequence as they're iterated over, so that it's evaluated only
     * once.
     *
     * @returns A new sequence with the same elements as the original sequence, but cached.
     */
    cache(): Seq<T> {
        const self = this
        const _cache: T[] = []
        let alreadyDone = false
        let iterator: Iterator<T>

        return SeqOperator(this, function* cache() {
            let i = 0
            for (;;) {
                if (i < _cache.length) {
                    const cur = _cache[i]
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
    /**
     * Handles errors thrown by `this` sequence.
     *
     * @param handler A handler that will be called with the error and the index of the element that
     *   caused it. Should return a new sequence or `undefined` to stop the iteration.
     * @returns A new sequence that handles errors.
     */
    catch<S = T>(handler: Seq.Iteratee<unknown, Seq.Input<S> | void>): Seq<T | S> {
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

    /**
     * Returns a cartesian product of `this` sequence with one or more other sequences, optionally
     * applying a projection to each combination of elements.
     *
     * The product of `N` sequences is the collection of all possible combinations of elements from
     * each sequence.
     *
     * For example, the product of `[1, 2]` and `[3, 4]` is:
     *
     * ```ts
     * ;[
     *     [1, 3],
     *     [1, 4],
     *     [2, 3],
     *     [2, 4]
     * ]
     * ```
     *
     * @example
     *     seq([1, 2]).product([3, 4])
     *     // => [[1, 3], [1, 4], [2, 3], [2, 4]]
     *     seq([]).product([3, 4])
     *     // => []
     *     seq([1, 2]).product([3, 4], (a, b) => a + b)
     *     // => [4, 5, 5, 6]
     *
     * @param others One or more sequence-like inputs for the product.
     * @param projection An N-ary projection to apply to each combination of elements.
     * @returns A new sequence representing the cartesian product of this and the other sequences.
     */
    product<Xs extends [any, ...any[]], R = getZipValuesType<[T, ...Xs]>>(
        _others: {
            [K in keyof Xs]: Seq.Input<Xs[K]>
        },
        projection?: (...args: getZipValuesType<[T, ...Xs]>) => R
    ): Seq<R> {
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
            yield* partialProducts.map(x => pull(projection.apply(null, x as any))) as any
        })
    }
    /**
     * Adds items to the beginning of `this` sequence.
     *
     * @param items The items to prepend.
     * @returns A new sequence with the items prepended.
     */
    prepend<Ts extends any[]>(...items: Ts): Seq<Ts[number] | T> {
        return SeqOperator(this, function* prepend(input) {
            yield* ___seq(items)
            yield* input
        })
    }

    /**
     * 🦥**Lazily** joins the elements of `this` sequence into a single string, separated by the
     * given separator.
     *
     * @param separator The string to use as a separator between elements.
     * @returns A 🦥{@link Doddle} that resolves to the joined string.
     */
    join(separator: string): Doddle<string> {
        chk(this.join).separator(separator)
        return lazyFromOperator(this, function join(input) {
            return input
                .toArray()
                .map(x => x.join(separator))
                .pull()
        })
    }
    /**
     * Splits `this` sequence into chunks of the given size, optionally applying a projection to
     * each chunk.
     *
     * @param size The size of each chunk. The last chunk may be smaller.
     * @param projection Optionally, an N-ary projection to apply to each chunk.
     * @returns A new sequence of chunks, each containing consecutive elements from the original.
     */
    chunk<L extends number, S = getWindowOutputType<T, L>>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => S | Doddle<S>
    ): Seq<S> {
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

    /**
     * Applies a sequence projection on each element of `this` sequence, flattening the results, so
     * that they appear in order.
     *
     * @param projection The sequence projection to apply to each element.
     * @returns A new sequence with the flattened results.
     */
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
    /**
     * Concatenates `this` sequence with one or more other sequences, so that they appear in order.
     *
     * @param _iterables The sequence-like inputs to concatenate to the end of `this` sequence.
     * @returns A new sequence with the concatenated elements.
     */
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

    /**
     * Invokes a function as each element in `this` is iterated over. You can specify whether to
     * invoke it before or after it's yielded, or both.
     *
     * @param action The function to invoke for each element.
     * @param stage The **stage** at which to invoke the function (`before`, `after`, or `both`).
     * @returns A new sequence that invokes the handler as each element is iterated over.
     */
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
    /**
     * 🦥**Lazily** checks if all elements in `this` sequence match the given predicate, by
     * iterating over it.
     *
     * @param predicate The predicate.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements match, or `false`
     *   otherwise.
     */
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
    /**
     * Filters the elements of `this` sequence based on the given predicate, narrowing the type of
     * the elements in the resulting sequence.
     *
     * @param predicate The predicate to filter elements.
     * @returns A new sequence with the filtered elements, its type narrowed based on the predicate.
     */
    filter<S extends T>(predicate: Seq.TypePredicate<T, S>): Seq<S>
    /**
     * Filters the elements of `this` sequence based on the given predicate.
     *
     * @param predicate The predicate to filter elements.
     * @returns A new sequence with the filtered elements.
     */
    filter(predicate: Seq.Predicate<T>): Seq<T>
    filter(predicate: Seq.Predicate<T>) {
        predicate = chk(this.filter).predicate(predicate)
        return SeqOperator(this, function* filter(input) {
            yield* ___seq(input).concatMap((element, index) =>
                pull(predicate(element, index)) ? [element] : []
            )
        })
    }

    /**
     * Returns a new sequence that can be iterated exactly once, using the same shared iterator for
     * all `for .. of` loops.
     *
     * This lets one `for .. of` loop share progress in the sequence with others.
     *
     * @returns A new, shared iterable sequence that can be iterated over exactly once.
     */
    share(): Seq<T> {
        const iter = doddle(() => _iter(this))
        return SeqOperator(this, function* share() {
            while (true) {
                const { done, value } = iter.pull().next()
                if (done) {
                    return
                }
                yield value
            }
        })
    }

    /**
     * 🦥**Lazily** finds the first element in `this` sequence that matches the given predicate, by
     * iterating over it.
     *
     * @param predicate The predicate used to find the element.
     * @param alt Optionally, the value to return if no element matches the predicate. Defaults to
     *   `undefined`.
     */
    first<const Alt = undefined>(predicate: Seq.Predicate<T>, alt?: Alt): Doddle<T | Alt>
    /**
     * 🦥**Lazily** gets the first element in `this` sequence, or the given alternative value if the
     * sequence is empty.
     *
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     * @returns A 🦥{@link Doddle} that resolves to the first element or the alternative value.
     */
    first(): Doddle<T | undefined>
    first<Alt = undefined>(predicate?: Seq.Predicate<T>, alt?: Alt): Doddle<T | Alt> {
        return lazyFromOperator(this, function first(input) {
            let index = 0
            for (const element of input) {
                if (!predicate || predicate(element, index++)) {
                    return element
                }
            }
            return alt as Alt
        })
    }

    flatMap = this.concatMap

    /**
     * Groups the elements of `this` sequence by key using a projection, resulting in a sequence of
     * key-multi value pairs.
     *
     * @param keyProjection The projection used to determine the key for each element.
     * @returns A new sequence of key-multi value pairs, where each key is associated with an
     *   iterable of values.
     */
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
    /**
     * Collects the elements of `this` into an array, yielding them all as a single element.
     *
     * @param array The string `"array"`.
     * @returns A new sequence with a single array element.
     */
    collect(array: "array"): Seq<T[]>
    collect(outType: "item"): Seq<T>

    /**
     * Collects the elements of `this` into a sequence, yielding them all as a single element.
     *
     * @param seq The string `"seq"`.
     * @returns A new sequence with a single sequence element.
     */
    collect(seq: "seq"): Seq<Seq<T>>
    /**
     * Collects the elements of `this`, caching them before yielding the first element, and then
     * yields them one by one.
     *
     * @returns A new sequence with the same elements as this one, but where iteration has already
     *   completed.
     */
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

    /**
     * 🦥**Lazily** checks if `this` sequence includes one or more values by iterating over it.
     *
     * @param values The values to check for inclusion.
     */
    includes<T extends S, S>(this: Seq<T>, ...values: S[]): Doddle<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence includes one or more values by iterating over it.
     *
     * @param values The values to check for inclusion.
     */
    includes<S extends T>(...value: S[]): Doddle<boolean>
    includes(..._values: any[]): Doddle<boolean> {
        // ! POLYMORPHIC !
        const values = new Set(_values)
        return lazyFromOperator(this, function includes(input) {
            return input.some(element => values.has(element)).pull()
        })
    } /**
     * Invokes a handler **before** the first element of `this` sequence is yielded, but after
     * iteration has started.
     *
     * @param action The handler to invoke before the first element.
     * @returns A new sequence that invokes the handler before the first element.
     */
    before(action: Seq.NoInputAction): Seq<T> {
        return this.each(action, "start")
    }

    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence, usually by **iterating over
     * it**.
     *
     * @returns A 🦥{@link Doddle} that resolves to the count of elements.
     */
    count(): Doddle<number>
    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence that match the given predicate,
     * usually by **iterating over it**.
     *
     * @param predicate The predicate that determines whether to include an element in the count.
     * @returns A 🦥{@link Doddle} that resolves to the count of matching elements.
     */
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
    /**
     * 🦥**Lazily** gets the last element in `this` sequence, or the given alternative value if the
     * sequence is empty.
     *
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     */
    last(): Doddle<T | undefined>
    /**
     * 🦥**Lazily** finds the last element in `this` sequence that matches the given predicate, by
     * iterating over it.
     *
     * @param predicate The predicate to match the element.
     * @param alt Optionally, the value to return if no element matches the predicate. Defaults to
     *   `undefined`.
     */
    last<const Alt = undefined>(predicate: Seq.Predicate<T>, alt?: Alt): Doddle<T | Alt>
    last<Alt>(predicate?: Seq.Predicate<T>, alt?: Alt): Doddle<T | Alt> {
        predicate ??= () => true
        chk(this.last).predicate(predicate)
        return lazyFromOperator(this, function last(input) {
            let lastOrAlt: Alt | T = alt as Alt
            let index = 0
            for (const element of input) {
                if (!predicate(element, index++)) {
                    continue
                }
                lastOrAlt = element
            }
            return lastOrAlt
        })
    }

    /**
     * Applies a projection to each element of `this` sequence.
     *
     * @param projection The projection function to apply to each element.
     * @returns A new sequence with the projected elements.
     */
    map<S>(projection: Seq.Iteratee<T, S>): Seq<S> {
        chk(this.map).projection(projection)
        return SeqOperator(this, function* map(input) {
            yield* ___seq(input).concatMap((element, index) => [
                pull(projection(element, index)) as S
            ])
        })
    }
    /**
     * 🦥**Lazily** gets the maximum element in `this` sequence, or the given alternative value if
     * the sequence is empty.
     *
     * @param projection The projection function to apply to each element.
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     */
    maxBy<K, const Alt = undefined>(projection: Seq.Iteratee<T, K>, alt?: Alt): Doddle<T | Alt> {
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
    /**
     * 🦥**Lazily** gets the minimum element in `this` sequence, or the given alternative value if
     * the sequence is empty.
     *
     * @param projection The projection function to apply to each element.
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     */
    minBy<K, const Alt = undefined>(projection: Seq.Iteratee<T, K>, alt?: Alt): Doddle<T | Alt> {
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
    /**
     * Orders the elements of `this` sequence using by several keys, using the given multi-key
     * projection.
     *
     * @param projection A projection function that returns a tuple of keys to order by.
     * @param reverse Whether to order in descending order.
     */
    orderBy<K extends [unknown, ...unknown[]]>(
        projection: Seq.NoIndexIteratee<T, K>,
        reverse?: boolean
    ): Seq<T>
    /**
     * Orders the elements of `this` sequence by key, using the given key projection.
     *
     * @param projection A projection function that returns a key to order by.
     * @param reverse Whether to order in descending order.
     */
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
    /**
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction. The
     * first call receives the first and second elements.
     *
     * @param reduction The reduction function to apply to each element.
     * @returns A 🦥{@link Doddle} that resolves to the reduced value.
     */
    reduce(reduction: Seq.Reduction<T, T>): Doddle<T>
    /**
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction, using
     * the given initial value.
     *
     * @param reducer The reduction function to apply to each element.
     * @param initial The initial value to start the reduction with.
     */
    reduce<Acc>(reducer: Seq.Reduction<T, Acc>, initial: Acc): Doddle<Acc>
    reduce<Acc>(reducer: Seq.Reduction<T, Acc>, initial?: Acc): Doddle<any> {
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
    /**
     * Reverses `this` sequence.
     *
     * @returns A new sequence with the elements in reverse order.
     */
    reverse() {
        return SeqOperator(this, function* reverse(input) {
            yield* ___seq(input)
                .toArray()
                .map(x => x.reverse())
                .pull()
        })
    }
    /**
     * Applies a reduction to each element of `this` sequence, yielding the accumulated value at
     * each step.
     *
     * The reduction is first called with the first two elements.
     *
     * @param reduction The reduction function to apply.
     * @returns A new sequence with the accumulated values.
     */
    scan(reduction: Seq.Reduction<T, T>): Seq<T>
    /**
     * Applies a reduction to each element of `this` sequence, yielding the accumulated value at
     * each step.
     *
     * @param reduction The reduction function to apply.
     * @param initial The initial value to start the reduction with.
     */
    scan<Acc>(reduction: Seq.Reduction<T, Acc>, initial: Acc): Seq<Acc>
    scan<Acc>(reduction: Seq.Reduction<T, Acc>, initial?: Acc) {
        chk(this.scan).reducer(reduction)
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
                    acc = pull(reduction(acc, element, index++)) as any
                }

                yield acc
            }
        })
    }

    /**
     * 🦥**Lazily** checks if the elements of `this` sequence are all equal to the elements in a
     * sequential input, by iterating over both.
     *
     * The elements are compared by key, using the given key projection.
     *
     * @param _input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
     *   otherwise.
     */
    seqEqualsBy<K, S = T>(
        _input: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K> = x => x as any
    ): Doddle<boolean> {
        const other = ___seq(_input)
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

    /**
     * 🦥**Lazily** checks if `this` sequence contains the same elements as the input sequence,
     * without regard to order.
     *
     * The elements are compared by key, using the given key projection.
     *
     * @param _input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if `this` is set-equal to the input, or
     *   `false` otherwise.
     */
    setEqualsBy<K, S = T>(
        _other: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K> = x => x as any
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

    /**
     * Shuffles the elements of `this` sequence randomly. This requires iterating over it.
     *
     * @returns A new sequence with the shuffled elements.
     */
    shuffle() {
        return SeqOperator(this, function* shuffle(input) {
            const array = ___seq(input).toArray().pull()
            shuffleArray(array)
            yield* array
        })
    }
    /**
     * Skips elements from `this` sequence while the given predicate is true, and yields the rest.
     *
     * @param predicate The predicate to determine whether to continue skipping.
     * @param options Optional options for skipping behavior.
     * @returns
     */
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

    /**
     * Skips the first `count` elements of `this` sequence, yielding the rest.
     *
     * @param count The number of elements to skip.
     * @returns A new sequence with the skipped elements.
     */
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
    /**
     * 🦥**Lazily** checks if any element in `this` sequence matches the given predicate, by
     * iterating over it until a match is found.
     *
     * @param predicate The predicate to match the element.
     * @returns A 🦥{@link Doddle} that resolves to `true` if any element matches, or `false`
     *   otherwise.
     */
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
    /**
     * 🦥**Lazily** sums the elements of `this` sequence by iterating over it, applying the given
     * projection to each element.
     *
     * @param projection The projection function to apply to each element.
     * @returns A 🦥{@link Doddle} that resolves to the sum of the projected elements.
     */
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
    /**
     * Yields the first elements of `this` sequence while the given predicate is true, skipping the
     * rest.
     *
     * @param predicate The predicate to determine whether to continue yielding.
     * @param options Extra options.
     * @returns A new sequence with the yielded elements.
     */
    takeWhile(predicate: Seq.Predicate<T>, options?: TakeWhileOptions): Seq<T> {
        chk(this.takeWhile).predicate(predicate)
        return SeqOperator(this, function* takeWhile(input) {
            let index = 0
            for (const element of input) {
                if (pull(predicate(element, index++))) {
                    yield element
                } else {
                    if (options?.takeFinal) {
                        yield element
                    }
                    return
                }
            }
        }) as any
    }
    /**
     * Yields the first `count` elements of `this` sequence, or `-count` elements from the end if
     * `count` is negative.
     *
     * @param count The number of elements to yield.
     * @returns A new sequence with the yielded elements.
     */
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
    /**
     * 🦥**Lazily** converts `this` sequence into an array, iterating over it to collect all the
     * elements.
     *
     * @returns A 🦥{@link Doddle} that resolves to an array of the elements in the sequence.
     */
    toArray() {
        return lazyFromOperator(this, function toArray(input) {
            return [...input]
        })
    }

    /**
     * 🦥**Lazily** converts `this` sequence into a {@link Map}, iterating over it and applying the
     * given key projection to each element to determine its key.
     *
     * @param projection The projection function to apply to each element to determine its key.
     * @returns A 🦥{@link Doddle} that resolves to a {@link Map} of the elements in the sequence.
     */
    toMapBy<K>(projection: Seq.Iteratee<T, K>) {
        // ! POLYMORPHIC !

        projection = chk(this.toMapBy).projection(projection)

        return lazyFromOperator(this, function toMapBy(input) {
            return input
                .toMap((x, i) => doddle(() => projection(x, i)).map(k => [k, x] as const))
                .pull()
        })
    }

    /**
     * 🦥**Lazily** converts `this` sequence into a {@link Record}, iterating over it and applying
     * the given key projection to each element to determine its key.
     *
     * @param kvpProjection
     * @returns
     */
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
    uniqBy(projection: Seq.NoIndexIteratee<T, any> = x => x): Seq<T> {
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

    export type Reduction<E, O> = (acc: O, element: E, index: number) => MaybeDoddle<O>
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
