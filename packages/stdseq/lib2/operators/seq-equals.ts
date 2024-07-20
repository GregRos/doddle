import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee } from "../f-types/index"

const _seqEquals = {
    name: "seqEquals",
    sync<T>(
        this: Iterable<T>,
        other: Iterable<T>,
        eq: (a: T, b: T) => boolean = (a, b) => a === b
    ) {
        return lazyFromOperator(_seqEquals, this, input => {
            const otherIterator = other[Symbol.iterator]()
            for (const element of input) {
                const otherElement = otherIterator.next()
                if (otherElement.done || !eq(element, otherElement.value)) {
                    return false
                }
            }
            return otherIterator.next().done
        })
    },
    async<T>(
        this: AsyncIterable<T>,
        other: AsyncIterable<T>,
        eq: (a: T, b: T) => boolean = (a, b) => a === b
    ) {
        return lazyFromOperator(_seqEquals, this, async input => {
            const otherIterator = other[Symbol.asyncIterator]()
            for await (const element of input) {
                const otherElement = await otherIterator.next()
                if (otherElement.done || !eq(element, otherElement.value)) {
                    return false
                }
            }
            return (await otherIterator.next()).done
        })
    }
}

export default _seqEquals
