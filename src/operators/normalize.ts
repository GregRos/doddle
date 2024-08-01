import { result } from "lodash"
import { gotNonIterable } from "../errors/error"
import { isAsyncIterable, isIterable, isLazy, isNextable, isThenable } from "../lazy"
import type { aseq } from "../seq/aseq.ctor"
import { asyncOperator } from "../seq/aseq.class"
import { syncOperator } from "../seq/seq.class"
import type { Seq } from "../seq/seq.class"