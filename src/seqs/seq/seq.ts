import iterate from "../from/iterate.sync.js"
import of from "../from/of.sync.js"
import range from "../from/range.sync.js"
import repeat from "../from/repeat.sync.js"
import throws from "../from/throws.sync.js"
import { loadCheckers } from "./load-checkers.js"
import { type Seq } from "./seq.class.js"
import { seq as seqBase } from "./seq.ctor.js"
import { seqSymbol } from "./symbol.js"

export const seq = Object.assign(seqBase, {
    of: of,
    repeat: repeat,
    range: range,
    is<T = unknown>(input: any): input is Seq<T> {
        return seqSymbol in input && input[seqSymbol] === true
    },
    iterate: iterate,
    throws: throws
})

loadCheckers(seq)
