import { sync as syncIterate } from "../from/iterate.js"
import { sync as syncOf } from "../from/of.js"
import { sync as syncRange } from "../from/range.js"
import { sync as syncRepeat } from "../from/repeat.js"
import { sync as syncThrows } from "../from/throws.js"
import { loadCheckers } from "./load-checkers.js"
import { type Seq } from "./seq.class.js"
import { seq as seqBase } from "./seq.ctor.js"
import { seqSymbol } from "./symbol.js"

export const seq = Object.assign(seqBase, {
    of: syncOf,
    repeat: syncRepeat,
    range: syncRange,
    is<T = unknown>(input: any): input is Seq<T> {
        return seqSymbol in input && input[seqSymbol] === true
    },
    iterate: syncIterate,
    throws: syncThrows
})

loadCheckers(seq)
