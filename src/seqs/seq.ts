import { chk, loadCheckers } from "../errors/error.js"
import { assign, getClassName, getThrownError, isFunction, isObject, sign } from "../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"
import { ___seq } from "./seq.ctor.js"
const Builders = {
    /**
     * Creates a {@link Seq} of items by iterating a projection function.
     *
     * @param count Number of items to iterate
     * @param projection Function that receives the index and returns the item for that index.
     * @returns A {@link Seq} of the generated items.
     */
    iterate<T>(count: number, projection: Seq.IndexIteratee<T>): Seq<T> {
        const c = chk(this.iterate)
        c.count(count)
        c.projection(projection)
        return ___seq(function* () {
            for (let i = 0; i < count; i++) {
                yield projection(i)
            }
        })
    },
    /**
     * Creates a {@link Seq} of items from the provided values.
     *
     * @param items Values to include in the {@link Seq}.
     * @returns A {@link Seq} of the provided items.
     */
    of<const Items extends any[]>(...items: Items): Seq<Items extends (infer E)[] ? E : never> {
        return ___seq(items)
    },
    /**
     * Creates a {@link Seq} of numbers in the specified range.
     *
     * @param start Starting number of the range.
     * @param end Ending number of the range (exclusive).
     * @param size Step size for the range. Defaults to 1.
     * @returns A {@link Seq} of numbers in the specified range.
     */
    range(start: number, end: number, size = 1) {
        const c = chk(this.range)
        c.size(size)
        c.start(start)
        c.end(end)
        const direction = sign(end - start)
        return ___seq(function* range() {
            for (let i = start; direction * i < direction * end; i += direction * size) {
                yield i
            }
        })
    },
    /**
     * Creates a {@link Seq} that repeats the specified value a given number of times.
     *
     * @param times Number of times to repeat the value.
     * @param value Value to repeat.
     * @returns A {@link Seq} that contains the repeated value.
     */
    repeat<T>(times: number, value: T): Seq<T> {
        return ___seq(function* () {
            for (let i = 0; i < times; i++) {
                yield value
            }
        })
    },
    /**
     * Checks if the provided input is a {@link Seq}.
     *
     * @template T Type of items in the {@link Seq}.
     * @param input Input to check.
     * @returns `true` if the input is a {@link Seq}, otherwise `false`.
     */
    empty<T = never>(): Seq<T> {
        return ___seq([])
    },
    /**
     * Checks if the provided input is a {@link Seq}.
     *
     * @template T Type of items in the {@link Seq}.
     * @param input Input to check.
     * @returns `true` if the input is a {@link Seq}, otherwise `false`.
     */
    is<T = unknown>(input: any): input is Seq<T> {
        return isObject(input) && getClassName(input) === "Seq" && isFunction(input.map)
    },
    /**
     * Creates a {@link Seq} that throws an error when iterated.
     *
     * @param thrower Function that returns the error to throw.
     * @returns A {@link Seq} that throws the specified error when iterated.
     */
    throws<T = never>(thrower: () => Error): Seq<T> {
        thrower = chk(this.throws).thrower(thrower)
        return SeqOperator(thrower, function* throws(input) {
            const result = input()
            throw getThrownError(result)
        })
    }
}
export const seq = loadCheckers(assign(___seq, Builders))
