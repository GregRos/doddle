import type { Doddle, DoddleAsync } from "../doddle/index.js"
import { doddle, lazyOperator, pull } from "../doddle/index.js"
import { chk, loadCheckers } from "../errors/error.js"
import type { DoddleReadableStream } from "../readable-stream-polyfill.js"
import {
    Stage,
    _aiter,
    createCompareKey,
    orderedStages,
    returnKvp,
    shuffleArray,
    type MaybeDoddle,
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
const seqPrototype = Seq.prototype
/**
 * The ASeq class, which wraps an async iterable.
 *
 * @category Use
 */
export abstract class ASeq<T> implements Async1Iterable<T> {
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
    /** @ignore */

    abstract [Symbol.asyncIterator](): AsyncIterator<T>
    /** @internal */
    get _qr() {
        return this.toArray().pull()
    }
    /**
     * 🦥**Lazily** gets the element at the given index in `this` async sequence.
     *
     * @param index The index of the item to retrieve.
     * @returns A 🦥{@link DoddleAsync} that resolves to the item at the given index.
     */
    at(index: number): DoddleAsync<T | undefined> {
        return seqPrototype.at.call(this, index)
    }

    /**
     * Caches the elements of `this` async sequence as they're iterated over, so that it's evaluated
     * only once.
     *
     * @returns A new async sequence with the same elements as the original sequence, but cached.
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
     * Handles errors thrown by `this` async sequence.
     *
     * @param handler A handler that will be called with the error and the index of the element that
     *   caused it. Should return a new async sequence or `undefined` to stop the iteration.
     * @returns A new async sequence that handles errors.
     */
    catch<S>(handler: ASeq.Iteratee<unknown, ASeq.SimpleInput<S>>): ASeq<T | S>
    /**
     * Handles errors thrown by `this` async sequence.
     *
     * @param handler A handler that will be called with the error and the index of the element that
     *   caused it. Should return a new async sequence or `undefined` to stop the iteration.
     * @returns A new async sequence that handles errors.
     */
    catch(handler: ASeq.Iteratee<unknown, void>): ASeq<T>
    /**
     * Handles errors thrown by `this` async sequence.
     *
     * @param handler A handler that will be called with the error and the index of the element that
     *   caused it. Should return a new async sequence or `undefined` to stop the iteration.
     * @returns A new async sequence that handles errors.
     */
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
        projection: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
    ): ASeq<S>
    /**
     * Splits `this` async sequence into chunks of the given size, optionally applying a projection
     * to each chunk.
     *
     * @param size The size of each chunk. The last chunk may be smaller.
     * @returns A new async sequence of chunks, each containing consecutive elements from the
     *   original.
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
     * Applies a sequence projection on each element of `this` async sequence, flattening the
     * results, so that they appear in order.
     *
     * @param projection The sequence projection to apply to each element.
     * @returns A new async sequence with the flattened results.
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
     * 🦥**Lazily** joins the elements of `this` async sequence into a single string, separated by
     * the given separator.
     *
     * @param separator The string to use as a separator between elements.
     * @returns A 🦥{@link DoddleAsync} that resolves to the joined string.
     */
    join(separator = ","): DoddleAsync<string> {
        return seqPrototype.join.call(this, separator) as any
    }

    /**
     * Concatenates `this` async sequence with one or more other sequences, so that they appear in
     * order.
     *
     * @param _otherInputs The sequence-like inputs to concatenate to the end of `this` sequence.
     * @returns A new async sequence with the concatenated elements.
     */
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

    /**
     * Invokes a function as each element in `this` async sequence is iterated over. You can specify
     * whether to invoke it before or after it's yielded, or both.
     *
     * @param action The function to invoke for each element.
     * @param stage The **stage** at which to invoke the function (`before`, `after`, or `both`).
     * @returns A new async sequence that invokes the handler as each element is iterated over.
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
     * 🦥**Lazily** checks if all elements in `this` async sequence match the given predicate, by
     * iterating over it.
     *
     * @param predicate The predicate to test each element.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if all elements match, or `false`
     *   otherwise.
     */
    every(predicate: ASeq.Predicate<T>): DoddleAsync<boolean> {
        return seqPrototype.every.call(this, predicate as any) as any
    }

    /**
     * Filters the elements of `this` async sequence based on the given predicate, narrowing the
     * type of the elements in the resulting sequence.
     *
     * @param predicate A type guard predicate narrowing `T` to `S`.
     * @returns A new async sequence of elements of type `S`.
     */
    filter<S extends T>(predicate: Seq.TypePredicate<T, S>): ASeq<S>
    /**
     * Filters the elements of `this` async sequence based on the given predicate.
     *
     * @param predicate A predicate function to test each element.
     * @returns A new async sequence of elements that satisfy the predicate.
     */
    filter(predicate: ASeq.Predicate<T>): ASeq<T>
    /**
     * Filters the elements of `this` async sequence based on the given predicate.
     *
     * @param predicate A predicate function to test each element.
     * @returns A new async sequence of elements that satisfy the predicate.
     */
    filter(predicate: ASeq.Predicate<T>) {
        predicate = chk(this.filter).predicate(predicate)
        return ASeqOperator(this, async function* filter(input) {
            yield* aseq(input).concatMap(async (element, index) =>
                (await pull(predicate(element, index))) ? [element] : []
            )
        })
    }

    /**
     * 🦥**Lazily** finds the first element in `this` async sequence.
     *
     * @returns A 🦥{@link DoddleAsync} resolving to the first element or `undefined` if none match.
     */
    first(): DoddleAsync<T | undefined>
    /**
     * 🦥**Lazily** finds the first element in `this` async sequence that matches the given
     * predicate, by iterating over it.
     *
     * @param predicate The predicate used to find the element.
     * @param alt Alternative value to return if no element matches. Defaults to `undefined`.
     * @returns A 🦥{@link DoddleAsync} that resolves to the first matching element or the
     *   alternative value.
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
     * 🦥**Lazily** gets the last element in `this` sequence, or `undefined`.
     *
     * @returns A 🦥{@link Doddle} that resolves to the last element in `this` sequence, or
     *   `undefined`.
     */
    last(): DoddleAsync<T | undefined>
    /**
     * 🦥**Lazily** finds the last element in `this` sequence that matches the given predicate, by
     * iterating over it.
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
     * 🦥**Lazily** transforms `this` async sequence into a record keyed by projection, by iterating
     * over it.
     *
     * @param projection A function mapping each element to a `[key, value]` tuple.
     * @returns A 🦥{@link DoddleAsync} that resolves to a record of accumulated key/value pairs.
     */
    toRecord<const Key extends PropertyKey, Value>(
        projection: ASeq.Iteratee<T, readonly [Key, Value]>
    ): DoddleAsync<Record<Key, Value>> {
        return seqPrototype.toRecord.call(this, projection as any) as any
    }

    /**
     * Casts the async sequence to a new generic type.
     *
     * @template S The new element type.
     * @returns This sequence typed as `ASeq<S>`.
     */
    as<S>() {
        return this as any as ASeq<S>
    }

    /**
     * Groups elements of `this` async sequence by a key projection, emitting `[key, groupSequence]`
     * pairs in insertion order.
     *
     * @param keyProjection A function mapping each element to its grouping key.
     * @returns A new async sequence of groups, each as a `[key, ASeq<T>]` tuple.
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
     * 🦥**Lazily** checks if `value` is included in `this` async sequence, by iterating over it.
     *
     * @param value The value to search for.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if found, or `false` otherwise.
     */
    includes<T extends S, S>(this: ASeq<T>, value: S): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if `value` is included in `this` async sequence, by iterating over it.
     *
     * @param value The value to search for.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if found, or `false` otherwise.
     */
    includes<S extends T>(value: S): DoddleAsync<boolean>

    includes<S extends T>(value: S): DoddleAsync<boolean> {
        return seqPrototype.includes.call(this, value) as any
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
            yield* aseq(input).concatMap(async (element, index) => [
                (await pull(projection(element, index))) as S
            ])
        })
    }

    /**
     * 🦥**Lazily** finds the maximum element in `this` sequence by key, or the given alternative
     * value if the sequence is empty.
     *
     * @param projection The projection function to apply to each element so it can be compared.
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     */
    maxBy<K, const Alt = undefined>(
        projection: ASeq.Iteratee<T, K>,
        alt?: Alt
    ): DoddleAsync<T | Alt>

    maxBy<R>(projection: ASeq.Iteratee<T, R>, alt?: any) {
        return seqPrototype.maxBy.call(this, projection, alt)
    }

    /**
     * 🦥**Lazily** finds the minimum element in `this` sequence, or the given alternative value if
     * the sequence is empty.
     *
     * @param projection The projection function to apply to each element so it can be compared.
     * @param alt The value to return if the sequence is empty. Defaults to `undefined`.
     * @returns A 🦥{@link DoddleAsync} that resolves to the element with the minimum key, or `alt`
     *   if the sequence is empty.
     */
    minBy<K, const Alt = undefined>(
        projection: ASeq.Iteratee<T, K>,
        alt?: Alt
    ): DoddleAsync<T | Alt>

    minBy<K>(projection: ASeq.Iteratee<T, K>, alt?: any) {
        return seqPrototype.minBy.call(this, projection, alt)
    }
    /**
     * Orders the elements of `this` sequence by key, using the given key projection. Has to iterate
     * over the entire sequence.
     *
     * @param projection A projection that returns a key to order by.
     * @param descending Whether to use descending order.
     * @returns A new sequence with the elements ordered by the given key.
     */
    orderBy<S>(projection: ASeq.NoIndexIteratee<T, S>, descending?: boolean): ASeq<T>

    /**
     * Orders the elements of `this` using the given mutli-key tuple projection. The keys are
     * compared in the order they appear. Has to iterate over the entire sequence.
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
            yield* await aseq(input)
                .map(e => returnKvp(input, projection(e), e) as any)
                .toArray()
                .map(async xs => {
                    void xs.sort(compareKey)
                    return xs.map(x => x[1])
                })
                .pull()
        })
    }

    /**
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction. Uses
     * the first element as the initial value.
     *
     * @param reducer The reduction to apply to each element.
     * @returns A 🦥{@link DoddleAsync} that yields the reduced value.
     */
    reduce(reducer: ASeq.Reducer<T, T>): DoddleAsync<T>
    /**
     * 🦥**Lazily** reduces `this` sequence to a single value by applying the given reduction, using
     * the given initial value.
     *
     * @param reducer A function combining the accumulator and each element.
     * @param initial The initial value to start the reduction with.
     * @returns A 🦥{@link DoddleAsync} that yields the reduced value.
     */
    reduce<Acc>(reducer: ASeq.Reducer<T, Acc>, initial: Acc): DoddleAsync<Acc>
    reduce<Acc>(reducer: ASeq.Reducer<T, Acc>, initial?: Acc): any {
        return seqPrototype.reduce.call(this, reducer as any, initial)
    }

    /**
     * Reverses `this` sequence. Iterates over the entire sequence before yielding.
     *
     * @returns A new sequence with the elements in reverse order.
     */
    reverse(): ASeq<T> {
        return ASeqOperator(this, async function* reverse(input) {
            yield* await aseq(input)
                .toArray()
                .map(x => x.reverse())
                .pull()
        })
    }

    /**
     * Executes a side effect action once before any elements are yielded, but after iteration has
     * begun.
     *
     * @param action A function to invoke before any elements are yielded.
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
     * Executes a side-effect action after all elements have been yielded, but before iteration
     * finishes.
     *
     * @param action A function to invoke after iteration completes.
     * @returns A new async sequence that acts like `this` but invokes `action` before it's
     *   finished.
     */
    after(action: ASeq.NoInputAction): ASeq<T> {
        chk(this.after).action(action)
        return ASeqOperator(this, async function* after(input) {
            yield* input
            await pull(action())
        })
    }
    /**
     * When iteration starts, will immediately iterate over everything in `this` async sequence.
     * Yields the same elements as `this`.
     *
     * @returns An async sequence that collects all elements into memory before yielding anything.
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
     * Concatenates `others` before `this` sequence. `others` are concatenated in the order they
     * appear.
     *
     * @param others The sequences that will appear before `this` sequence.
     * @returns A new async sequence with all of `others` followed by `this`.
     */
    concatTo<Seqs extends ASeq.Input<any>[]>(
        ...others: Seqs
    ): ASeq<T | ASeq.ElementOfInput<Seqs[number]>> {
        return aseq([]).concat(...others, this) as any
    }

    /**
     * Applies a reducer over the sequence. Returns a sequence that yields the accumulated value at
     * each step.
     *
     * @param reducer A function combining accumulator and element to produce a new accumulator.
     *   Uses the first element as the initial value.
     * @returns A new async sequence of accumulated values, using the first element as initial
     *   accumulator.
     * @throws If `this` is empty.
     */
    scan(reducer: ASeq.Reducer<T, T>): ASeq<T>
    /**
     * Applies a reduction to each element of `this` sequence, yielding the accumulated value at
     * each step.
     *
     * @param reduction The reduction function to apply.
     * @param initial The initial value to start the reduction with.
     */
    scan<Acc>(reducer: ASeq.Reducer<T, Acc>, initial: Acc): ASeq<Acc>
    scan<Acc>(reducer: ASeq.Reducer<T, Acc>, initial?: Acc): ASeq<any> {
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
     * 🦥**Lazily** checks if the elements of `this` sequence are all sequentially equal to the
     * elements in the `input` by iterating over both.
     *
     * @param input The sequential input to compare with.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`.
     */
    seqEquals<T extends S, S>(this: AsyncIterable<T>, input: ASeq.Input<S>): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if the elements of `this` sequence are all equal to the elements in the
     * `input` by iterating over both.
     *
     * @param input The sequential input to compare with.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`.
     */
    seqEquals<S extends T>(input: ASeq.Input<S>): DoddleAsync<boolean>
    /**
     * 🦥**Lazily** checks if the elements of `this` sequence are all equal to the elements in the
     * `input`, by iterating over both.
     *
     * The elements are compared by key, using the given key projection.
     *
     * @param input The sequential input to compare with.
     * @param projection The projection function that determines the key for comparison.
     * @returns A 🦥{@link Doddle} that resolves to `true` if all elements are equal, or `false`
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
     * 🦥**Lazily** counts the number of elements in `this` sequence by iterating over it.
     *
     * @returns A 🦥{@link Doddle} that resolves to the number of elements in `this`.
     */
    count(): DoddleAsync<number>
    /**
     * 🦥**Lazily** counts the number of elements in `this` sequence that match the given predicate,
     * by iterating over it.
     *
     * @param predicate The predicate used to test each element.
     * @returns A 🦥{@link Doddle} that resolves to the number of matching elements.
     */
    count(predicate: ASeq.Predicate<T>): DoddleAsync<number>
    count(predicate?: ASeq.Predicate<T>): DoddleAsync<number> {
        return seqPrototype.count.call(this, predicate as any) as any
    }

    /** {@link concatMap} */
    flatMap = this.concatMap
    /**
     * Compares `this` sequence to another as sets of projected keys, ignoring order.
     *
     * @param _other The sequence to compare against.
     * @returns A 🦥{@link DoddleAsync} resolving to `true` if the sets match.
     */
    setEquals<S extends T>(_other: ASeq.Input<S>): DoddleAsync<boolean>

    /**
     * Compares `this` sequence to another as sets of projected keys, ignoring order.
     *
     * @param other The sequence to compare against.
     * @returns A 🦥{@link DoddleAsync} resolving to `true` if the sets match.
     */
    setEquals<T extends S, S>(this: AsyncIterable<T>, _other: ASeq.Input<S>): DoddleAsync<boolean>
    /**
     * Compares `this` sequence to another as sets of projected keys, ignoring order.
     *
     * @param other The sequence to compare against.
     * @param projection Function to extract comparison key. Defaults to identity.
     * @returns A 🦥{@link DoddleAsync} resolving to `true` if the sets match.
     */
    setEquals<K, S = T>(
        _other: ASeq.Input<NoInfer<S>>,
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
     * Shuffles all elements of `this` sequence by collecting them, randomizing order, then
     * emitting.
     *
     * @returns A new async sequence of shuffled elements.
     */
    shuffle(): ASeq<T> {
        return ASeqOperator(this, async function* shuffle(input) {
            const array = await aseq(input).toArray().pull()
            shuffleArray(array)
            yield* array
        })
    }
    /**
     * Skips elements of `this` async sequence as long as the predicate returns true.
     *
     * @param predicate A function to test each element. Elements are skipped while this returns
     *   true.
     * @param options Optional settings. If `options.skipFinal` is `true`, the first element for
     *   which the predicate returns false is also skipped.
     * @returns A new async sequence of elements after skipping.
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
     * Skips a fixed number of elements from the start or end of the sequence.
     *
     * @param count The number of elements to skip. If positive, skips the first `count` elements;
     *   if negative, skips the last `-count` elements.
     * @returns A new async sequence after skipping the specified elements.
     */
    skip(count: number): ASeq<T> {
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
                        return SPECIAL
                    })
                    .filter(x => x !== SPECIAL)
            } else {
                yield* aseq(input).skipWhile((_, index) => index < myCount)
            }
        }) as any
    }

    /**
     * 🦥**Lazily** checks if at least one element in `this` async sequence satisfies the predicate.
     *
     * @param predicate A function to test each element.
     * @returns A 🦥{@link DoddleAsync} that resolves to `true` if any element matches the predicate,
     *   or `false` otherwise.
     */
    some(predicate: ASeq.Predicate<T>): DoddleAsync<boolean> {
        return seqPrototype.some.call(this, predicate as any) as any
    }

    /**
     * 🦥**Lazily** computes the sum of numeric values projected from each element.
     *
     * @param projection A function mapping each element to a number or promise of a number.
     * @returns A 🦥{@link DoddleAsync} that resolves to the sum of all projected values.
     */
    sumBy(projection: ASeq.Iteratee<T, number>): DoddleAsync<number> {
        return seqPrototype.sumBy.call(this, projection as any) as any
    }

    /**
     * Takes elements from the sequence while the predicate returns true.
     *
     * @param predicate A function to test each element. Elements are taken while this returns true.
     * @param specifier Optional settings. If `specifier.takeFinal` is `true`, includes the first
     *   element for which the predicate returns false before stopping.
     * @returns A new async sequence of elements taken.
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
     * Takes a fixed number of elements from the start or end of the sequence.
     *
     * @param count The number of elements to take. If positive, takes the first `count` elements;
     *   if negative, takes the last `-count` elements.
     * @returns A new async sequence of taken elements.
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
                yield* aseq(input).takeWhile((_, index) => index < myCount - 1, {
                    takeFinal: true
                })
            }
        }) as any
    }

    /**
     * Computes the Cartesian product of `this` async sequence with one or more other sequences,
     * optionally applying a projection function.
     *
     * @param _others An array of other sequences to include in the product.
     * @param projection Optional function to map each combination of elements to a result value.
     * @returns A new async sequence of tuples or projected values representing the Cartesian
     *   product.
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
     * Collects all elements of `this` async sequence into an array and returns it.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to an array of all elements.
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
     * Shares a single consumption of the sequence among multiple async iterators.
     *
     * @returns A new async sequence that multiplexes the original sequence to multiple consumers,
     *   reading the source only once.
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
     * 🦥**Lazily** transforms `this` async sequence into a `Map` by collecting all key/value pairs
     * produced by the projection.
     *
     * @param kvpProjection A function mapping each element to a `[key, value]` tuple.
     * @returns A 🦥{@link DoddleAsync} that resolves to a `Map` of all projected key/value pairs.
     */
    toMap<K, V>(kvpProjection: ASeq.Iteratee<T, readonly [K, V]>): DoddleAsync<Map<K, V>> {
        return seqPrototype.toMap.call(this, kvpProjection as any) as any
    }

    /**
     * Collects all elements of `this` async sequence into a `Set` and returns it.
     *
     * @returns A 🦥{@link DoddleAsync} that resolves to a `Set` of all elements.
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
     * Yields only the first occurrence of each element (or projected key) in `this` async sequence.
     *
     * @param projection A function mapping each element to a key for uniqueness. Defaults to
     *   identity.
     * @returns A new async sequence containing unique elements based on the projection.
     */
    uniq(projection: ASeq.NoIndexIteratee<T, any> = x => x): ASeq<T> {
        chk(this.uniq).projection(projection)
        return ASeqOperator(this, async function* uniq(input) {
            const seen = new Set<any>()
            for await (const element of input) {
                const key = await pull(projection(element))
                if (!seen.has(key)) {
                    seen.add(key)
                    yield element
                }
            }
        }) as any
    }

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
        projection: (...window: getWindowArgsType<T, L>) => Doddle.MaybePromised<S>
    ): ASeq<S>
    /**
     * Splits `this` async sequence into overlapping windows of fixed size.
     *
     * @param size The size of each window. The last window may be smaller.
     * @returns A new async sequence of window arrays.
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
     * Zips `this` async sequence with other sequences, yielding arrays of parallel elements,
     * optionally applying a projection.
     *
     * @param others An array of other sequence inputs to zip with.
     * @returns A new async sequence of tuples containing parallel elements.
     */
    zip<Xs extends [any, ...any[]]>(others: { [K in keyof Xs]: Seq.Input<Xs[K]> }): ASeq<
        getZipValuesType<[T, ...Xs]>
    >
    /**
     * Zips `this` async sequence with other sequences, yielding arrays of parallel elements,
     * optionally applying a projection.
     *
     * @param _others An array of other sequence inputs to zip with.
     * @param projection A function mapping each tuple of elements to a value or promise of a value.
     * @returns A new async sequence of projected zipped values.
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

    /**
     * **Lazily** converts `this` async sequence into a `Seq` by collecting all elements into an
     * array.
     *
     * @returns A new sync sequence containing all elements of `this` async sequence.
     */
    toSeq(): DoddleAsync<Seq<T>> {
        return lazyOperator(this, async function toSeq(input) {
            const all = await aseq(input).toArray().pull()
            return seq(all)
        })
    }
}
/** @internal */
export const ASeqOperator = function aseq<In, Out>(
    operand: In,
    impl: (input: In) => AsyncIterable<Out>
): ASeq<Out> {
    const obj = Object.assign(new (ASeq as any)(), [impl.name, operand])
    Object.defineProperty(obj, Symbol.asyncIterator, {
        get: () => impl.bind(obj, obj[1])
    })
    return obj
}
/**
 * A collection of type definitions for asynchronous sequence operations in Doddle.
 *
 * @category Types
 */
export namespace ASeq {
    /**
     * An iteratee that receives only the index and returns a value or promise of a value. Useful
     * for operations that depend solely on element position.
     *
     * @template O The output type.
     */
    export type IndexIteratee<O> = (index: number) => Doddle.MaybePromised<O>

    /**
     * A function applied to each element and its index, producing a value or promise of a value.
     * Used in most transformation and filtering operations.
     *
     * @template E The input element type.
     * @template O The output value type.
     */
    export type Iteratee<E, O> = (element: E, index: number) => Doddle.MaybePromised<O>

    /**
     * A specialized iteratee that projects elements to property keys.
     *
     * @template E The input element type.
     * @template K The key type extending PropertyKey.
     */
    export type PropertyKeyIteratee<E, K extends PropertyKey> = Iteratee<E, K>

    /**
     * An iteratee that ignores the index and returns a value or promise.
     *
     * @template E The input element type.
     * @template O The output value type.
     */
    export type NoIndexIteratee<E, O> = (element: E) => Doddle.MaybePromised<O>

    /**
     * A function called at stages "before" or "after" yielding an element.
     *
     * @template E The input element type.
     * @template O The output type, typically used for side-effects.
     */
    export type StageIteratee<E, O> = (
        element: E,
        index: number,
        stage: "before" | "after"
    ) => Doddle.MaybePromised<O>

    /**
     * A predicate function over elements, returning boolean or promise of boolean.
     *
     * @template E The input element type.
     */
    export type Predicate<E> = Iteratee<E, boolean>

    /**
     * A reducer function combining an accumulator and element to produce a new accumulator.
     *
     * @template E The element type.
     * @template O The accumulator type.
     */
    export type Reducer<E, O> = (acc: O, element: E, index: number) => Doddle.MaybePromised<O>

    /**
     * Extracts the element type from a sequence-like input.
     *
     * @template T The input sequence type.
     */
    export type ElementOfInput<T> = T extends Input<infer E> ? E : never

    /**
     * Represents any supported iterable or iterator type for async sequences.
     *
     * @template E The element type.
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
     * @template E The element type.
     */
    export type FunctionInput<E> = () => Doddle.MaybePromised<IterableOrIterator<E>>

    /**
     * A non-async iterable-like input that may emit promises of elements.
     *
     * @template E The element type.
     */
    export type DesyncedInput<E> = Seq.ObjectIterable<MaybePromise<E>>

    /**
     * A union of supported sequence inputs: desynced input, AsyncIterable, or ReadableStream.
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
        | MaybeDoddle<IterableInput<E>>
        | DoddleAsync<IterableInput<E>>
        | FunctionInput<E>

    /**
     * The general input type for an async sequence, allowing promises of values.
     *
     * @template E The element type (may be a promise of something).
     */
    export type Input<E> = SimpleInput<MaybePromise<E>>

    /** A zero-argument action for side-effects that may return a doddle-wrapped value. */
    export type NoInputAction = () => MaybeDoddle<MaybePromise<unknown>>

    /**
     * A grouped output pairing a key with a sub-sequence of elements.
     *
     * @template K The group key type.
     * @template T The element type within the group.
     */
    export type Group<K, T> = readonly [K, ASeq<T>]
}
