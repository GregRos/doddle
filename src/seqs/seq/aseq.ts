import { async as asyncIterate } from "../from/iterate.js"
import { async as asyncOf } from "../from/of.js"
import { async as asyncRange } from "../from/range.js"
import { async as asyncRepeat } from "../from/repeat.js"
import { async as asyncThrows } from "../from/throws.js"
import { type ASeq } from "./aseq.class.js"
import { aseq as aseqBase } from "./aseq.ctor.js"
import { loadCheckers } from "./load-checkers.js"
import { aseqSymbol } from "./symbol.js"

export const aseq = Object.assign(aseqBase, {
    of: asyncOf,
    repeat: asyncRepeat,
    range: asyncRange,
    is<T = unknown>(input: any): input is ASeq<T> {
        return aseqSymbol in input && input[aseqSymbol] === true
    },
    iterate: asyncIterate,
    throws: asyncThrows
})

loadCheckers(aseq)
