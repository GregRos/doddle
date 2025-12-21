import type { Doddle } from "../doddle/index.js"
import { doddle, lazyOperator, pull } from "../doddle/index.js"
import {
    chk,
    DoddleError,
    invalidRecursionError,
    loadCheckers,
    reduceOnEmptyError
} from "../errors/error.js"
import { _iter, createCompareKey, orderedStages, shuffleArray, Stage } from "../utils.js"
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
/**
 * The Seq class, which wraps a synchronous iterable.
 *
 * @category Use
 */
export abstract class Seq<T> implements Iterable<T> {
    flatMap = this.concatMap

    /** @internal */

    constructor() {
        // Class name is used for various checks
        // Need to make sure it's accessible even while minified
        loadCheckers(Seq.prototype)
    }
    /** @internal */

    get _qr() {
        return this.toArray().pull()
    }

    /**
     * Calls a side-effect function after all elements have been yielded, but before iteration
     * finishes.
     *
     * ⚠️ If the client stops iterating early, the action won't be executed.
     *
     * @param action A function to invoke after iteration completes.
     * @returns A new sequence that acts like `this` but invokes `action` before it's finished.
     */
    after(action: Seq.NoInputAction): Seq<T> {
        chk(this.after).action(action)
        return SeqOperator(this, function* after(input) {
            yield* input
            pull(action())
        })
    }
    /**
     * Reinterprets the declared element type of `this` as another, arbitrary type.
     *
     * ℹ️ This is only useful in TypeScript and has no runtime effects.
     *
     * @template S The new element type.
     * @returns The same sequence, but with a different declared type.
     */
    as<S>() {
        return this as any as Seq<S>
    }

    /**
     * 🦥**Lazily** gets the element at the given index in `this` sequence, or undefined if the
     * index is out of bounds.
     *
     * ℹ️ Negative indexes count from the end of the sequence.\
     * ⚠️ Requires iterating over the sequence up to the given index.
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
     * Executes a side effect action once before any elements are yielded, but after iteration has
     * begun.
     *
     * @param action Invokes before any elements are yielded.
     * @returns A new async sequence that performs `action` before yielding elements.
     */
    before(action: Seq.NoInputAction): Seq<T> {
        chk(this.before).action(action)
        return SeqOperator(this, function* before(input) {
            pull(action())
            yield* input
        })
    }
    /**
     * Caches the elements of `this` sequence as they're iterated over, so that it's evaluated only
     * once.
     *
     * @returns A new sequence with the same elements as the original sequence.
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
     * Handles errors thrown while iterating over `this` sequence.
     *
     * @param handler A handler that will be called with the error and the index of the element that
     *   caused it. Should return a new sequence or `undefined`, which stops iteration.
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
     * Splits `this` sequence into chunks of the given size, optionally applying a projection to
     * each chunk.
     *
     * ℹ️ The last chunk may be smaller than the given size.
     *
     * @param size The size of each chunk.
     * @param projection Optionally, an N-ary projection to apply to each chunk. Defaults to
     *   collecting the elements into an array.
     * @returns A new sequence.
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
     * Returns a new sequence. When iterated, before yielding its first element, it will iterate
     * over all the elements of `this` and store them in memory. Then it will yield all of them one
     * by one.
     *
     * ℹ️ Used to control side-effects. Makes sure all side-effects execute before continuing to
     * apply other operators.
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
     * Concatenates one or more sequences to the end of `this`, so that their elements appear in
     * order.
     *
     * @param inputs The sequential inputs to concatenate to the end of `this`.
     * @returns A new sequence with the concatenated elements.
     */
    concat<Seqs extends Seq.Input<any>[]>(
        ...inputs: Seqs
    ): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
        const iterables = inputs.map(seq)
        return SeqOperator(this, function* concat(input) {
            yield* input
            for (const iterable of iterables) {
                yield* iterable
            }
        }) as any
    }

    /**
     * Applies a sequence projection on each element of `this` sequence and concatenates the
     * resulting sequences.
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
     * Concatenates `this` sequence to the end of one or more other sequences.
     *
     * ℹ️ Input sequences are concatenated in the order that they appear.
     *
     * @param inputs One or more other sequences.
     * @returns A new sequence with the concatenated elements.
     * @see {@link Seq.concat}
     */
    concatTo<Seqs extends Seq.Input<any>[]>(
        ...inputs: Seqs
    ): Seq<T | Seq.ElementOfInput<Seqs[number]>> {
        return seq([]).concat(...inputs, this) as any
    }

    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @returns A 🦥{@link Doddle} that resolves to the number of elements in `this`.
     */
    count(): Doddle<number>
    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence that match the given predicate.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param predicate The predicate used to test each element.
     * @returns A 🦥{@link Doddle} that resolves to the number of matching elements.
     */
    count(predicate: Seq.Predicate<T>): Doddle<number>
    count(predicate?: Seq.Predicate<T>): Doddle<number> {
        predicate ??= () => true
        predicate = chk(this.count).predicate(predicate)
        return lazyOperator(this, function count(input) {
            let index = 0
            let count = 0
            for (const element of input) {
                if (pull(predicate(element, index++))) {
                    count++
                }
            }
            return count
        })
    }
    /**
     * Calls an action function as each element in `this` is iterated over. Calls the function
     * before or after yielding the element, or both.
     *
     * @param action The action function to invoke for each element.
     * @param stage The **stage** at which to invoke the function. Can be `"before"`, `"after"`, or
     *   `"both"`.
     * @returns A new sequence that invokes the action function while being iterated.
     */
    each(
        action: Seq.StageIteratee<T, void>,
        stage: EachCallStage | undefined = orderedStages[Stage.Before]
    ) {
        const c = chk(this.each)
        c.action(action)
        c.stage(stage)
        const myStage = orderedStages.indexOf(stage)
        return SeqOperator(this, function* each(input) {
            let index = 0
            for (const element of input) {
                if (myStage & Stage.Before) {
                    pull(action(element, index, orderedStages[Stage.Before]))
                }
                yield element
                if (myStage & Stage.After) {
                    pull(action(element, index, orderedStages[Stage.After]))
                }
                index++
            }
        })
    }
    /**
     * 🦥**Lazily** checks if all elements in `this` sequence match the given predicate.
     *
     * ⚠️ May iterate over the entire sequence.
     *
     * @param predicate The predicate.
     * @returns A 🦥{@link Doddle} that yields `true` if all elements match, or `false` otherwise.
     */
    every(predicate: Seq.Predicate<T>): Doddle<boolean> {
        predicate = chk(this.every).predicate(predicate)
        return lazyOperator(this, function every(input) {
            let index = 0
            for (const element of input) {
                if (!pull(predicate(element, index++))) {
                    return false
                }
            }
            return true
        })
    }
    /**
     * Filters the elements of `this` sequence based on the given type predicate, narrowing the type
     * of the elements in the resulting sequence.
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
            let index = 0
            for (const x of input) {
                if (pull(predicate(x, index++))) {
                    yield x
                }
            }
        })
    }

    /**
     * 🦥**Lazily** finds the first element in `this` sequence, or `undefined` if it's empty.
     *
     * @returns A 🦥{@link Doddle} that resolves to the first element or the alternative value.
     */
    first(): Doddle<T | undefined>
    /**
     * 🦥**Lazily** finds the first element in `this` sequence that matches the given predicate.
     *
     * ⚠️ May iterate over the entire sequence.
     *
     * @param predicate The predicate used to find the element.
     * @param alt The value to return if no element matches the predicate. Defaults to `undefined`.
     */
    first<const Alt = undefined>(predicate: Seq.Predicate<T>, alt?: Alt): Doddle<T | Alt>

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

    /**
     * Groups the elements of `this` sequence by key, resulting in a sequence of pairs where the
     * first element is the key and the second is a sequence of values.
     *
     * @param keyProjection The projection used to determine the key for each element.
     * @returns A sequence of pairs.
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
     * ⚠️ May iterate over the entire sequence.
     *
     * @param values The values to check for inclusion.
     */
    includes<T extends S, S>(this: Seq<T>, ...values: S[]): Doddle<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence includes one or more values.
     *
     * ⚠️ May iterate over the entire sequence.
     *
     * @param values The values to check for inclusion.
     */
    includes<S extends T>(...value: S[]): Doddle<boolean>
    includes(..._values: any[]): Doddle<boolean> {
        const values = new Set(_values)
        return lazyOperator(this, function includes(input) {
            for (const element of input) {
                values.delete(element)
                if (values.size === 0) {
                    return true
                }
            }
            return false
        })
    }

    /**
     * 🦥**Lazily** joins the elements of `this` sequence into a single string, separated by the
     * given separator.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param separator The string to use as a separator between elements.
     * @returns A 🦥{@link Doddle} that resolves to the joined string.
     */
    join(separator: string = ","): Doddle<string> {
        chk(this.join).separator(separator)
        return lazyOperator(this, function join(input) {
            const results = []
            for (const x of input) {
                results.push(x)
            }
            return results.join(separator)
        })
    }
    /**
     * 🦥**Lazily** gets the last element in `this` sequence, or `undefined`.
     *
     * @returns A 🦥{@link Doddle} that resolves to the last element in `this` sequence, or
     *   `undefined`.
     */
    last(): Doddle<T | undefined>
    /**
     * 🦥**Lazily** finds the last element in `this` sequence that matches the given predicate.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param predicate The predicate for testing each element.
     * @param alt Optionally, the value to return if no matching value is found. Defaults to
     *   `undefined`.
     * @returns A 🦥{@link Doddle} that resolves to the last matching element or the alternative
     *   value.
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
     * @param projection The projection to apply to each element.
     * @returns A new sequence with the projected elements.
     */
    map<S>(projection: Seq.Iteratee<T, S>): Seq<S> {
        chk(this.map).projection(projection)
        return SeqOperator(this, function* map(input) {
            let index = 0
            for (const element of input) {
                yield pull(projection(element, index++)) as any
            }
        })
    }
    /**
     * 🦥**Lazily** finds the maximum element in `this` sequence by key, or the given alternative
     * value if the sequence is empty.
     *
     * @param projection Projects each element into a key so it can be compared.
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     */
    maxBy<K, const Alt = undefined>(projection: Seq.Iteratee<T, K>, alt?: Alt): Doddle<T | Alt> {
        chk(this.maxBy).projection(projection)
        return lazyOperator(this, function maxBy(input) {
            let curMax = alt as Alt | T
            let curMaxKey = undefined as K
            let index = 0
            for (const element of input) {
                const curKey = pull(projection(element, index++)) as K
                if (index === 1 || curKey > curMaxKey) {
                    curMax = element
                    curMaxKey = curKey
                    continue
                }
            }
            return curMax
        })
    }
    /**
     * 🦥**Lazily** finds the minimum element in `this` sequence by key, or the given alternative
     * value if the sequence is empty.
     *
     * @param projection Projects each element into a key so it can be compared.
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     * @returns A 🦥{@link Doddle} that resolves to the element with the minimum key, or `alt` if the
     *   sequence is empty.
     */
    minBy<K, const Alt = undefined>(projection: Seq.Iteratee<T, K>, alt?: Alt): Doddle<T | Alt> {
        chk(this.minBy).projection(projection)
        return lazyOperator(this, function minBy(input) {
            let curMin = alt as Alt | T
            let curMinKey = undefined as K
            let index = 0
            for (const element of input) {
                const curKey = pull(projection(element, index++)) as K
                if (index === 1 || curKey < curMinKey) {
                    curMin = element
                    curMinKey = curKey
                    continue
                }
            }
            return curMin
        })
    }

    /**
     * Orders the elements of `this` sequence by key, using the given key projection.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @param projection A projection that returns a key to order by.
     * @param descending Whether to use descending order.
     * @returns A new sequence with the elements ordered by the given key.
     */
    orderBy<K>(projection: Seq.NoIndexIteratee<T, K>, descending?: boolean): Seq<T>
    /**
     * Orders the elements of `this` using the given mutli-key tuple projection.
     *
     * ℹ️ The keys are compared in the order they appear.\
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @param projection A projection function that returns a tuple of keys to order by.
     * @param descending Whether to use descending order.
     * @returns A new sequence with the elements ordered by the given keys.
     */
    orderBy<K extends [unknown, ...unknown[]]>(
        projection: Seq.NoIndexIteratee<T, K>,
        descending?: boolean
    ): Seq<T>

    orderBy<K>(projection: Seq.NoIndexIteratee<T, K>, descending = false): Seq<T> {
        chk(this.orderBy).projection(projection)
        chk(this.orderBy).descending(descending)
        const compareKey = createCompareKey(descending)
        return SeqOperator(this, function* orderBy(input) {
            const kvps = [] as [K, T][]
            for (const element of input) {
                const key = pull(projection(element)) as K
                kvps.push([key, element])
            }

            kvps.sort(compareKey)
            for (const [_, value] of kvps) {
                yield value
            }
        })
    }
    /**
     * Returns a cartesian product of `this` sequence with one or more other sequences, optionally
     * applying an N-ary projection to each combination of elements.
     *
     * The product of `N` sequences is the collection of all possible sets of elements from each
     * sequence.
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
     * @param projection Optionally, an N-ary projection to apply to each combination of elements.
     *   If not given, each combination is yielded as an array.
     * @returns A new sequence.
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
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction.
     *
     * ℹ️ Uses the first element as the initial value.
     *
     * @param reduction The reduction function to apply to each element.
     * @returns A 🦥{@link Doddle} that resolves to the reduced value.
     */
    reduce(reduction: Seq.Reduction<T, T>): Doddle<T>
    /**
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction.
     *
     * ℹ️ You need to supply an initial value.
     *
     * @param reducer The reduction to apply to each element.
     * @param initial The initial value to start the reduction with.
     */
    reduce<Acc>(reducer: Seq.Reduction<T, Acc>, initial: Acc): Doddle<Acc>
    reduce<Acc>(reducer: Seq.Reduction<T, Acc>, initial?: Acc): Doddle<any> {
        chk(this.reduce).reducer(reducer)
        return lazyOperator(this, function reduce(input) {
            let acc = initial ?? (SPECIAL as any)
            let index = 0
            for (const element of input) {
                if (acc === SPECIAL) {
                    acc = element
                    continue
                }
                acc = pull(reducer(acc, element, index++)) as any
            }
            if (acc === SPECIAL) {
                throw new DoddleError(reduceOnEmptyError)
            }
            return acc
        }) as any
    }
    /**
     * Reverses `this` sequence.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @returns A new sequence with the elements in reverse order.
     */
    reverse() {
        return SeqOperator(this, function* reverse(input) {
            const elements: T[] = []
            for (const element of input) {
                elements.push(element)
            }

            yield* elements.reverse()
        })
    }
    /**
     * Applies a reduction to each element of `this` sequence. Returns a new sequence that yields
     * the accumulated value at each step.
     *
     * ℹ️ The first element is used as the initial value.
     *
     * @param reduction The reduction function to apply.
     * @returns A new sequence with the accumulated values.
     * @throws If `this` is empty.
     */
    scan(reduction: Seq.Reduction<T, T>): Seq<T>
    /**
     * Applies a reduction to each element of `this` sequence. Returns a new sequence that yields
     * the accumulated value at each step.
     *
     * ℹ️ You need to supply an initial value.
     *
     * @param reduction The reduction to apply.
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
     * 🦥**Lazily** checks if `this` sequence is equal to the `input` sequence.
     *
     * ℹ️ For two sequences to be equal, their elements must be equal and be in the same order.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
     */
    seqEquals<T extends S, S>(this: Seq<T>, input: Seq.Input<S>): Doddle<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence is equal to the `input` sequence.
     *
     * ℹ️ For two sequences to be equal, their elements must be equal and be in the same order.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
     */
    seqEquals<S extends T>(input: Seq.Input<S>): Doddle<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence is equal to the `input` sequence.
     *
     * ℹ️ For two sequences to be equal, their elements must be equal and be in the same order.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
     */
    seqEquals<K, S = T>(
        input: Seq.Input<S>,
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
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param input The sequence-like input to compare with.
     * @returns A 🦥{@link Doddle} that resolves to `true` if `this` is set-equal to the input, or
     *   `false` otherwise.
     */
    setEquals<T extends S, S>(this: Seq<T>, input: Seq.Input<S>): Doddle<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence contains the same elements as the input sequence,
     * without regard to order.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param input The sequence-like input to compare with.
     * @returns A 🦥{@link Doddle} that resolves to `true` if `this` is set-equal to the input, or
     *   `false` otherwise.
     */
    setEquals<S extends T>(input: Seq.Input<S>): Doddle<boolean>

    /**
     * 🦥**Lazily** checks if `this` sequence contains the same elements as the input sequence,
     * without regard to order.
     *
     * ℹ️ The elements are compared by key, using the given key projection.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if `this` is set-equal to the input, or
     *   `false` otherwise.
     */
    setEquals<K, S = T>(
        input: Seq.Input<S>,
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
     * Returns a new sequence that shares its iterator state. This allows different loops to iterate
     * over it, sharing progress.
     *
     * ⚠️ Can be iterated over exactly once, and will be empty afterwards.
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
     * Shuffles the elements of `this` sequence randomly.
     *
     * ⚠️ Requires iterating over the entire sequence.
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
     * Skips the first `count` elements of `this` sequence, yielding the rest.
     *
     * ℹ️ If `count` is negative, skips the final elements instead (e.g. `skipLast`)
     *
     * @param count The number of elements to skip.
     * @returns A new sequence without the skipped elements.
     */
    skip(count: number): Seq<T> {
        chk(this.skip).count(count)
        return SeqOperator(this, function* skip(input) {
            let myCount = count
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
                for (const x of input) {
                    if (myCount > 0) {
                        myCount--
                        continue
                    }
                    yield x
                }
            }
        }) as any
    }
    /**
     * Skips elements from `this` sequence while the given predicate is true, and yields the rest.
     *
     * ℹ️ You can use the `options` argument to skip the first element that returns `false`.
     *
     * @param predicate The predicate to determine whether to continue skipping.
     * @param options Options for skipping behavior.
     * @returns A new sequence without the skipped elements.
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
     * 🦥**Lazily** checks if any element in `this` sequence matches the given predicate, by
     * iterating over it until a match is found.
     *
     * @param predicate The predicate to match the element.
     * @returns A 🦥{@link Doddle} that resolves to `true` if any element matches, or `false`
     *   otherwise.
     */
    some(predicate: Seq.Predicate<T>): Doddle<boolean> {
        predicate = chk(this.some).predicate(predicate)
        return lazyOperator(this, function some(input) {
            let index = 0
            for (const element of input) {
                if (pull(predicate(element, index++))) {
                    return true
                }
            }
            return false
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
        chk(this.sumBy).projection(projection)
        return lazyOperator(this, function sumBy(input) {
            let cur = 0
            let index = 0
            for (const element of input) {
                cur += pull(projection(element, index++)) as number
            }
            return cur
        })
    }
    /**
     * Yields the first `count` elements of `this` sequence.
     *
     * ℹ️ If `count` is negative, yields the last `-count` elements instead.\
     * ℹ️ If the sequence is smaller than `count`, it yields all elements.
     *
     * @param count The number of elements to yield.
     * @returns A new sequence with the yielded elements.
     */
    take(count: number): Seq<T> {
        chk(this.take).count(count)
        return SeqOperator(this, function* take(input) {
            let myCount = count
            if (myCount === 0) {
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
                for (const element of input) {
                    yield element
                    myCount--
                    if (myCount <= 0) {
                        return
                    }
                }
            }
        }) as any
    }

    /**
     * Yields the first elements of `this` sequence while the given predicate is true and skips the
     * rest.
     *
     * ℹ️ If the sequence is too small, the result will be empty.\
     * ℹ️ The `options` argument lets you keep the first element for which the predicate returns
     * `false`.
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
     * 🦥**Lazily** converts `this` sequence into an array.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @returns A 🦥{@link Doddle} that resolves to an array.
     */
    toArray() {
        return lazyOperator(this, function toArray(input) {
            return [...input]
        })
    }

    /**
     * 🦥**Lazily** converts `this` sequence into a Map.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @param kvpProjection A function that takes an element and returns a key-value pair.
     * @returns A 🦥{@link Doddle} that resolves to a Map of the elements in the sequence.
     */
    toMap<Pair extends readonly [any, any]>(kvpProjection: Seq.Iteratee<T, Pair>) {
        kvpProjection = chk(this.toMap).kvpProjection(kvpProjection)
        return lazyOperator(this, function toMap(input) {
            const m = new Map<Pair[0], Pair[1]>()
            let index = 0
            for (const element of input) {
                const [key, value] = pull(kvpProjection(element, index++)) as Pair
                m.set(key, value)
            }
            return m
        })
    }
    /**
     * 🦥**Lazily** converts `this` sequence into a plain JS object. Uses the given `kvpProjection`
     * to determine each key-value pair.
     *
     * @param kvpProjection A function that takes an element and returns a key-value pair. Each key
     *   must be a valid PropertyKey.
     * @returns A 🦥{@link Doddle} that resolves to a plain JS object.
     */
    toRecord<const Key extends PropertyKey, Value>(
        kvpProjection: Seq.Iteratee<T, readonly [Key, Value]>
    ): Doddle<{
        [k in Key]: Value
    }> {
        chk(this.toRecord).kvpProjection(kvpProjection)
        return lazyOperator(this, function toObject(input) {
            const o = {} as any
            let index = 0
            for (const element of input) {
                const [key, value] = pull(kvpProjection(element, index++)) as readonly [Key, Value]
                o[key] = value
            }
            return o
        })
    }

    /**
     * 🦥**Lazily** converts `this` sequence into a Set.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @returns A 🦥{@link Doddle} that resolves to a Set of the elements in the sequence.
     */
    toSet() {
        return lazyOperator(this, function toSet(input) {
            return new Set(input)
        })
    }
    /**
     * Filters out duplicate elements from `this` sequence, optionally using a key projection.
     *
     * ℹ️ **Doesn't** need to iterate over the entire sequence.\
     * ⚠️ Needs to cache the sequence as it's iterated over.
     *
     * @param keyProjection A function that takes an element and returns a key used to check for
     *   uniqueness.
     * @returns A sequence of unique elements.
     */
    uniq(keyProjection: Seq.NoIndexIteratee<T, any> = x => x): Seq<T> {
        chk(this.uniq).keyProjection(keyProjection)
        return SeqOperator(this, function* uniq(input) {
            const seen = new Set()
            for (const element of input) {
                const key = pull(keyProjection(element))
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        })
    }
    /**
     * Splits `this` async sequence into overlapping windows of fixed size, applying a projection to
     * each window.
     *
     * ℹ️ If the sequence is smaller than the window size, one smaller window will yielded.
     *
     * @param size The size of each window.
     * @param projection A function to project each window to a value.
     * @returns A new sequence of windows or projected results.
     */
    window<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => S | Doddle<S>
    ): Seq<S>
    /**
     * Splits `this` async sequence into overlapping windows of fixed size.
     *
     * ℹ️ If the sequence is smaller than the window size, one smaller window will yielded.
     *
     * @param size The size of each window.
     * @returns A new sequence of windows.
     */
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
    /**
     * Zips `this` sequence with other sequences, yielding tuples of elements that appear in the
     * same position in each sequence.
     *
     * ℹ️ Sequences that are exhausted will yield `undefined` for their elements.\
     * ℹ️ The resulting sequence will be as long as the longest input sequence.
     *
     * @param others An array of other sequence inputs to zip with.
     * @returns A new async sequence of tuples containing parallel elements.
     */
    zip<Xs extends [any, ...any[]]>(others: {
        [K in keyof Xs]: Seq.Input<Xs[K]>
    }): Seq<getZipValuesType<[T, ...Xs]>>
    /**
     * Zips `this` sequence with other sequences, applying a projection to each set of elements and
     * yielding the results.
     *
     * ℹ️ Sequences that are exhausted will yield `undefined` for their elements.\
     * ℹ️ The resulting sequence will be as long as the longest input sequence.
     *
     * @param others An array of other sequence inputs to zip with.
     * @returns A new sequence of elements generated from the zipped values.
     */
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
    /** @ignore */
    abstract [Symbol.iterator](): Iterator<T>
}

/** @internal */
export const SeqOperator = function seq<In, Out>(
    operand: In,
    impl: (input: In) => Iterable<Out>
): Seq<Out> {
    const mySeq = Object.assign(new (Seq as any)(), [impl.name, operand])
    return Object.defineProperty(mySeq, Symbol.iterator, {
        get: () => impl.bind(mySeq, mySeq[1])
    })
}

/**
 * Types associated with the {@link Seq} class.
 *
 * @category Types
 */
export namespace Seq {
    /**
     * A type that can be either a value or a {@link Doddle} of that value
     *
     * @inline
     */
    type MaybeDoddle<Value> = Value | Doddle<Value>
    /**
     * An iteratee that receives only the index and returns a value or promise of a value.
     *
     * ℹ️ Useful for operations that depend solely on element position.
     *
     * @template O The output type.
     * @inline
     */
    export type ElementOfInput<SeqLike> = SeqLike extends Input<infer Element> ? Element : never
    /**
     * An iteratee that receives consecutive indexes, not elements. Used for generating sequences.
     *
     * @template Out The element type of the sequence.
     * @inline
     */
    export type IndexIteratee<Out> = (index: number) => MaybeDoddle<Out>

    /**
     * A function applied to each element and its index, producing a value or promise of a value.
     *
     * ℹ️ Used in most transformation and filtering operations.
     *
     * @template E The input element type.
     * @template O The output value type.
     * @inline
     */
    export type Iteratee<In, Out> = (element: In, index: number) => MaybeDoddle<Out>

    /**
     * An iteratee that ignores the index and returns a value or promise.
     *
     * ℹ️ Used for operations that ignore the index, such as some key projections.
     *
     * @template E The input element type.
     * @template O The output value type.
     * @inline
     */
    export type NoIndexIteratee<In, Out> = (element: In) => MaybeDoddle<Out>

    /**
     * A function called at stages "before" or "after" yielding an element.
     *
     * ℹ️ Used for operations that call side-effect functions.
     *
     * @template E The input element type.
     * @template O The output type, typically used for side-effects.
     * @inline
     */
    export type StageIteratee<In, Out> = (
        element: In,
        index: number,
        stage: "before" | "after"
    ) => Out

    /**
     * A predicate function over elements, returning boolean or promise of boolean.
     *
     * ℹ️ Used for filtering, counting, or skipping elements based on a condition.
     *
     * @template E The input element type.
     * @inline
     */
    export type Predicate<In> = Iteratee<In, boolean>
    /**
     * A type predicate {@link Iteratee}. When filtering, narrows the element type.
     *
     * @template In The input element type.
     * @template Narrowed The narrowed element type.
     * @inline
     */
    export type TypePredicate<In, Narrowed extends In> = (
        element: In,
        index: number
    ) => element is Narrowed

    /**
     * A reducer function combining an accumulator and element to produce a new accumulator.
     *
     * ℹ️ Used in operations like `reduce` or `scan` to accumulate results.
     *
     * @template E The element type.
     * @template O The accumulator type.
     * @inline
     */
    export type Reduction<In, Result> = (
        acc: Result,
        element: In,
        index: number
    ) => MaybeDoddle<Result>

    /**
     * A function that returns a sequence or iterator, possibly asynchronously.
     *
     * ℹ️ Used in conversions to {@link Seq}.
     *
     * @template E The element type.
     */
    export type FunctionInput<Item> = () => MaybeDoddle<ObjectIterable<MaybeDoddle<Item>>>

    /**
     * An Iterable, Iterator, or ArrayLike but **not** a `string`.
     *
     * ℹ️ Used in conversions to {@link Seq}.
     *
     * @template Item The element type of the iterable.
     */
    export type ObjectIterable<Item> = object & (Iterable<Item> | Iterator<Item> | ArrayLike<Item>)

    /**
     * The general input type for a sequence.s
     *
     * @template E The element type (may be a promise of something).
     */
    export type Input<Item> = MaybeDoddle<ObjectIterable<Item>> | FunctionInput<Item>

    /**
     * A zero-argument action for side-effects that may return a doddle-wrapped value.
     *
     * @inline
     */

    export type NoInputAction = () => unknown | Doddle<unknown>

    /**
     * A grouped output pairing a key with a sub-sequence of elements.
     *
     * @template K The group key type.
     * @template T The element type within the group.
     * @inline
     */
    export type Group<Key, Val> = readonly [Key, Seq<Val>]
}
