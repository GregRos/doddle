import { chk, loadCheckers } from "../errors/error.js"
import { getThrownError, isFunction, isObject } from "../utils.js"
import { SeqOperator, type Seq } from "./seq.class.js"
import { ___seq } from "./seq.ctor.js"
const Builders = {
    iterate<T>(count: number, projection: Seq.IndexIteratee<T>): Seq<T> {
        chk(this.iterate).count(count)
        chk(this.iterate).projection(projection)
        return ___seq(function* () {
            for (let i = 0; i < count; i++) {
                yield projection(i)
            }
        })
    },
    of<const Items extends any[]>(...items: Items): Seq<Items extends (infer E)[] ? E : never> {
        return ___seq(items)
    },
    range(start: number, end: number, size = 1) {
        chk(this.range).size(size)
        chk(this.range).start(start)
        chk(this.range).end(end)
        const direction = Math.sign(end - start)
        return ___seq(function* range() {
            for (let i = start; direction * i < direction * end; i += direction * size) {
                yield i
            }
        })
    },
    repeat<T>(times: number, value: T): Seq<T> {
        return ___seq(function* () {
            for (let i = 0; i < times; i++) {
                yield value
            }
        })
    },
    empty<T = never>(): Seq<T> {
        return ___seq([])
    },
    is<T = unknown>(input: any): input is Seq<T> {
        return isObject(input) && input[Symbol.toStringTag] === "Seq" && isFunction(input.map)
    },
    throws<T = never>(thrower: () => Error): Seq<T> {
        thrower = chk(this.throws).thrower(thrower)
        return SeqOperator(thrower, function* throws(input) {
            const result = input()
            throw getThrownError(result)
        })
    }
}
export const seq = loadCheckers(Object.assign(___seq, Builders))
