import { lazyFromOperator, asyncFromOperator, syncFromOperator } from "../from/operator"
import { Iteratee, AsyncIteratee, type Reducer, type AsyncReducer } from "../f-types/index"
import type { ASeq, Seq } from "../wrappers"

const _scan = new (class scan {
    name = "scan"
    sync<Item>(this: Iterable<Item>, reducer: Reducer<Item, Item>): Seq<Item>
    sync<Item, Acc>(this: Iterable<Item>, reducer: Reducer<Item, Acc>, initial: Acc): Seq<Acc>
    sync<Item, Acc>(this: Iterable<Item>, reducer: Reducer<Item, Acc>, initial?: Acc) {
        const hasInitial = initial != undefined
        return syncFromOperator(_scan, this, function* (input) {
            let acc: Acc = initial as any
            let index = 0
            for (const element of input) {
                if (!hasInitial && index === 0) {
                    acc = element as any
                }
                acc = reducer(acc, element, index++)
                yield acc
            }
        })
    }

    async<Item>(this: AsyncIterable<Item>, reducer: AsyncReducer<Item, Item>): ASeq<Item>
    async<Item, Acc>(
        this: AsyncIterable<Item>,
        reducer: AsyncReducer<Item, Acc>,
        initial: Acc
    ): ASeq<Acc>
    async<Item, Acc>(this: AsyncIterable<Item>, reducer: AsyncReducer<Item, Acc>, initial?: Acc) {
        return asyncFromOperator(_scan, this, async function* (input) {
            let acc = initial
            let index = 0
            for await (const element of input) {
                if (acc == undefined && index === 0) {
                    acc = element as any
                } else {
                    acc = await reducer(acc!, element, index++)
                }

                yield acc
            }
        })
    }
})()

export default _scan
