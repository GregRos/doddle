import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type Reducer, type AsyncReducer } from "../f-types/index"

const _zip = {
    name: "zip",
    sync<T, Xs extends any[]>(
        this: Iterable<T>,
        ...others: {
            [K in keyof Xs]: Iterable<Xs[K]>
        }
    ) {
        return syncFromOperator(_zip, this, function* (input) {
            const iterators = [input, ...others].map(i => i[Symbol.iterator]())
            while (true) {
                const results = iterators.map(i => i.next())
                if (results.some(r => r.done)) {
                    break
                }
                yield results.map(r => r.value)
            }
        })
    },
    async<T, Xs extends any[]>(
        this: AsyncIterable<T>,
        ...others: {
            [K in keyof Xs]: AsyncIterable<Xs[K]>
        }
    ) {
        return asyncFromOperator(_zip, this, async function* (input) {
            const iterators = [input, ...others].map(i => i[Symbol.asyncIterator]())
            while (true) {
                const results = await Promise.all(iterators.map(async i => i.next()))
                if (results.some(r => r.done)) {
                    break
                }
                yield results.map(r => r.value) as any
            }
        })
    }
}

export default _zip
