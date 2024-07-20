import { aseq, seq } from "../ctors"
import { lazyFromOperator } from "../from/operator"
import _find from "./find"

const _at = {
    name: "at",
    sync<T>(this: Iterable<any>, index: number) {
        return seq(this).find((_, i) => i === index)
    },
    async<T>(this: AsyncIterable<any>, index: number) {
        return lazyFromOperator(_at, this, async input => {
            return await aseq(input)
                .find((_, i) => i === index)
                .pull()
        })
    }
}

export default _at
