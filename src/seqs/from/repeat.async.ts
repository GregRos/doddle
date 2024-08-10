import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"
import { chk } from "../seq/load-checkers.js"
import syncRepeat from "./repeat.sync.js"
function repeat<T>(times: number, value: T): ASeq<T> {
    chk(repeat).times(times)
    return aseq(syncRepeat(times, value))
}
export default repeat
