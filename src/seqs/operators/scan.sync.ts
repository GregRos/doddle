import { chk } from "../seq/_seq.js"
import type { Seq } from "../seq/seq.class.js"
import { SeqOperator } from "../seq/seq.class.js"
function scan<Item>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<NoInfer<Item>, NoInfer<Item>>
): Seq<Item>
function scan<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<NoInfer<Item>, Acc>,
    initial: Acc
): Seq<Acc>
function scan<Item, Acc>(
    this: Iterable<Item>,
    reducer: Seq.Reducer<NoInfer<Item>, Acc>,
    initial?: Acc
) {
    chk(scan).reducer(reducer)
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
export default scan
