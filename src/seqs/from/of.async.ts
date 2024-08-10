import type { ASeq } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function of<T>(...items: T[]): ASeq<T> {
    return aseq(items)
}
export default of
