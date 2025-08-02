import { pull, type Doddle } from "../doddle/index.js"
import {
    checkSeqInputValue,
    chk,
    gotAsyncIteratorInSyncContext,
    loadCheckers
} from "../errors/error.js"
import {
    _iter,
    getClassName,
    isArrayLike,
    isFunction,
    isInt,
    isIterable,
    isNextable,
    isObject,
    isThenable
} from "../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"

/**
 * Creates a {@link Seq} from the provided input. See examples for usage.
 *
 * @example
 *     // Array
 *     seq([1, 2, 3]) // {1, 2, 3}
 *
 *     // Generator function
 *     seq(function* () {
 *         yield 1
 *         yield 2
 *     })
 *
 *     // Doddle yielding a sequence
 *     seq(doddle(() => [1, 2, 3]))
 *
 *     // Function returning a sequence
 *     seq(() => [1, 2, 3])
 *
 *     // An iterable
 *     seq(seq([1, 2, 3]))
 *
 *     // An array-like object, such as a NodeList:
 *     seq(document.getElementsByTagName("div"))
 *
 *     // An ITERATOR, which is a special case that will be cached.
 *     seq(seq([1, 2, 3])[Symbol.iterator]())
 *
 *     // ⛔ Strings are not allowed here
 *     seq("hello")
 *
 * @param input The input to create the {@link Seq} from.
 */
export function seq(input: readonly never[]): Seq<never>
export function seq<E>(input: Seq.ObjectIterable<Doddle<E>>): Seq<E>
export function seq<E>(input: readonly E[]): Seq<E>
export function seq<E>(input: Seq.Input<E>): Seq<E>
export function seq<E>(input: Seq.Input<E>): any {
    input = checkSeqInputValue(input)
    if (isNextable(input)) {
        return seq(() => input).cache()
    }
    if (isIterable(input) || isArrayLike(input)) {
        return seq(() => input)
    }

    return SeqOperator(input, function* seq(input) {
        const invoked = typeof input === "function" ? input() : input
        let pulled = pull(invoked)
        if (isArrayLike(pulled)) {
            for (const key of Object.keys(pulled)) {
                if (isInt(+key)) {
                    yield pull(pulled[+key])
                }
            }
            return
        }
        if (isIterable(pulled)) {
            pulled = _iter(pulled)
        }
        for (let item = pulled.next(); !item.done; item = pulled.next()) {
            if (isThenable(item)) {
                gotAsyncIteratorInSyncContext()
            }
            yield pull(item.value)
        }
        pulled.return?.()
    })
}

export namespace seq {
    /**
     * Creates a {@link Seq} of items by iterating a projection function.
     *
     * @param count Number of items to iterate
     * @param projection Function that receives the index and returns the item for that index.
     * @returns A {@link Seq} of the generated items.
     */
    export function iterate<T>(count: number, projection: Seq.IndexIteratee<T>): Seq<T> {
        const c = chk(iterate)
        c.count(count)
        c.projection(projection)
        return seq(function* () {
            for (let i = 0; i < count; i++) {
                yield projection(i)
            }
        })
    }

    /**
     * Creates a {@link Seq} of items from the provided values.
     *
     * @param items Values to include in the {@link Seq}.
     * @returns A {@link Seq} of the provided items.
     */
    export function of<const Items extends any[]>(
        ...items: Items
    ): Seq<Items extends (infer E)[] ? E : never> {
        return seq(items)
    }

    /**
     * Creates a {@link Seq} of numbers in the specified range.
     *
     * @param start Starting number of the range.
     * @param end Ending number of the range (exclusive).
     * @param size Step size for the range. Defaults to 1.
     * @returns A {@link Seq} of numbers in the specified range.
     */
    export function range(start: number, end: number, size = 1) {
        const c = chk(range)
        c.size(size)
        c.start(start)
        c.end(end)
        const direction = Math.sign(end - start)
        return seq(function* range() {
            for (let i = start; direction * i < direction * end; i += direction * size) {
                yield i
            }
        })
    }

    /**
     * Creates a {@link Seq} that repeats the specified value a given number of times.
     *
     * @param times Number of times to repeat the value.
     * @param value Value to repeat.
     * @returns A {@link Seq} that contains the repeated value.
     */
    export function repeat<T>(times: number, value: T): Seq<T> {
        return seq(function* () {
            for (let i = 0; i < times; i++) {
                yield value
            }
        })
    }

    /**
     * Checks if the provided input is a {@link Seq}.
     *
     * @template T Type of items in the {@link Seq}.
     * @param input Input to check.
     * @returns `true` if the input is a {@link Seq}, otherwise `false`.
     */
    export function empty<T = never>(): Seq<T> {
        return seq([])
    }

    /**
     * Checks if the provided input is a {@link Seq}.
     *
     * @template T Type of items in the {@link Seq}.
     * @param input Input to check.
     * @returns `true` if the input is a {@link Seq}, otherwise `false`.
     */
    export function is<T = unknown>(input: any): input is Seq<T> {
        return isObject(input) && getClassName(input) === "Seq" && isFunction(input.map)
    }

    /**
     * Creates a {@link Seq} that throws an error when iterated.
     *
     * @param thrower Function that returns the error to throw.
     * @returns A {@link Seq} that throws the specified error when iterated.
     */
    export function throws<T = never>(thrower: () => Error): Seq<T> {
        thrower = chk(throws).thrower(thrower)
        return SeqOperator(thrower, function* throws(input) {
            const result = input()
            throw result
        })
    }
}
loadCheckers(seq)
