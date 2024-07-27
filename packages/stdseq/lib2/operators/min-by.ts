import { mustBeFunction } from "../errors/error"
import { AsyncIteratee, Iteratee } from "../f-types/index"
import { lazyFromOperator } from "../from/operator"
import { aseq } from "../seq/aseq.ctor"
import type { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"
import { returnKvp } from "../special/utils"

export function generic<T, K>(input: Seq<T>, iteratee: Iteratee<T, K>) {
    mustBeFunction("iteratee", iteratee)
    return lazyFromOperator("minBy", input, input => {
        return input
            .map((element, index) => {
                return returnKvp(input, iteratee(element, index), element)
            })
            .reduce((min: any, value) => {
                return min.key < value.key ? min : value
            })
            .pull()
    })
}

export function sync<T, K>(this: Iterable<T>, iteratee: Iteratee<T, K>) {
    return generic(seq(this), iteratee)
}
export function async<T, K>(this: AsyncIterable<T>, iteratee: AsyncIteratee<T, K>) {
    return generic(aseq(this) as any, iteratee as any)
}
