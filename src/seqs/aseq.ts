import { chk, loadCheckers } from "../errors/error.js"
import { pull } from "../lazy/index.js"
import { getThrownError, isFunction } from "../utils.js"
import { ASeq, ASeqOperator } from "./aseq.class.js"
import { aseq as aseqBase } from "./aseq.ctor.js"
import { seq } from "./seq.js"
const Builders = {
    iterate<T>(count: number, projection: ASeq.IndexIteratee<T>): ASeq<T> {
        chk(this.iterate).count(count)
        chk(this.iterate).projection(projection)
        return aseq(async function* () {
            for (let i = 0; i < count; i++) {
                yield pull(projection(i)) as T
            }
        })
    },
    of<T>(...items: T[]): ASeq<T> {
        return aseq(items)
    },
    range(start: number, end: number, size = 1) {
        chk(this.range).size(size)
        chk(this.range).start(start)
        chk(this.range).end(end)
        return aseq(seq.range(start, end, size))
    },
    empty<T = never>(): ASeq<T> {
        return aseq([])
    },
    repeat<T>(times: number, value: T): ASeq<T> {
        chk(this.repeat).times(times)
        return aseq(seq.repeat(times, value))
    },
    is<T = unknown>(input: any): input is ASeq<T> {
        return input[Symbol.toStringTag] === "ASeq" && isFunction(input.map)
    },
    throws<T = never>(thrower: () => Error): ASeq<T> {
        thrower = chk(this.throws).thrower(thrower)
        return ASeqOperator(thrower, async function* throws(input) {
            const result = input()
            throw getThrownError(result)
        })
    }
}
export const aseq = Object.assign(aseqBase, Builders)
loadCheckers(aseq)
