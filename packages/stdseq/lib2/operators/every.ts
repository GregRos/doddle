import { lazyFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"
import _some from "./some"
import { aseq } from "../ctors"

const _every = {
    name: "every",
    sync<T>(this: Iterable<T>, predicate: Iteratee<T, boolean>) {
        return lazyFromOperator(_every, this, async input => {
            return !(_some.sync<T>)
                .call(this, (element, index) => !predicate(element, index))
                .pull()
        })
    },
    async<T>(this: AsyncIterable<T>, predicate: AsyncIteratee<T, boolean>) {
        return lazyFromOperator(_every, this, async input => {
            return !(await aseq(input)
                .some(async (element, index) => !(await predicate(element, index)))
                .pull())
        })
    }
}

export default _every
