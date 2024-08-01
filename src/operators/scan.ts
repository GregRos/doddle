import { mustBeFunction } from "../errors/error"
import { type AsyncReducer, type Reducer } from "../f-types/index"
import { asyncFromOperator, syncFromOperator } from "../from/operator"
import type { ASeq } from "../seq/aseq.class"
import type { Seq } from "../seq/seq.class"

export function sync<Item>(
    this: Iterable<Item>,
    reducer: Reducer<NoInfer<Item>, NoInfer<Item>>
): Seq<Item>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Reducer<NoInfer<Item>, Acc>,
    initial: Acc
): Seq<Acc>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Reducer<NoInfer<Item>, Acc>,
    initial?: Acc
) {
    mustBeFunction("reducer", reducer)

    return syncFromOperator("scan", this, function* (input) {
        let hasAcc = initial !== undefined

        let acc: Acc = initial as any
        let index = 0
        if (hasAcc) {
            yield acc
        }
        for (const element of input) {
            if (!hasAcc) {
                acc = element as any
                hasAcc = true
            } else {
                acc = reducer(acc, element, index++)
            }

            yield acc
        }
    })
}

export function async<Item>(
    this: AsyncIterable<Item>,
    reducer: AsyncReducer<Item, Item>
): ASeq<Item>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: AsyncReducer<Item, Acc>,
    initial: Acc
): ASeq<Acc>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: AsyncReducer<Item, Acc>,
    initial?: Acc
) {
    mustBeFunction("reducer", reducer)
    return asyncFromOperator("scan", this, async function* (input) {
        let hasAcc = initial !== undefined

        let acc: Acc = initial as any
        let index = 0
        if (hasAcc) {
            yield acc
        }
        for await (const element of input) {
            if (!hasAcc) {
                acc = element as any
                hasAcc = true
            } else {
                acc = await reducer(acc, element, index++)
            }

            yield acc
        }
    })
}
