import { seq as seqWrapper } from "./seq"
import { seqs } from "./seqs"
export { Seq } from "./sync-wrapper"
export const seq = Object.assign(seqWrapper, seqs)
