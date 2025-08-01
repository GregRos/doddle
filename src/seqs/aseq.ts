import { pull } from "../doddle/index.js"
import { chk, loadCheckers } from "../errors/error.js"
import { assign, getClassName, getThrownError, isFunction, isObject } from "../utils.js"
import { ASeq, ASeqOperator } from "./aseq.class.js"
import { ___aseq } from "./aseq.ctor.js"
import { seq } from "./seq.js"
const Builders = {
    /**
     * Creates an {@link ASeq} of items by iterating a projection function.
     *
     * @param count Number of items to iterate.
     * @param projection Function that receives the index and returns the item for that index,
     *   possibly asynchronously.
     * @returns An {@link ASeq} of the generated items.
     */
    iterate<T>(count: number, projection: ASeq.IndexIteratee<T>): ASeq<T> {
        const c = chk(this.iterate)
        c.count(count)
        c.projection(projection)
        return ___aseq(async function* () {
            for (let i = 0; i < count; i++) {
                yield pull(projection(i)) as T
            }
        })
    },

    /**
     * Creates an {@link ASeq} of items from the provided values.
     *
     * @param items Values to include in the {@link ASeq}.
     * @returns An {@link ASeq} of the provided items.
     */
    of<const Items extends any[]>(...items: Items): ASeq<Items extends (infer E)[] ? E : never> {
        return ___aseq(items)
    },

    /**
     * Creates an {@link ASeq} of numbers in the specified range.
     *
     * @param start Starting number of the range.
     * @param end Ending number of the range (exclusive).
     * @param size Step size for the range. Defaults to 1.
     * @returns An {@link ASeq} of numbers in the specified range.
     */
    range(start: number, end: number, size = 1): ASeq<number> {
        const c = chk(this.range)
        c.size(size)
        c.start(start)
        c.end(end)
        return ___aseq(seq.range(start, end, size))
    },

    /**
     * Creates an empty {@link ASeq}.
     *
     * @returns An empty {@link ASeq}.
     */
    empty<T = never>(): ASeq<T> {
        return ___aseq([])
    },

    /**
     * Creates an {@link ASeq} that repeats the specified value a given number of times.
     *
     * @param times Number of times to repeat the value.
     * @param value Value to repeat.
     * @returns An {@link ASeq} that contains the repeated value.
     */
    repeat<T>(times: number, value: T): ASeq<T> {
        chk(this.repeat).times(times)
        return ___aseq(seq.repeat(times, value))
    },

    /**
     * Checks if the provided input is an {@link ASeq}.
     *
     * @param input Input to check.
     * @returns `true` if the input is an {@link ASeq}, otherwise `false`.
     */
    is<T = unknown>(input: any): input is ASeq<T> {
        return isObject(input) && getClassName(input) === "ASeq" && isFunction(input.map)
    },

    /**
     * Creates an {@link ASeq} that throws an error when iterated.
     *
     * @param thrower Function that returns the error to throw.
     * @returns An {@link ASeq} that throws the specified error when iterated.
     */
    throws<T = never>(thrower: () => Error): ASeq<T> {
        thrower = chk(this.throws).thrower(thrower)
        return ASeqOperator(thrower, async function* throws(input) {
            const result = input()
            throw getThrownError(result)
        })
    }
}
export const aseq = loadCheckers(assign(___aseq, Builders))
