import type { Doddle } from "../doddle/index.js"
import { doddle, lazyOperator, pull } from "../doddle/index.js"
import { chk, DoddleError, invalidRecursionError, loadCheckers } from "../errors/error.js"
import { _iter, createCompareKey, orderedStages, returnKvp, shuffleArray, Stage } from "../utils.js"
import {
    SkippingMode,
    type EachCallStage,
    type Get_Concat_Element_Type,
    type getWindowArgsType,
    type getWindowOutputType,
    type getZipValuesType,
    type SkipWhileOptions,
    type TakeWhileOptions
} from "./common-types.js"

import { seq } from "./seq.ctor.js"
const SPECIAL = Symbol("S")
const SPECIAL2 = Symbol("S2")
export abstract class Seq<T> implements Iterable<T> {
    abstract [Symbol.iterator](): Iterator<T>

    constructor() {
        // Class name is used for various checks
        // Need to make sure it's accessible even while minified
        loadCheckers(Seq.prototype)
        Object.defineProperty(this, "name", {
            value: "ASeq"
        })
    }

    get _qr() {
        return this.toArray().pull()
    }

    /**
     * 🦥**Lazily** gets the element at the given index in `this` sequence.
     *
     * @param index The index of the item to retrieve.
     * @returns A 🦥{@link Doddle} that resolves to the item at the given index.
     */
    at(index: number): Doddle<T | undefined> {
        chk(this.at).index(index)
        return lazyOperator(this, function at(input) {
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
        let isCallingNext = false
        return SeqOperator(this, function* cache() {
            let i = 0
            if (isCallingNext) {
                throw new DoddleError(invalidRecursionError("cache"))
            }
            for (;;) {
                if (i < _cache.length) {
                    const cur = _cache[i]
                    yield cur
                    i++
                } else if (!alreadyDone) {
                    iterator ??= _iter(self)
                    try {
                        isCallingNext = true
                        var { done, value } = iterator.next()
                    } finally {
                        isCallingNext = false
                    }
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
                    yield* seq(result)
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
    product<Xs extends any[], R = [T, ...Xs]>(
        _others: {
            [K in keyof Xs]: Seq.Input<Xs[K]>
        },
        projection?: (...args: [T, ...Xs]) => R
    ): Seq<R> {
        const others = _others.map(seq).map(x => x.cache())
        projection ??= (...args: any[]) => args as any
        chk(this.product).projection(projection)
        return SeqOperator(this, function* product(input) {
            let partialProducts = [[]] as any[][]
            for (const iterable of [input, ...others].reverse()) {
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
     * 🦥**Lazily** joins the elements of `this` sequence into a single string, separated by the
     * given separator.
     *
     * @param separator The string to use as a separator between elements.
     * @returns A 🦥{@link Doddle} that resolves to the joined string.
     */
    join(separator: string): Doddle<string> {
        chk(this.join).separator(separator)
        return lazyOperator(this, function join(input) {
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
        const c = chk(this.chunk)
        c.size(size)
        projection ??= (...chunk: any) => chunk as any
        c.projection(projection)

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
    concatMap<S>(projection: Seq.Iteratee<T, Seq.Input<S>>): Seq<Get_Concat_Element_Type<T, S>> {
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
    /**
     * Concatenates `this` sequence with one or more other sequences, so that they appear in order.
     *
     * @param _iterables The sequence-like inputs to concatenate to the end of `this` sequence.
     * @returns A new sequence with the concatenated elements.
     */
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

    concatFirst<Seqs extends Seq.Input<any>[]>(
        ..._iterables: Seqs
    ): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
        if (_iterables.length === 0) {
            return this
        }
        const [base, ...rest] = [..._iterables, this].map(seq) as any[]
        return base.concat(rest)
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
        const c = chk(this.each)
        c.action(action)
        c.stage(stage)
        const myStage = orderedStages.indexOf(stage)
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
        return lazyOperator(this, function every(input) {
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
            yield* seq(input).concatMap((element, index) =>
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
        let isCallingNext = false

        return SeqOperator(this, function* share() {
            if (isCallingNext) {
                throw new DoddleError(invalidRecursionError("share"))
            }
            while (true) {
                try {
                    isCallingNext = true
                    var { done, value } = iter.pull().next()
                } finally {
                    isCallingNext = false
                }
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
        predicate ??= () => true
        return lazyOperator(this, function first(input) {
            let index = 0
            for (const element of input) {
                if (pull(predicate(element, index++))) {
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
        return lazyOperator(this, function includes(input) {
            return input.some(element => values.has(element)).pull()
        })
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
        return lazyOperator(this, function count(input) {
            return input
                .filter(predicate as any)
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
        return lazyOperator(this, function last(input) {
            let lastOrAlt: Alt | T = alt as Alt
            let index = 0
            for (const element of input) {
                if (!pull(predicate(element, index++))) {
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
            yield* seq(input).concatMap((element, index) => [pull(projection(element, index)) as S])
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
        // ! POLYMORPHIC !
        chk(this.maxBy).projection(projection)
        return lazyOperator(this, function maxBy(input) {
            return input
                .map((element, index) => {
                    return returnKvp(input, projection(element, index), element)
                })
                .reduce((max: any, value: any) => {
                    return max?.[0] >= value[0] ? max : value
                }, null)
                .map(x => (x === null ? alt : x[1]))
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
        // ! POLYMORPHIC !
        chk(this.minBy).projection(projection)
        return lazyOperator(this, function minBy(input) {
            return input
                .map((element, index) => {
                    return returnKvp(input, projection(element, index), element)
                })
                .reduce((acc: any, cur: any) => {
                    return acc?.[0] <= cur[0] ? acc : cur
                }, null)
                .map(x => (x === null ? alt : x[1]))
                .pull()
        })
    }

    /**
     * Collects the elements of `this`, caching them before yielding the first element, and then
     * yields them one by one.
     *
     * @returns A new sequence with the same elements as this one, but where iteration has already
     *   completed.
     */
    collect(): Seq<T> {
        return SeqOperator(this, function* collect(input) {
            yield* [...input]
        })
    }

    /**
     * Invokes a handler **before** the first element of `this` sequence is yielded, but after
     * iteration has started.
     *
     * @param action The handler to invoke before the first element.
     * @returns A new sequence that invokes the handler before the first element.
     */
    before(action: Seq.NoInputAction): Seq<T> {
        chk(this.before).action(action)
        return SeqOperator(this, function* before(input) {
            pull(action())
            yield* input
        })
    }
    /**
     * Performs an action **after** the final element of `this` sequence has been yielded, but
     * before iteration completes.
     *
     * @param action The action to perform after the final element.
     * @returns A new sequence that performs the action after the final element.
     */
    after(action: Seq.NoInputAction): Seq<T> {
        chk(this.after).action(action)
        return SeqOperator(this, function* after(input) {
            yield* input
            pull(action())
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
            yield* seq(input)
                .map(e => returnKvp(e, projection(e), e))
                .toArray()
                .map(xs => {
                    void xs.sort(compareKey)
                    return xs.map((x: any) => x[1])
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
        chk(this.reduce).reducer(reducer)
        return lazyOperator(this, function reduce(input) {
            return input
                .scan(reducer, initial!)
                .last(() => true, SPECIAL)
                .map(x => {
                    if (x === SPECIAL) {
                        throw new DoddleError("Cannot reduce empty sequence with no initial value")
                    }
                    return x as any
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
            yield* seq(input)
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
     * @param _input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
     */
    seqEquals<T extends S, S>(this: Seq<T>, _other: Seq.Input<S>): Doddle<boolean>
    /**
     * 🦥**Lazily** checks if the elements of `this` sequence are all equal to the elements in a
     * sequential input, by iterating over both.
     *
     * @param _input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
     *   otherwise.
     */
    seqEquals<S extends T>(_other: Seq.Input<S>): Doddle<boolean>
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
    seqEquals<K, S = T>(
        _input: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K>
    ): Doddle<boolean>
    seqEquals<K, S = T>(
        _input: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K> = x => x as any
    ): Doddle<boolean> {
        const other = seq(_input)
        return lazyOperator(this, function seqEqualsBy(input) {
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
    setEquals<T extends S, S>(this: Seq<T>, _other: Seq.Input<S>): Doddle<boolean>
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
    setEquals<S extends T>(_other: Seq.Input<S>): Doddle<boolean>

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
    setEquals<K, S = T>(
        _other: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K>
    ): Doddle<boolean>
    setEquals<K, S = T>(
        _other: Seq.Input<S>,
        projection: Seq.NoIndexIteratee<S | T, K> = x => x as any
    ): Doddle<boolean> {
        const other = seq(_other)
        return lazyOperator(this, function setEqualsBy(input) {
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
            const array = seq(input).toArray().pull()
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
                        return SPECIAL2
                    })
                    .filter(x => x !== SPECIAL2)
            } else {
                yield* seq(input).skipWhile((_, index) => index < myCount, {})
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

        predicate = chk(this.some).predicate(predicate)
        return lazyOperator(this, function some(input) {
            return input
                .first(predicate, SPECIAL2)
                .map(x => x !== SPECIAL2)
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
        return lazyOperator(this, function sumBy(input) {
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
                    .concat([SPECIAL2])
                    .window(myCount + 1, (...window) => {
                        if (window[window.length - 1] === SPECIAL2) {
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

    /**
     * 🦥**Lazily** converts `this` sequence into an array, iterating over it to collect all the
     * elements.
     *
     * @returns A 🦥{@link Doddle} that resolves to an array of the elements in the sequence.
     */
    toArray() {
        return lazyOperator(this, function toArray(input) {
            return [...input]
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
        return lazyOperator(this, function toObject(input) {
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

    toMap<K, V>(kvpProjection: Seq.Iteratee<T, readonly [K, V]>) {
        // ! POLYMORPHIC !
        kvpProjection = chk(this.toMap).kvpProjection(kvpProjection)
        return lazyOperator(this, function toMap(input) {
            return input
                .map(kvpProjection)
                .toArray()
                .map(x => new Map(x))
                .pull()
        })
    }
    toSet() {
        return lazyOperator(this, function toSet(input) {
            return new Set(input)
        })
    }
    uniq(projection: Seq.NoIndexIteratee<T, any> = x => x): Seq<T> {
        chk(this.uniq).projection(projection)
        return SeqOperator(this, function* uniq(input) {
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
        const c = chk(this.window)
        c.size(size)
        projection ??= (...window: any) => window as any
        c.projection(projection)
        return SeqOperator(this, function* window(input) {
            const buffer = Array<T>(size)
            let i = 0
            for (const item of input) {
                buffer[i++ % size] = item
                if (i >= size) {
                    yield pull(
                        (projection as any)(...buffer.slice(i % size), ...buffer.slice(0, i % size))
                    )
                }
            }
            if (i > 0 && i < size) {
                yield pull((projection as any)(...buffer.slice(0, i)))
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
    const myAbstractSeq = Object.assign(new (Seq as any)(), [impl.name, operand])
    Object.defineProperty(myAbstractSeq, Symbol.iterator, {
        get(this: typeof myAbstractSeq) {
            return impl.bind(this, this[1])
        }
    })
    return myAbstractSeq
}

/** Types associated with the {@link Seq} class. */
export namespace Seq {
    /** A type that can be either a value or a {@link Doddle} of that value. */
    type MaybeDoddle<Value> = Value | Doddle<Value>

    /**
     * An iteratee that receives consecutive indexes, not elements. Used for generating sequences.
     *
     * @template Out The element type of the sequence.
     */
    export type IndexIteratee<Out> = (index: number) => MaybeDoddle<Out>

    /**
     * An iteratee that projects sequence elements individually.
     *
     * @template In The input element type.
     * @template Out The output element type.
     */
    export type Iteratee<In, Out> = (element: In, index: number) => MaybeDoddle<Out>

    /**
     * An {@link Iteratee} that doesn't receive element indices. Used when operators should only use
     * values, such as in key projections.
     *
     * @template In The input element type.
     * @template Out The output element type.
     */
    export type NoIndexIteratee<In, Out> = (element: In) => MaybeDoddle<Out>

    /**
     * An {@link Iteratee} that receives a stage indicator, which can be `"before"` or `"after"`.
     *
     * @template In The input element type.
     * @template Out The output element type.
     */
    export type StageIteratee<In, Out> = (
        element: In,
        index: number,
        stage: "before" | "after"
    ) => Out

    /**
     * A predicate {@link Iteratee} that always returns a boolean value, used for filtering.
     *
     * @template In The input element type.
     */
    export type Predicate<In> = Iteratee<In, boolean>
    /**
     * A type predicate {@link Iteratee}. When filtering, narrows the element type.
     *
     * @template In The input element type.
     * @template Narrowed The narrowed element type.
     */
    export type TypePredicate<In, Narrowed extends In> = (
        element: In,
        index: number
    ) => element is Narrowed

    /**
     * A reduction. Takes an accumulator, element, and index. Returns the accumulator value for the
     * next iteration.
     *
     * @template In The element type of the sequence.
     * @template Result The result of the reduction.
     */
    export type Reduction<In, Result> = (
        acc: Result,
        element: In,
        index: number
    ) => MaybeDoddle<Result>

    /**
     * A function that takes no arguments and returns an Iterable, Iterator, or ArrayLike.
     *
     * Converted into a {@link Seq}.
     *
     * @template Item The element type of the resulting iterable.
     */
    export type FunctionInput<Item> = () => MaybeDoddle<ObjectIterable<MaybeDoddle<Item>>>

    /**
     * An Iterable, Iterator, or ArrayLike but **not** a `string`.
     *
     * Converted into a {@link Seq}.
     *
     * @template Item The element type of the iterable.
     */
    export type ObjectIterable<Item> = object & (Iterable<Item> | Iterator<Item> | ArrayLike<Item>)

    /**
     * The type of a sequence-like input, with elements of type `Out`.
     *
     * Converted into a {@link Seq}.
     *
     * @template Item The element type of the input.
     */
    export type Input<Item> = MaybeDoddle<ObjectIterable<Item>> | FunctionInput<Item>

    /**
     * Infers the element type of a sequence-like input.
     *
     * @template SeqLike The sequence-like input type.
     */
    export type ElementOfInput<SeqLike> = SeqLike extends Input<infer Element> ? Element : never
    /**
     * A grouping of elements by a key, where `K` is the key type and `V` is the value type.
     *
     * @template Key The key type.
     * @template Val The value type.
     */
    export type Group<Key, Val> = readonly [Key, Seq<Val>]

    /**
     * A function that takes no arguments but may return a Doddle, which will be pulled before
     * executing continues.
     */
    export type NoInputAction = () => unknown | Doddle<unknown>
}
