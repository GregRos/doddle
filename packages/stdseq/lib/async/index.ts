import { aseq as aseqWrapper } from "./aseq"
import { aseqs } from "./aseqs"

export { ASeq } from "./async-wrapper"

export const aseq = Object.assign(aseqWrapper, aseqs)
