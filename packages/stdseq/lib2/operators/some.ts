import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import { aseq, seq } from "../ctors"

const _some = {
    name: "some",
    sync<T>(this: Iterable<T>, predicate: Iteratee<T, boolean>) {
        return lazyFromOperator(_some, this, input => {
            const unset = {} as any
            return seq(input).find(predicate, unset) !== unset
        })
    },
    async<T>(this: AsyncIterable<T>, predicate: AsyncIteratee<T, boolean>) {
        return lazyFromOperator(_some, this, async input => {
            const unset = {} as any
            return (await aseq(input).find(predicate, unset).pull()) !== unset
        })
    }
}

export default _some
