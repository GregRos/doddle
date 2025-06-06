import { pull } from "../doddle/index.js"
import { chk, loadCheckers } from "../errors/error.js"
import { getClassName, getThrownError, isFunction, isObject } from "../utils.js"
import { ASeq, ASeqOperator } from "./aseq.class.js"
import { ___aseq } from "./aseq.ctor.js"
import { seq } from "./seq.js"
const Builders = {
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
    of<const Items extends any[]>(...items: Items): ASeq<Items extends (infer E)[] ? E : never> {
        return ___aseq(items)
    },

    range(start: number, end: number, size = 1) {
        const c = chk(this.range)
        c.size(size)
        c.start(start)
        c.end(end)
        return ___aseq(seq.range(start, end, size))
    },
    empty<T = never>(): ASeq<T> {
        return ___aseq([])
    },
    repeat<T>(times: number, value: T): ASeq<T> {
        chk(this.repeat).times(times)
        return ___aseq(seq.repeat(times, value))
    },
    is<T = unknown>(input: any): input is ASeq<T> {
        return isObject(input) && getClassName(input) === "ASeq" && isFunction(input.map)
    },
    throws<T = never>(thrower: () => Error): ASeq<T> {
        thrower = chk(this.throws).thrower(thrower)
        return ASeqOperator(thrower, async function* throws(input) {
            const result = input()
            throw getThrownError(result)
        })
    }
}
export const aseq = loadCheckers(Object.assign(___aseq, Builders))
