import { pull, type Doddle } from "../doddle/index.js"
import {
    checkSeqInputValue,
    chk,
    gotAsyncIteratorInSyncContext,
    loadCheckers
} from "../errors/error.js"
import { _iter, isArrayLike, isInt, isIterable, isNextable, isThenable } from "../utils.js"
import { Seq, SeqOperator } from "./seq.class.js"

/**
 * Creates a {@link Seq} from the provided input. See examples for usage.
 *
 * @category Create
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

/**
 * Tools for creating {@link Seq} instances.
 *
 * @category Create
 * @example
 *     seq.range(0, 10) // { 0 .. 10 }
 *     seq.iterate(5, i => i * 2) // { 0, 2, 4, 6, 8 }
 */
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
     * Creates a {@link Seq} from the own, enumerable, string key-value pairs of an object, evaluated
     * lazily.
     *
     * @template Object Type of the source object.
     * @param source Source object to create the {@link Seq} from.
     * @returns A {@link Seq} of key-value pairs from the source object.
     */
    export function fromObject<Object extends object>(
        source: Object
    ): Seq<[keyof Object & string, Object[keyof Object]]> {
        const c = chk(fromObject)
        c.source(source)
        return seq(() => Object.keys(source)).map(key => [key, (source as any)[key]]) as any
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
     * Checks if the provided input is a {@link Seq}.
     *
     * @template T Type of items in the {@link Seq}.
     * @param input Input to check.
     * @returns `true` if the input is a {@link Seq}, otherwise `false`.
     */
    export function is<T = unknown>(input: any): input is Seq<T> {
        return input instanceof Seq
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
