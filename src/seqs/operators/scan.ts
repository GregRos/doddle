import { mustBeFunction } from "../../errors/error.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"

export function sync<Item>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<NoInfer<Item>, NoInfer<Item>>
): Seq<Item>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<NoInfer<Item>, Acc>,
    initial: Acc
): Seq<Acc>
export function sync<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<NoInfer<Item>, Acc>,
    initial?: Acc
) {
    mustBeFunction("reducer", reducer)

    return SeqOperator(this, function* scan(input) {
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
    reducer: ASeq.Reducer<Item, Item>
): ASeq<Item>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial: Acc
): ASeq<Acc>
export function async<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial?: Acc
) {
    mustBeFunction("reducer", reducer)
    return new ASeqOperator(this, async function* scan(input) {
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
