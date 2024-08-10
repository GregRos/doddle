import { chk } from "../seq/_seq.js"
import type { ASeq } from "../seq/aseq.class.js"
import { ASeqOperator } from "../seq/aseq.class.js"
function scan<Item>(this: AsyncIterable<Item>, reducer: ASeq.Reducer<Item, Item>): ASeq<Item>
function scan<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial: Acc
): ASeq<Acc>
function scan<Item, Acc>(
    this: AsyncIterable<Item>,
    reducer: ASeq.Reducer<Item, Acc>,
    initial?: Acc
) {
    chk(scan).reducer(reducer)
    return ASeqOperator(this, async function* scan(input) {
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
export default scan
