import { sync as syncOf } from "../from/of"
import { sync as syncRange } from "../from/range"
import { sync as syncRepeat } from "../from/repeat"
import { sync as syncFrom } from "../from/input"
import { sync as syncIterate } from "../from/iterate"
import { sync as syncThrows } from "../from/throws"
import type { Lazy } from "../../lazy"
import { type Seq } from "./seq.class"
import { seqSymbol } from "./symbol"
import { seq as seqBase } from "./seq.ctor.base"

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
