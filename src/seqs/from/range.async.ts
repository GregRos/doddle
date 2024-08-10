import { aseq } from "../seq/aseq.ctor.js"
import { chk } from "../seq/load-checkers.js"
import { seq } from "../seq/seq.js"

function range(start: number, end: number, size = 1) {
    chk(range).size(size)
    chk(range).start(start)
    chk(range).end(end)
    return aseq(seq.range(start, end, size))
}
export default range
