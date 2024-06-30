import { seq as seqWrapper } from "./seq"
import { seqs } from "./seqs"
export { Seq } from "./sync-wrapper"
export const seq = Object.assign(seqWrapper, {
    empty: seqs.empty,
    of: seqs.of,
    inf: seqs.inf,
    range: seqs.range,
    repeat: seqs.repeat,
    cycle: seqs.cycle,
    repeatedly: seqs.repeatedly
})
