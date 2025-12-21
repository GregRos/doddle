import type { Doddle, DoddleAsync } from "../doddle/index.js"
import { doddle, lazyOperator, pull } from "../doddle/index.js"
import { DoddleError, chk, loadCheckers, reduceOnEmptyError } from "../errors/error.js"
import type { DoddleReadableStream } from "../readable-stream-polyfill.js"
import {
    Stage,
    _aiter,
    createCompareKey,
    orderedStages,
    shuffleArray,
    type MaybeDoddleAsync,
    type MaybePromise
} from "../utils.js"
import { aseq } from "./aseq.ctor.js"
import {
    SkippingMode,
    type EachCallStage,
    type Get_Concat_Element_Type,
    type SkipWhileOptions,
    type TakeWhileOptions,
    type getWindowArgsType,
    type getWindowOutputType,
    type getZipValuesType
} from "./common-types.js"
import { Seq } from "./seq.class.js"
import { seq } from "./seq.ctor.js"

const SPECIAL = Symbol("special")
/**
 * The ASeq class, which wraps an async iterable.
 *
 * @category Use
 */
export abstract class ASeq<T> implements AsyncIterable<T> {
    /** {@link concatMap} */
    flatMap = this.concatMap
    /** @internal */
    constructor() {
        // Class name is used for various checks
        // Need to make sure it's accessible even while minified
        loadCheckers(ASeq.prototype)
    }
    /** @internal */
    get [Symbol.toStringTag]() {
        return "ASeq"
    }
    /** @internal */
    get _qr() {
        return this.toArray().pull()
    }
    /**
     * Calls a side-effect function after all elements have been yielded, but before iteration
     * finishes.
     *
     * ⚠️ If the client stops iterating early, the function won't be called.
     *
     * @param action A function to invoke after iteration completes.
     * @returns A new sequence that acts like `this` but invokes `action` before it finishes.
     */
    after(action: ASeq.NoInputAction): ASeq<T> {
        chk(this.after).action(action)
        return ASeqOperator(this, async function* after(input) {
            yield* input
            await pull(action())
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
        return this as any as ASeq<S>
    }

    /**
     * 🦥**Lazily** gets the element at the given index in `this` sequence, or undefined if the
     * index is out of bounds.
     *
     * ℹ️ Negative indexes count from the end of the sequence.\
     * ⚠️ Requires iterating over the sequence up to the given index.
     *
     * @param index The index of the item to retrieve.
     * @returns A 🦥{@link DoddleAsync} that resolves to the item at the given index.
     */
    at(index: number): DoddleAsync<T | undefined> {
        chk(this.at).index(index)
        return lazyOperator(this, async function at(input) {
            if (index < 0) {
                return input.take(index).first().pull()
            }
            return input.skip(index).first().pull() as any
        })
    }

    /**
     * Executes a side effect action once before any elements are yielded, but after iteration has
     * begun.
     *
     * @param action Invokes before any elements are yielded.
     * @returns A new async sequence that performs `action` before yielding elements.
     */
    before(action: ASeq.NoInputAction): ASeq<T> {
        chk(this.before).action(action)
        return ASeqOperator(this, async function* before(input) {
            await pull(action())
            yield* input
        }) as any
    }

    /**
     * Caches the elements of `this` sequence as they're iterated over, so that it's evaluated only
     * once.
     *
     * @returns A new sequence with the same elements as the original sequence.
     */
    cache(): ASeq<T> {
        const self = this
        const _cache: T[] = []
        let alreadyDone = false
        let iterator: AsyncIterator<T>
        let pending: Promise<void> | undefined
        return ASeqOperator(this, async function* cache() {
            let i = 0
            for (;;) {
                if (i < _cache.length) {
                    const cur = _cache[i]
                    yield cur
                    i++
                } else if (!alreadyDone) {
                    iterator ??= _aiter(self)
                    if (!pending) {
                        pending = (async () => {
                            const { done, value } = await iterator.next()
                            if (done) {
                                alreadyDone = true
                                return
                            }
                            _cache.push(value)
                            pending = undefined
                            return
                        })()
                    }
                    await pending
                } else {
                    return
                }
            }
        }) as any
    }

    /**
     * Handles errors thrown while iterating over `this` sequence.
     *
     * @param handler A handler that will be called with the error and the index of the element that
     *   caused it. Should return a new sequence or `undefined`, which stops iteration.
     * @returns A new sequence that handles errors.
     */
    catch<S = T>(handler: ASeq.Iteratee<unknown, ASeq.Input<S> | void>): ASeq<T | S>

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
    chunk<L extends number, S>(
        size: L,
        projection: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
    ): ASeq<S>
    /**
     * Splits `this` sequence into chunks of the given size,.
     *
     * ℹ️ The last chunk may be smaller than the given size.
     *
     * @param size The size of each chunk.
     * @returns A new sequence.
     */
    chunk<L extends number>(size: L): ASeq<getWindowOutputType<T, L>>
    /**
     * Splits `this` async sequence into chunks of the given size, optionally applying a projection
     * to each chunk.
     *
     * @param size The size of each chunk. The last chunk may be smaller.
     * @param projection Optionally, an N-ary projection to apply to each chunk.
     * @returns A new async sequence of chunks, each containing consecutive elements from the
     *   original.
     */
    chunk<L extends number, S>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => S
    ): ASeq<getWindowOutputType<T, L>> {
        const c = chk(this.chunk)
        c.size(size)
        projection ??= (...chunk: any) => chunk as any
        c.projection(projection)
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
    collect(): ASeq<T> {
        return ASeqOperator(this, async function* collect(input) {
            const everything: T[] = []
            for await (const element of input) {
                everything.push(element)
            }
            yield* everything
        })
    }

    /**
     * Concatenates one or more sequences to the end of `this`, so that their elements appear in
     * order.
     *
     * @param _inputs The sequential inputs to concatenate to the end of `this`.
     * @returns A new sequence with the concatenated elements.
     */
    concat<ASeqs extends ASeq.SimpleInput<any>[]>(
        ..._inputs: ASeqs
    ): ASeq<T | ASeq.ElementOfInput<ASeqs[number]>> {
        const inputs = _inputs.map(aseq)
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

    /**
     * Applies a sequence projection on each element of `this` sequence and concatenates the
     * resulting sequences.
     *
     * @param projection The sequence projection to apply to each element.
     * @returns A new sequence with the flattened results.
     */
    concatMap<S>(
        projection: ASeq.Iteratee<T, ASeq.SimpleInput<S>>
    ): ASeq<Get_Concat_Element_Type<T, S>> {
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

    /**
     * Concatenates `this` sequence to the end of one or more other sequences.
     *
     * ℹ️ Input sequences are concatenated in the order that they appear.
     *
     * @param inputs One or more other sequences.
     * @returns A new sequence with the concatenated elements.
     * @see {@link ASeq.concat}
     */
    concatTo<Seqs extends ASeq.Input<any>[]>(
        ...others: Seqs
    ): ASeq<T | ASeq.ElementOfInput<Seqs[number]>> {
        return aseq([]).concat(...others, this) as any
    }

    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to the number of elements in `this`.
     */
    count(): DoddleAsync<number>
    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence that match the given predicate.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param predicate The predicate used to test each element.
     * @returns A 🦥{@link DoddleAsync} that resolves to the number of matching elements.
     */
    count(predicate: ASeq.Predicate<T>): DoddleAsync<number>
    count(predicate?: ASeq.Predicate<T>): DoddleAsync<number> {
        predicate ??= () => true
        predicate = chk(this.count).predicate(predicate)
        return lazyOperator(this, async function count(input) {
            let index = 0
            let count = 0
            for await (const element of input) {
                if (await pull(predicate(element, index++))) {
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
    each(action: ASeq.StageIteratee<T, unknown>, stage: EachCallStage = "before") {
        const c = chk(this.each)
        c.action(action)
        c.stage(stage)
        const myStage = orderedStages.indexOf(stage)
        return ASeqOperator(this, async function* each(input) {
            let index = 0
            for await (const element of input) {
                if (myStage & Stage.Before) {
                    await (myStage & Stage.Before && pull(action(element, index, "before")))
                }
                yield element
                if (myStage & Stage.After) {
                    await (myStage & Stage.After && pull(action(element, index, "after")))
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
     * @returns A 🦥{@link DoddleAsync} that yields `true` if all elements match, or `false`
     *   otherwise.
     */
    every(predicate: ASeq.Predicate<T>): DoddleAsync<boolean> {
        predicate = chk(this.every).predicate(predicate)
        return lazyOperator(this, async function every(input) {
            let index = 0
            for await (const element of input) {
                if (!(await pull(predicate(element, index++)))) {
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
    filter<S extends T>(predicate: Seq.TypePredicate<T, S>): ASeq<S>
    /**
     * Filters the elements of `this` sequence based on the given predicate.
     *
     * @param predicate The predicate to filter elements.
     * @returns A new sequence with the filtered elements.
     */
    filter(predicate: ASeq.Predicate<T>): ASeq<T>

    filter(predicate: ASeq.Predicate<T>) {
        predicate = chk(this.filter).predicate(predicate)
        return ASeqOperator(this, async function* filter(input) {
            let index = 0
            for await (const element of input) {
                if (await pull(predicate(element, index++))) {
                    yield element
                }
            }
        })
    }

    /**
     * 🦥**Lazily** finds the first element in `this` sequence, or `undefined` if it's empty.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to the first element or the alternative value.
     */
    first(): DoddleAsync<T | undefined>
    /**
     * 🦥**Lazily** finds the first element in `this` sequence that matches the given predicate.
     *
     * ⚠️ May iterate over the entire sequence.
     *
     * @param predicate The predicate used to find the element.
     * @param alt The value to return if no element matches the predicate. Defaults to `undefined`.
     */
    first<const Alt = undefined>(predicate: ASeq.Predicate<T>, alt?: Alt): DoddleAsync<T | Alt>

    first<Alt = T>(predicate?: ASeq.Predicate<T>, alt?: Alt) {
        predicate = predicate || (() => true)
        chk(this.first).predicate(predicate)
        return lazyOperator(this, async function first(input) {
            let index = 0
            for await (const element of input) {
                if (await pull(predicate(element, index++))) {
                    return element as T | Alt
                }
            }
            return alt as T | Alt
        })
    }

    /**
     * Groups the elements of `this` sequence by key, resulting in a sequence of pairs where the
     * first element is the key and the second is a sequence of values.
     *
     * @param keyProjection The projection used to determine the key for each element.
     * @returns A sequence of pairs.
     */
    groupBy<K>(keyProjection: ASeq.NoIndexIteratee<T, K>): ASeq<ASeq.Group<K, T>> {
        chk(this.groupBy).keyProjection(keyProjection)

        return ASeqOperator(this, async function* groupBy(input) {
            const map = new Map<K, [T, ...T[]]>()
            const keys: K[] = []
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
                        if (i < group.length) break
                    }
                    if (i >= group.length) return
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
                    if (i < keys.length) break
                }
                if (i >= keys.length) return
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
    includes<T extends S, S>(this: ASeq<T>, ...values: S[]): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence includes one or more values.
     *
     * ⚠️ May iterate over the entire sequence.
     *
     * @param values The values to check for inclusion.
     */
    includes<S extends T>(...values: S[]): DoddleAsync<boolean>

    includes<S extends T>(..._values: S[]): DoddleAsync<boolean> {
        const values = new Set(_values)
        return lazyOperator(this, async function includes(input) {
            for await (const element of input) {
                values.delete(element as S)
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
     * @returns A 🦥{@link DoddleAsync} that resolves to the joined string.
     */
    join(separator = ","): DoddleAsync<string> {
        chk(this.join).separator(separator)
        return lazyOperator(this, async function join(input) {
            const results = []
            for await (const x of input) {
                results.push(x)
            }
            return results.join(separator)
        })
    }

    /**
     * 🦥**Lazily** gets the last element in `this` sequence, or `undefined`.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to the last element in `this` sequence, or
     *   `undefined`.
     */
    last(): DoddleAsync<T | undefined>
    /**
     * 🦥**Lazily** finds the last element in `this` sequence that matches the given predicate.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param predicate The predicate for testing each element.
     * @param alt Optionally, the value to return if no matching value is found. Defaults to
     *   `undefined`.
     * @returns A 🦥{@link DoddleAsync} that resolves to the last matching element or the alternative
     *   value.
     */
    last<const Alt = undefined>(predicate: ASeq.Predicate<T>, alt?: Alt): DoddleAsync<T | Alt>

    last<Alt = undefined>(predicate?: ASeq.Predicate<T>, alt?: Alt) {
        predicate ??= () => true
        chk(this.last).predicate(predicate)
        return lazyOperator(this, async function last(input) {
            let last: T | Alt = alt as Alt
            let index = 0
            for await (const element of input) {
                if (await pull(predicate(element, index++))) {
                    last = element
                }
            }
            return last as T | Alt
        })
    }

    /**
     * Applies a projection to each element of `this` sequence.
     *
     * @param projection The projection to apply to each element.
     * @returns A new sequence with the projected elements.
     */
    map<S>(projection: ASeq.Iteratee<T, S>): ASeq<S> {
        chk(this.map).projection(projection)
        return ASeqOperator(this, async function* map(input) {
            let index = 0
            for await (const element of input) {
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
    maxBy<K, const Alt = undefined>(
        projection: ASeq.Iteratee<T, K>,
        alt?: Alt
    ): DoddleAsync<T | Alt> {
        chk(this.maxBy).projection(projection)
        return lazyOperator(this, async function maxBy(input) {
            let curMax = alt as Alt | T
            let curMaxKey = undefined as K
            let index = 0
            for await (const element of input) {
                const curKey = (await pull(projection(element, index++))) as K
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
     * @returns A 🦥{@link DoddleAsync} that resolves to the element with the minimum key, or `alt`
     *   if the sequence is empty.
     */
    minBy<K, const Alt = undefined>(
        projection: ASeq.Iteratee<T, K>,
        alt?: Alt
    ): DoddleAsync<T | Alt>

    minBy<K>(projection: ASeq.Iteratee<T, K>, alt?: any) {
        chk(this.minBy).projection(projection)
        return lazyOperator(this, async function minBy(input) {
            let curMin = alt as any
            let curMinKey = undefined as K
            let index = 0
            for await (const element of input) {
                const curKey = (await pull(projection(element, index++))) as K
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
    orderBy<S>(projection: ASeq.NoIndexIteratee<T, S>, descending?: boolean): ASeq<T>

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
        projection: ASeq.NoIndexIteratee<T, K>,
        descending?: boolean
    ): ASeq<T>

    orderBy<S>(projection: ASeq.NoIndexIteratee<T, S>, descending = false): ASeq<T> {
        const c = chk(this.orderBy)
        c.projection(projection)
        c.descending(descending)
        const compareKey = createCompareKey(descending)
        return ASeqOperator(this, async function* orderBy(input) {
            const kvps = [] as [any, T][]
            for await (const element of input) {
                const key = (await pull(projection(element))) as any
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
     *     aseq([1, 2]).product([3, 4])
     *     // => [[1, 3], [1, 4], [2, 3], [2, 4]]
     *     aseq([]).product([3, 4])
     *     // => []
     *     aseq([1, 2]).product([3, 4], (a, b) => a + b)
     *     // => [4, 5, 5, 6]
     *
     * @param others One or more sequence-like inputs for the product.
     * @param projection Optionally, an N-ary projection to apply to each combination of elements.
     *   If not given, each combination is yielded as an array.
     * @returns A new sequence.
     */
    product<Xs extends any[], R = [T, ...Xs]>(
        _others: {
            [K in keyof Xs]: ASeq.Input<Xs[K]>
        },
        projection?: (...args: [T, ...Xs]) => R
    ): ASeq<R> {
        const others = _others.map(aseq).map(x => x.cache())
        projection ??= (...args: any[]) => args as any
        chk(this.product).projection(projection)
        return ASeqOperator(this, async function* product(input) {
            let partialProducts = [[]] as any[][]
            for (const iterable of [input, ...others].reverse()) {
                const oldPartialProducts = partialProducts
                partialProducts = []
                for await (const item of iterable) {
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
     * @returns A 🦥{@link DoddleAsync} that resolves to the reduced value.
     */
    reduce(reducer: ASeq.Reduction<T, T>): DoddleAsync<T>
    /**
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction.
     *
     * ℹ️ You need to supply an initial value.
     *
     * @param reducer The reduction to apply to each element.
     * @param initial The initial value to start the reduction with.
     */
    reduce<Acc>(reducer: ASeq.Reduction<T, Acc>, initial: Acc): DoddleAsync<Acc>
    reduce<Acc>(reducer: ASeq.Reduction<T, Acc>, initial?: Acc): any {
        chk(this.reduce).reducer(reducer)
        return lazyOperator(this, async function reduce(input) {
            let acc = initial ?? (SPECIAL as any)
            let index = 0
            for await (const element of input) {
                if (acc === SPECIAL) {
                    acc = element
                    continue
                }
                acc = (await pull(reducer(acc, element, index++))) as any
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
    reverse(): ASeq<T> {
        return ASeqOperator(this, async function* reverse(input) {
            const elements: T[] = []
            for await (const element of input) {
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
    scan(reducer: ASeq.Reduction<T, T>): ASeq<T>
    /**
     * Applies a reduction to each element of `this` sequence. Returns a new sequence that yields
     * the accumulated value at each step.
     *
     * ℹ️ You need to supply an initial value.
     *
     * @param reduction The reduction to apply.
     * @param initial The initial value to start the reduction with.
     */
    scan<Acc>(reducer: ASeq.Reduction<T, Acc>, initial: Acc): ASeq<Acc>
    scan<Acc>(reducer: ASeq.Reduction<T, Acc>, initial?: Acc): ASeq<any> {
        chk(this.scan).reducer(reducer)
        return ASeqOperator(this, async function* scan(input) {
            let hasAcc = initial !== undefined
            let acc = initial as any
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

    /**
     * 🦥**Lazily** checks if `this` sequence is equal to the `input` sequence.
     *
     * ℹ️ For two sequences to be equal, their elements must be equal and be in the same order.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if all elements are equal, or `false`
     */
    seqEquals<T extends S, S>(this: AsyncIterable<T>, input: ASeq.Input<S>): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence is equal to the `input` sequence.
     *
     * ℹ️ For two sequences to be equal, their elements must be equal and be in the same order.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if all elements are equal, or `false`
     */
    seqEquals<S extends T>(input: ASeq.Input<S>): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence is equal to the `input` sequence.
     *
     * The elements are compared by key, using the given key projection.
     *
     * @param input The sequential input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if all elements are equal, or `false`
     *   otherwise.
     */
    seqEquals<K, S = T>(
        input: ASeq.Input<S>,
        projection: ASeq.NoIndexIteratee<S | T, K>
    ): DoddleAsync<boolean>

    seqEquals<K, S = T>(
        input: ASeq.Input<S>,
        projection: ASeq.NoIndexIteratee<S | T, K> = x => x as K
    ): DoddleAsync<boolean> {
        projection ??= x => x as K

        const other = aseq(input)
        return lazyOperator(this, async function seqEquals(input) {
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

    /**
     * 🦥**Lazily** checks if `this` sequence contains the same elements as the input sequence,
     * without regard to order.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param input The sequence-like input to compare with.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if `this` is set-equal to the input,
     *   or `false` otherwise.
     */
    setEquals<S extends T>(input: ASeq.Input<S>): DoddleAsync<boolean>

    /**
     * 🦥**Lazily** checks if `this` sequence contains the same elements as the input sequence,
     * without regard to order.
     *
     * ⚠️ Requires iterating over the entire sequence.
     *
     * @param input The sequence-like input to compare with.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if `this` is set-equal to the input,
     *   or `false` otherwise.
     */
    setEquals<T extends S, S>(this: AsyncIterable<T>, input: ASeq.Input<S>): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if `this` sequence contains the same elements as the input sequence,
     * without regard to order.
     *
     * ℹ️ The elements are compared by key, using the given key projection.
     *
     * @param input The sequence-like input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if `this` is set-equal to the input,
     *   or `false` otherwise.
     */
    setEquals<K, S = T>(
        input: ASeq.Input<NoInfer<S>>,
        projection?: ASeq.NoIndexIteratee<S | T, K>
    ): DoddleAsync<boolean>
    setEquals<K, S = T>(
        _other: ASeq.Input<S>,
        projection: ASeq.NoIndexIteratee<S | T, K> = x => x as K
    ): DoddleAsync<boolean> {
        projection ??= x => x as K
        const other = aseq(_other)
        return lazyOperator(this, async function setEquals(input) {
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

    /**
     * Returns a new sequence that shares its iterator state. This allows different loops to iterate
     * over it, sharing progress.
     *
     * ⚠️ Can be iterated over exactly once, and will be empty afterwards.
     *
     * @returns A new, shared iterable sequence that can be iterated over exactly once.
     */
    share(): ASeq<T> {
        const iter = doddle(() => _aiter(this))
        return ASeqOperator(this, async function* share() {
            while (true) {
                const { done, value } = await iter.pull().next()
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
    shuffle(): ASeq<T> {
        return ASeqOperator(this, async function* shuffle(input) {
            const array = await aseq(input).toArray().pull()
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
    skip(count: number): ASeq<T> {
        chk(this.skip).count(count)
        return ASeqOperator(this, async function* skip(input) {
            let myCount = count
            if (myCount < 0) {
                myCount = -myCount
                yield* aseq(input)
                    .window(myCount + 1, (...window) => {
                        if (window.length === myCount + 1) {
                            return window[0]
                        }
                        return SPECIAL
                    })
                    .filter(x => x !== SPECIAL)
            } else {
                for await (const x of input) {
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

    /**
     * 🦥**Lazily** checks if any element in `this` sequence matches the given predicate, by
     * iterating over it until a match is found.
     *
     * @param predicate The predicate to match the element.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if any element matches, or `false`
     *   otherwise.
     */
    some(predicate: ASeq.Predicate<T>): DoddleAsync<boolean> {
        predicate = chk(this.some).predicate(predicate)
        return lazyOperator(this, async function some(input) {
            let index = 0
            for await (const element of input) {
                if (await pull(predicate(element, index++))) {
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
     * @returns A 🦥{@link DoddleAsync} that resolves to the sum of the projected elements.
     */
    sumBy(projection: ASeq.Iteratee<T, number>): DoddleAsync<number> {
        chk(this.sumBy).projection(projection)
        return lazyOperator(this, async function sumBy(input) {
            let cur = 0
            let index = 0
            for await (const element of input) {
                cur += (await pull(projection(element, index++))) as number
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
    take(count: number): ASeq<T> {
        chk(this.take).count(count)
        return ASeqOperator(this, async function* take(input) {
            let myCount = count
            if (myCount === 0) {
                return
            }
            if (myCount < 0) {
                myCount = -myCount
                const results = (await aseq(input)
                    .concat([SPECIAL])
                    .window(myCount + 1, (...window) => {
                        if (window[window.length - 1] === SPECIAL) {
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
                for await (const element of input) {
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
    takeWhile(predicate: ASeq.Predicate<T>, specifier?: TakeWhileOptions): ASeq<T> {
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

    /**
     * 🦥**Lazily** converts `this` sequence into an array.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to an array of the elements in the sequence.
     */
    toArray(): DoddleAsync<T[]> {
        return lazyOperator(this, async function toArray(input) {
            const result: T[] = []
            for await (const element of input) {
                result.push(element)
            }
            return result
        })
    }
    /**
     * 🦥**Lazily** converts `this` sequence into a Map.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @param kvpProjection A function that takes an element and returns a key-value pair.
     * @returns A 🦥{@link DoddleAsync} that resolves to a Map of the elements in the sequence.
     */
    toMap<Pair extends readonly [any, any]>(
        kvpProjection: ASeq.Iteratee<T, Pair>
    ): DoddleAsync<Map<Pair[0], Pair[1]>> {
        kvpProjection = chk(this.toMap).kvpProjection(kvpProjection)
        return lazyOperator(this, async function toMap(input) {
            const m = new Map<Pair[0], Pair[1]>()
            let index = 0
            for await (const element of input) {
                const [key, value] = (await pull(kvpProjection(element, index++))) as Pair
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
     * @returns A 🦥{@link DoddleAsync} that resolves to a plain JS object.
     */
    toRecord<const Key extends PropertyKey, Value>(
        kvpProjection: ASeq.Iteratee<T, readonly [Key, Value]>
    ): DoddleAsync<Record<Key, Value>> {
        chk(this.toRecord).kvpProjection(kvpProjection)
        return lazyOperator(this, async function toObject(input) {
            const o = {} as any
            let index = 0
            for await (const element of input) {
                const [key, value] = (await pull(kvpProjection(element, index++))) as readonly [
                    Key,
                    Value
                ]
                o[key] = value
            }
            return o
        })
    }

    /**
     * **Lazily** converts `this` async sequence into a synchronous {@link Seq} sequence.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to a synchronous {@link Seq} sequence.
     */
    toSeq(): DoddleAsync<Seq<T>> {
        return lazyOperator(this, async function toSeq(input) {
            const all = await aseq(input).toArray().pull()
            return seq(all)
        })
    }
    /**
     * 🦥**Lazily** converts `this` sequence into a Set.
     *
     * ⚠️ Has to iterate over the entire sequence.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to a Set of the elements in the sequence.
     */
    toSet(): DoddleAsync<Set<T>> {
        return lazyOperator(this, async function toSet(input) {
            const result = new Set<T>()
            for await (const element of input) {
                result.add(element)
            }
            return result
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
    uniq(keyProjection: ASeq.NoIndexIteratee<T, any> = x => x): ASeq<T> {
        chk(this.uniq).projection(keyProjection)
        return ASeqOperator(this, async function* uniq(input) {
            const seen = new Set<any>()
            for await (const element of input) {
                const key = await pull(keyProjection(element))
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        }) as any
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
        projection: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
    ): ASeq<S>
    /**
     * Splits `this` async sequence into overlapping windows of fixed size.
     *
     * ℹ️ If the sequence is smaller than the window size, one smaller window will yielded.
     *
     * @param size The size of each window.
     * @returns A new sequence of windows.
     */
    window<L extends number>(size: L): ASeq<getWindowOutputType<T, L>>
    /**
     * Splits `this` async sequence into overlapping windows of fixed size, optionally applying a
     * projection to each window.
     *
     * @param size The size of each window. The last window may be smaller.
     * @param projection Optionally, a function to project each window to a value or promise of a
     *   value.
     * @returns A new async sequence of windowed values or projected results.
     */
    window<L extends number, S>(
        size: L,
        projection?: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
    ): ASeq<any> {
        const c = chk(this.window)
        c.size(size)
        projection ??= (...window: any) => window as any
        c.projection(projection)
        return ASeqOperator(this, async function* window(input) {
            const buffer = Array<T>(size)
            let i = 0
            for await (const item of input) {
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
    zip<Xs extends [any, ...any[]]>(others: { [K in keyof Xs]: Seq.Input<Xs[K]> }): ASeq<
        getZipValuesType<[T, ...Xs]>
    >
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
        _others: { [K in keyof Xs]: ASeq.Input<Xs[K]> },
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
                yield pull((projection as any)(...(results.map(r => r?.value) as any)))
            }
        }) as any
    }

    /** @ignore */

    abstract [Symbol.asyncIterator](): AsyncIterator<T>
}
/** @internal */
export const ASeqOperator = function aseq<In, Out>(
    operand: In,
    impl: (input: In) => AsyncIterable<Out>
): ASeq<Out> {
    const myASeq = Object.assign(new (ASeq as any)(), [impl.name, operand])
    return Object.defineProperty(myASeq, Symbol.asyncIterator, {
        get: () => impl.bind(myASeq, myASeq[1])
    })
}
/**
 * A collection of type definitions for asynchronous sequence operations in Doddle.
 *
 * @category Types
 */
export namespace ASeq {
    /**
     * An iteratee that receives only the index and returns a value or promise of a value.
     *
     * ℹ️ Useful for operations that depend solely on element position.
     *
     * @template O The output type.
     * @inline
     */
    export type IndexIteratee<O> = (index: number) => Doddle.MaybePromised<O>

    /**
     * A function applied to each element and its index, producing a value or promise of a value.
     *
     * ℹ️ Used in most transformation and filtering operations.
     *
     * @template E The input element type.
     * @template O The output value type.
     * @inline
     */
    export type Iteratee<E, O> = (element: E, index: number) => Doddle.MaybePromised<O>

    /**
     * A specialized iteratee that projects elements to property keys.
     *
     * ℹ️ Used for operations that turn sequences into objects.
     *
     * @template E The input element type.
     * @template K The key type extending PropertyKey.
     * @inline
     */
    export type PropertyKeyIteratee<E, K extends PropertyKey> = Iteratee<E, K>

    /**
     * An iteratee that ignores the index and returns a value or promise.
     *
     * ℹ️ Used for operations that ignore the index, such as some key projections.
     *
     * @template E The input element type.
     * @template O The output value type.
     * @inline
     */
    export type NoIndexIteratee<E, O> = (element: E) => Doddle.MaybePromised<O>

    /**
     * A function called at stages "before" or "after" yielding an element.
     *
     * ℹ️ Used for operations that call side-effect functions.
     *
     * @template E The input element type.
     * @template O The output type, typically used for side-effects.
     * @inline
     */
    export type StageIteratee<E, O> = (
        element: E,
        index: number,
        stage: "before" | "after"
    ) => Doddle.MaybePromised<O>

    /**
     * A predicate function over elements, returning boolean or promise of boolean.
     *
     * ℹ️ Used for filtering, counting, or skipping elements based on a condition.
     *
     * @template E The input element type.
     * @inline
     */
    export type Predicate<E> = Iteratee<E, boolean>

    /**
     * A reducer function combining an accumulator and element to produce a new accumulator.
     *
     * ℹ️ Used in operations like `reduce` or `scan` to accumulate results.
     *
     * @template E The element type.
     * @template O The accumulator type.
     * @inline
     */
    export type Reduction<E, O> = (acc: O, element: E, index: number) => Doddle.MaybePromised<O>

    /**
     * Extracts the element type from a sequence-like input.
     *
     * ℹ️ Used to express the element type of a type parameter.
     *
     * @template T The input sequence type.
     * @inline
     */
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never

    /**
     * Represents any supported iterable or iterator type for async sequences.
     *
     * ℹ️ Used when an input needs to be sequential or convertible to {@link ASeq}.
     *
     * @template E The element type.
     * @inline
     */
    export type IterableOrIterator<E> =
        | AsyncIterable<E>
        | AsyncIterator<E>
        | Seq.ObjectIterable<E>
        | Iterator<E>
        | DoddleReadableStream<E>

    /**
     * A function that returns a sequence or iterator, possibly asynchronously.
     *
     * ℹ️ Used in conversions to {@link ASeq}.
     *
     * @template E The element type.
     */
    export type FunctionInput<E> = () => Doddle.MaybePromised<IterableOrIterator<E>>

    /**
     * A non-async iterable-like input that may emit promises of elements.
     *
     * ℹ️ Used in conversions to {@link ASeq}.
     *
     * @template E The element type.
     */
    export type DesyncedInput<E> = Seq.ObjectIterable<MaybePromise<E>>

    /**
     * A union of supported sequence inputs: desynced input, AsyncIterable, or ReadableStream.
     *
     * ℹ️ Used in conversions to {@link ASeq}.
     *
     * @template E The element type.
     */
    export type IterableInput<E> = DesyncedInput<E> | AsyncIterable<E> | DoddleReadableStream<E>

    /**
     * The simplest allowed inputs for constructing an async sequence:
     *
     * - A possibly-doddle-wrapped iterable,
     * - A DoddleAsync resolving to an iterable,
     * - Or a function returning an iterable.
     *
     * @template E The element type.
     */
    export type SimpleInput<E> =
        | MaybeDoddleAsync<IterableInput<E>>
        | DoddleAsync<IterableInput<E>>
        | FunctionInput<E>

    /**
     * The general input type for an async sequence, allowing promises of values.
     *
     * @template E The element type (may be a promise of something).
     */
    export type Input<E> = SimpleInput<MaybePromise<E>>

    /** A zero-argument action for side-effects that may return a doddle-wrapped value. * @inline */
    export type NoInputAction = () => MaybeDoddleAsync<MaybePromise<unknown>>

    /**
     * A grouped output pairing a key with a sub-sequence of elements.
     *
     * @template K The group key type.
     * @template T The element type within the group.
     * @inline
     */
    export type Group<K, T> = readonly [K, ASeq<T>]
}
