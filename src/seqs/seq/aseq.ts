import iterate from "../from/iterate.async.js"
import of from "../from/of.async.js"
import range from "../from/range.async.js"
import repeat from "../from/repeat.async.js"
import throws from "../from/throws.async.js"
import { type ASeq } from "./aseq.class.js"
import { aseq as aseqBase } from "./aseq.ctor.js"
import { loadCheckers } from "./load-checkers.js"
import { aseqSymbol } from "./symbol.js"

export const aseq = Object.assign(aseqBase, {
    of: of,
    repeat: repeat,
    range: range,
    is<T = unknown>(input: any): input is ASeq<T> {
        return aseqSymbol in input && input[aseqSymbol] === true
    },
    iterate: iterate,
    throws: throws
})

loadCheckers(aseq)
