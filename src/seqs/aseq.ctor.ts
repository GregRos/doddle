import { pull, type Doddle, type DoddleAsync } from "../doddle/index.js"
import { checkASeqInputValue, chk, loadCheckers } from "../errors/error.js"
import {
    _xiter,
    isArrayLike,
    isAsyncIterable,
    isInt,
    isIterable,
    isNextable,
    isReadableStream,
    type MaybePromise
} from "../utils.js"
import { ASeq, ASeqOperator } from "./aseq.class.js"
import { seq } from "./seq.ctor.js"
/**
 * Creates a {@link ASeq} from the sequential input. See examples for usage.
 *
 * @category Create
 * @example
 *     // An array
 *     aseq([1, 2, 3])
 *
 *     // A generator function
 *     aseq(function* () {
 *         yield 1
 *         yield 2
 *     })
 *
 *     // An async generator function
 *     aseq(async function* () {
 *         yield 1
 *         yield 2
 *     })
 *
 *     // An array-like object, such as a NodeList:
 *     seq(document.getElementsByTagName("div"))
 *
 *     // A readable stream
 *     const response = await fetch("https://example.com/data")
 *     aseq(response.body!)
 *
 *     // An async function returning a sequence
 *     aseq(async () => [1, 2, 3])
 *
 *     // A Doddle yielding a sequence
 *     aseq(doddle(() => [1, 2, 3]))
 *
 *     // An async Doddle yielding a sequence
 *     aseq(doddle(async () => [1, 2, 3]))
 *
 *     // An iterable
 *     aseq(seq([1, 2, 3]))
 *
 *     // An async iterable
 *     aseq(aseq([1, 2, 3]))
 *
 *     // An async function returning an async iterable
 *     aseq(async () => aseq([1, 2, 3]))
 *
 *     // ⛔ Strings are not allowed here.
 *     seq("hello")
 *
 * @param input The input to create the {@link ASeq} from.
 */
export function aseq<E>(input: readonly E[]): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Promise<DoddleAsync<E>>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<DoddleAsync<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Promise<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<Doddle<E>>): ASeq<E>
export function aseq<E>(input: ASeq.SimpleInput<MaybePromise<E>>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): ASeq<E>
export function aseq<E>(input: ASeq.Input<E>): any {
    function fromFunctionResult(input: ReturnType<ASeq.FunctionInput<MaybePromise<E>>>): ASeq<E> {
        return ASeqOperator(input, async function* aseq(input) {
            const pulled = await pull(input)
            if (isAsyncIterable(pulled) || isIterable(pulled)) {
                var iterator = _xiter(pulled)
            } else if (isArrayLike(pulled)) {
                for (const key of Object.keys(pulled)) {
                    if (isInt(+key)) {
                        yield pull(pulled[+key])
                    }
                }
                return
            } else {
                iterator = pulled as any
            }
            for (let item = await iterator.next(); !item.done; item = await iterator.next()) {
                yield pull(item.value)
            }
            await iterator.return?.()
        }) as ASeq<E>
    }
    input = checkASeqInputValue(input)
    if (isNextable(input) || isReadableStream(input)) {
        // readable streams are basically iterators
        return fromFunctionResult(input as any).cache()
    }
    if (isAsyncIterable(input) || isIterable(input)) {
        return aseq(() => input)
    }

    return ASeqOperator(input, async function* aseq(input) {
        const result = typeof input === "function" ? await input() : input
        const pulled = await pull(result)
        if (isNextable(pulled) || isReadableStream(pulled)) {
            yield* fromFunctionResult(pulled as any).cache()
        }
        yield* fromFunctionResult(pulled as any)
    })
}

/**
 * Tools for creating {@link ASeq} instances.
 *
 * @category Create
 * @class
 */
export namespace aseq {
    /**
     * Creates an {@link ASeq} of items by iterating a projection function.
     *
     * @param count Number of items to iterate.
     * @param projection Function that receives the index and returns the item for that index,
     *   possibly asynchronously.
     * @returns An {@link ASeq} of the generated items.
     */
    export function iterate<T>(count: number, projection: ASeq.IndexIteratee<T>): ASeq<T> {
        const c = chk(iterate)
        c.count(count)
        c.projection(projection)
        return aseq(async function* () {
            for (let i = 0; i < count; i++) {
                yield pull(projection(i)) as T
            }
        })
    }

    /**
     * Creates an {@link ASeq} of numbers in the specified range.
     *
     * @param start Starting number of the range.
     * @param end Ending number of the range (exclusive).
     * @param size Step size for the range. Defaults to 1.
     * @returns An {@link ASeq} of numbers in the specified range.
     */
    export function range(start: number, end: number, size = 1): ASeq<number> {
        const c = chk(range)
        c.size(size)
        c.start(start)
        c.end(end)
        return aseq(seq.range(start, end, size))
    }

    /**
     * Checks if the provided input is an {@link ASeq}.
     *
     * @param input Input to check.
     * @returns `true` if the input is an {@link ASeq}, otherwise `false`.
     */
    export function is<T = unknown>(input: any): input is ASeq<T> {
        return input instanceof ASeq
    }

    /**
     * Creates an {@link ASeq} that throws an error when iterated.
     *
     * @param thrower Function that returns the error to throw.
     * @returns An {@link ASeq} that throws the specified error when iterated.
     */
    export function throws<T = never>(thrower: () => Error): ASeq<T> {
        thrower = chk(throws).thrower(thrower)
        return aseq(() => {
            throw thrower()
        })
    }
}

loadCheckers(aseq)
