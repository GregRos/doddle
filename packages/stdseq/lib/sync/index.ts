import { seq as seqWrapper } from "./seq"
import { seqs } from "./seqs"
export { seqs } from "./seqs"
export { Seq } from "./sync-wrapper"
export const seq = Object.assign(seqWrapper, {
    range: seqs.range,
    repeat: seqs.repeat,
    of: seqs.of,
    empty: seqs.empty
})
