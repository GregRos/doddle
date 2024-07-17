import { aseq as aseqWrapper } from "./aseq"
import { aseqs } from "./aseqs"

export { ASeq } from "./async-wrapper"
export { ASeqLike } from "./types"
export const aseq = Object.assign(aseqWrapper, aseqs)
