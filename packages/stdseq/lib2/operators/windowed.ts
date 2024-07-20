import { aseq, seq } from "../ctors"
import { asyncFromOperator, lazyFromOperator, syncFromOperator } from "../from/operator"
import type { getTuple } from "../type-functions/get-tuple"
import type { ASeq, Seq } from "../wrappers"
import _find from "./find"

const _windowed = {
    name: "windowed",
    sync<T, L extends number>(this: Iterable<T>, windowSize: L): Seq<getTuple<T, L>> {
        return syncFromOperator(_windowed, this, function* (input) {
            let result = new Array<T>()
            for (const element of input) {
                result.push(element)
                if (result.length === windowSize) {
                    yield result as getTuple<T, L>
                    result = result.slice(1)
                }
            }
        })
    },
    async<T, L extends number>(this: AsyncIterable<T>, windowSize: L): ASeq<getTuple<T, L>> {
        return asyncFromOperator(_windowed, this, async function* (input) {
            let result = [] as T[]
            for await (const element of input) {
                result.push(element)
                if (result.length === windowSize) {
                    yield result as getTuple<T, L>
                    result = result.slice(1)
                }
            }
        })
    }
}

export default _windowed
