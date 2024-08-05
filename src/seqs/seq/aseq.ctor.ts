import { async as asyncIterate } from "../from/iterate"
import { async as asyncOf } from "../from/of"
import { async as asyncRange } from "../from/range"
import { async as asyncRepeat } from "../from/repeat"
import { async as asyncThrows } from "../from/throws"
import { type ASeq } from "./aseq.class"
import { aseq as aseqBase } from "./aseq.ctor.base"
import { aseqSymbol } from "./symbol"

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
